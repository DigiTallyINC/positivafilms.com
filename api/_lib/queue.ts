/**
 * Parses content/queue.md.
 *
 * Format expected (per content/AGENT.md):
 *   - [ ] category: <cat> | type: LUT|BROADER | title: **Title** | intent: "..."
 *   - [x] 2026-04-22 | slug: my-slug | category: <cat> | title: **Title**
 *
 * The cron picks the FIRST `[ ]` line in `## Queued` (top-down).
 */

export type QueuedTopic = {
  /** Full original line, used to find-and-replace when marking published */
  rawLine: string;
  /** Index of the line within the file (zero-based) */
  lineIndex: number;
  category: string;
  type?: "LUT" | "BROADER";
  title: string;
  intent: string;
};

export type PublishedEntry = {
  date: string;
  slug: string;
  title: string;
  category: string;
};

const TITLE_RE = /title:\s*\*\*(.+?)\*\*/;
const CAT_RE = /category:\s*([a-z]+)/i;
const TYPE_RE = /type:\s*(LUT|BROADER)/i;
const INTENT_RE = /intent:\s*(.+)$/;

export function parseQueue(md: string): {
  next: QueuedTopic | null;
  published: PublishedEntry[];
  totalQueued: number;
} {
  const lines = md.split(/\r?\n/);

  let next: QueuedTopic | null = null;
  let totalQueued = 0;
  const published: PublishedEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("- [ ]")) {
      totalQueued++;
      if (next) continue;
      const title = TITLE_RE.exec(line)?.[1]?.trim();
      const category = CAT_RE.exec(line)?.[1]?.trim().toLowerCase();
      const type = (TYPE_RE.exec(line)?.[1]?.toUpperCase() as "LUT" | "BROADER" | undefined);
      const intent = INTENT_RE.exec(line)?.[1]?.trim() || "";
      if (!title || !category) continue;
      next = { rawLine: line, lineIndex: i, category, type, title, intent };
    } else if (line.startsWith("- [x]")) {
      const dateMatch = /\[x\]\s*(\d{4}-\d{2}-\d{2})/.exec(line);
      const slugMatch = /slug:\s*([a-z0-9-]+)/.exec(line);
      const titleMatch = TITLE_RE.exec(line);
      const catMatch = CAT_RE.exec(line);
      if (dateMatch && slugMatch && titleMatch && catMatch) {
        published.push({
          date: dateMatch[1],
          slug: slugMatch[1],
          title: titleMatch[1].trim(),
          category: catMatch[1].trim().toLowerCase(),
        });
      }
    }
  }

  return { next, published, totalQueued };
}

/**
 * Mark a queued line as published: change `- [ ]` to `- [x] <date> | slug: <slug> | <rest>`
 * AND move it from `## Queued` to `## Published`.
 *
 * Strategy: remove the line at lineIndex; insert the published version after the
 * `## Published` heading line (newest first).
 */
export function markPublished(opts: {
  md: string;
  topic: QueuedTopic;
  slug: string;
  isoDate: string;
}): string {
  const { md, topic, slug, isoDate } = opts;
  const lines = md.split(/\r?\n/);

  const publishedLine = `- [x] ${isoDate} | slug: ${slug} | category: ${topic.category} | title: **${topic.title}**`;

  // Remove the queued line
  lines.splice(topic.lineIndex, 1);

  // Find the "## Published" heading
  const pubHeadingIdx = lines.findIndex((l) => l.trim() === "## Published");
  if (pubHeadingIdx === -1) {
    // Should never happen — queue.md has it. Fallback: append at file end.
    lines.push("", "## Published", "", publishedLine);
  } else {
    // Insert after the heading + the comment block; find the first non-comment, non-blank line after heading
    let insertAt = pubHeadingIdx + 1;
    while (
      insertAt < lines.length &&
      (lines[insertAt].trim() === "" ||
        lines[insertAt].trim().startsWith("<!--") ||
        lines[insertAt].includes("-->"))
    ) {
      insertAt++;
    }
    lines.splice(insertAt, 0, publishedLine);
  }

  return lines.join("\n");
}
