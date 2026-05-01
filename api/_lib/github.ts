import { Octokit } from "@octokit/rest";

export type FileChange = { path: string; content: string };

export function gh() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: token });
}

export const REPO = {
  owner: process.env.GITHUB_OWNER || "DigiTallyINC",
  repo: process.env.GITHUB_REPO || "positivafilms.com",
  branch: process.env.GITHUB_BRANCH || "master",
};

/** Fetch a file from the configured branch as UTF-8 text. */
export async function readFile(path: string): Promise<string> {
  const o = gh();
  const res = await o.repos.getContent({
    owner: REPO.owner,
    repo: REPO.repo,
    path,
    ref: REPO.branch,
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
}): Promise<{ commitSha: string; commitUrl: string }> {
  const o = gh();
  const { owner, repo, branch } = REPO;

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
