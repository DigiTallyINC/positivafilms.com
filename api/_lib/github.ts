import { Octokit } from "@octokit/rest";

export type FileChange = { path: string; content: string };

export function gh() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: token });
}

export type RepoTarget = { owner: string; repo: string; branch: string };

export const REPO: RepoTarget = {
  owner: process.env.GITHUB_OWNER || "DigiTallyINC",
  repo: process.env.GITHUB_REPO || "positivafilms.com",
  branch: process.env.GITHUB_BRANCH || "master",
};

/**
 * The bharometer.com landing repo — dual-publish target for Bharometer posts.
 * NOTE: the live site lives on the v2-fidelity-parity branch (origin/main is
 * stale, 380+ commits behind). If that branch ever merges to main, update the
 * default here or set GITHUB_BHAROMETER_BRANCH in the Vercel env.
 */
export const BHAROMETER_REPO: RepoTarget = {
  owner: process.env.GITHUB_OWNER || "DigiTallyINC",
  repo: process.env.GITHUB_BHAROMETER_REPO || "bharometer",
  branch: process.env.GITHUB_BHAROMETER_BRANCH || "v2-fidelity-parity",
};

/**
 * The Gyaan Daily site repo — ROUTING target for Gyaan Daily posts.
 * NOTE: unlike Bharometer this is not a mirror. Gyaan Daily posts publish HERE
 * ONLY; positivafilms.com never gains a copy, so a failure here means the post
 * does not exist anywhere. Commit here FIRST, mark the queue second.
 * The site lives in web/ (Vercel Root Directory), so every path is web/-prefixed.
 */
export const GYAANDAILY_REPO: RepoTarget = {
  owner: process.env.GITHUB_OWNER || "DigiTallyINC",
  repo: process.env.GITHUB_GYAANDAILY_REPO || "gyaan-daily",
  branch: process.env.GITHUB_GYAANDAILY_BRANCH || "main",
};

/**
 * Does this path exist on the branch? Used as an idempotency guard: a run that
 * committed its post and then failed before marking the queue would otherwise
 * republish the same topic on the next fire, over the top of the live post.
 * A missing file is a clean `false`; any other failure is re-thrown, because
 * "I could not tell" must never be mistaken for "it is not there".
 */
export async function fileExists(path: string, target: RepoTarget = REPO): Promise<boolean> {
  try {
    await gh().repos.getContent({ owner: target.owner, repo: target.repo, path, ref: target.branch });
    return true;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) return false;
    throw err;
  }
}

/** Fetch a file from the configured branch as UTF-8 text. */
export async function readFile(path: string, target: RepoTarget = REPO): Promise<string> {
  const o = gh();
  const res = await o.repos.getContent({
    owner: target.owner,
    repo: target.repo,
    path,
    ref: target.branch,
  });
  if (Array.isArray(res.data) || res.data.type !== "file") {
    throw new Error(`${path} is not a file`);
  }
  return Buffer.from(res.data.content, "base64").toString("utf-8");
}

/** Atomically commit multiple file changes (creates/updates) in one commit via the Trees API. */
export async function commitFiles(opts: {
  files: FileChange[];
  message: string;
  target?: RepoTarget;
}): Promise<{ commitSha: string; commitUrl: string }> {
  const o = gh();
  const { owner, repo, branch } = opts.target ?? REPO;

  const ref = await o.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const headSha = ref.data.object.sha;

  const head = await o.git.getCommit({ owner, repo, commit_sha: headSha });
  const baseTreeSha = head.data.tree.sha;

  const blobs = await Promise.all(
    opts.files.map((f) =>
      o.git
        .createBlob({
          owner,
          repo,
          content: Buffer.from(f.content, "utf-8").toString("base64"),
          encoding: "base64",
        })
        .then((r) => ({
          path: f.path,
          mode: "100644" as const,
          type: "blob" as const,
          sha: r.data.sha,
        })),
    ),
  );

  const tree = await o.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: blobs,
  });

  const commit = await o.git.createCommit({
    owner,
    repo,
    message: opts.message,
    tree: tree.data.sha,
    parents: [headSha],
  });

  await o.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.data.sha,
  });

  return { commitSha: commit.data.sha, commitUrl: commit.data.html_url };
}
