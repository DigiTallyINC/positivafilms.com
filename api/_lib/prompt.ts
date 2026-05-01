import type { QueuedTopic, PublishedEntry } from "./queue.js";

/**
 * Build the system prompt — pulls voice/structure rules from the live AGENT.md
 * so the runbook remains the single source of truth that the human can edit.
 *
 * `agentMd` is the full content of content/AGENT.md.
 */
export function systemPrompt(agentMd: string): string {
  return `You are a senior working filmmaker — a Director of Photography fluent across Indian wedding, documentary, travel, and aerial cinematography, and the technical craft of capture, color science, and post. You write for peers and serious learners with the authority of someone who has done the work hundreds of times. You are not a brand voice; you are not a startup. You are a craftsperson explaining craft.

The site you are publishing to is positivafilms.com. The post you write must NEVER refer to "Positiva Films," "our team," "our studio," or any first-person-plural-as-brand framing inside the body. The bottom CTA box handles all brand reference.

Below is the project's live runbook. Honor every rule. When the runbook conflicts with anything else, the runbook wins.

---

${agentMd}

---

When you call the \`publish_post\` tool, output ONLY the structured arguments. The tool's input schema is your delivery format. Do not return prose outside the tool call.`;
}

/**
 * Build the user message with the topic, recent posts to avoid duplication, and date.
 */
export function userPrompt(opts: {
  topic: QueuedTopic;
  publishedDescending: PublishedEntry[];
  isoDate: string;
  prettyDate: string;
}): string {
  const { topic, publishedDescending, isoDate, prettyDate } = opts;

  const recent = publishedDescending.slice(0, 6).map((p) => `- ${p.title} (${p.date}, ${p.category})`).join("\n");

  return `Today's publication date: **${prettyDate}** (${isoDate}).

Today's topic from the queue:

- Title: **${topic.title}**
- Category: \`${topic.category}\`
- Type: ${topic.type || "GENERAL"}
- Search intent we want to rank for: ${topic.intent || "(none specified)"}

Already published recently — avoid repeating their hooks, opening images, or near-identical phrasing:

${recent || "(none yet)"}

Write the post now. Length 1100–1700 words. Authoritative second-person voice. Show your work — node trees, exact slider values, real camera/codec names, real venue/location names where the topic invites it. Insert exactly one inline-cta block roughly 60–70% through the body.

When ready, submit via the \`publish_post\` tool.`;
}

/**
 * Tool schema for the model to call. Anthropic's API will validate output against this.
 */
export const PUBLISH_TOOL = {
  name: "publish_post",
  description:
    "Submit the finished blog post for publication. Provide structured fields — the publishing system renders them into the static template.",
  input_schema: {
    type: "object" as const,
    required: ["slug", "excerpt", "lede", "body_html", "keywords", "data_search", "category_label", "cta"],
    properties: {
      slug: {
        type: "string",
        description:
          "URL slug derived from the title. Lowercase, hyphenated, max ~70 chars, no leading stop-words.",
      },
      excerpt: {
        type: "string",
        description:
          "140–180 character hook. Used in meta description, OG description, and the blog card excerpt. No leading 'In this post...'",
      },
      lede: {
        type: "string",
        description:
          "1–2 sentence opening lede shown in italic above the body. Sets the problem. Plain text, no HTML.",
      },
      body_html: {
        type: "string",
        description:
          "The full post body as HTML. Allowed tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <pre>, <code>, <strong>, <em>, <a>, <hr>. MUST include exactly one inline-cta block at ~60–70% through the body, with this exact structure: <div class=\"inline-cta\"><div class=\"inline-cta-text\"><div class=\"inline-cta-eyebrow\">From the Positiva LUT Library</div><h4>PACK_NAME</h4><p>ONE_LINE_PITCH</p></div><a class=\"btn\" href=\"../luts.html#PACK_ANCHOR\">View Pack →</a></div>. PACK_NAME is one of: 'Indian Wedding LUTs', 'Indian Travel LUTs', 'The Positiva Bundle'. PACK_ANCHOR is one of: 'wedding', 'travel', 'bundle'. Pitch must connect to THIS post's specific problem.",
      },
      keywords: {
        type: "string",
        description: "Comma-separated, ~6 keyword phrases for the meta keywords tag.",
      },
      data_search: {
        type: "string",
        description:
          "lowercase keywords for client-side search filtering. ~15–25 words. Include camera names, location names, technical terms, category. Pack densely.",
      },
      category_label: {
        type: "string",
        enum: ["Indian Wedding", "Travel & Place", "Craft & Color", "Gear", "Aerial & FPV", "Field Notes"],
        description: "Display label that matches the queue category. Maps as: wedding → Indian Wedding, travel → Travel & Place, craft → Craft & Color, gear → Gear, aerial → Aerial & FPV, field → Field Notes.",
      },
      cta: {
        type: "object",
        required: ["pack", "headline", "sub", "body", "button"],
        description: "Bottom cream-section CTA pointing to the relevant LUT pack.",
        properties: {
          pack: {
            type: "string",
            enum: ["wedding", "travel", "bundle"],
            description:
              "Which LUT pack. Wedding posts → wedding. Travel/place posts → travel. Craft/gear/aerial/field/multicam → bundle.",
          },
          headline: {
            type: "string",
            description:
              "Bold uppercase headline for the cream CTA box. ~2–4 words. Vary per post — do not reuse phrasing.",
          },
          sub: {
            type: "string",
            description:
              "Italic-serif sub-headline shown below the main headline. ~3–6 words.",
          },
          body: {
            type: "string",
            description:
              "Body paragraph for the CTA. ~25–50 words. Connect to the post's specific problem and explain what the pack delivers.",
          },
          button: {
            type: "string",
            description: "Button label. ~2–4 words. Examples: 'Get the Bundle', 'Browse Wedding LUTs'.",
          },
        },
      },
    },
  },
} as const;
