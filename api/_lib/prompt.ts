import type { QueuedTopic, PublishedEntry } from "./queue.js";

/**
 * Hard-banned AI-slop phrases. Single source of truth: injected into the system
 * prompt AND enforced by validateOutput in blog-generate.ts (case-insensitive
 * substring match — publication fails loudly if any appears).
 * Only near-zero-false-positive phrases belong here.
 */
export const SLOP_PHRASES: readonly string[] = [
  "delve",
  "game-changer",
  "game changer",
  "game-changing",
  "in today's fast",
  "in this article",
  "in this post",
  "in this guide",
  "look no further",
  "say goodbye to",
  "say hello to",
  "welcome to the world",
  "the world of",
  "unleash",
  "revolutioniz",
  "elevate your",
  "supercharge",
  "to the next level",
  "buckle up",
  "let's dive",
  "dive into",
  "let's explore",
  "whether you're a",
  "whether you are a",
  "in conclusion",
  "wrapping up,",
  "it's not just about",
  "isn't just about",
  "isn't just a",
  "is more than just",
  "here's the kicker",
  "the best part?",
  "but wait",
  "enter:",
  "seamlessly",
  "effortlessly",
  "hassle-free",
  "a breeze",
  "treasure trove",
  "tapestry",
  "testament to",
  "in the ever-evolving",
  "ever-changing landscape",
  "digital age",
  "🚀",
  "✨",
];

/**
 * Build the system prompt — pulls voice/structure rules from the live AGENT.md
 * so the runbook remains the single source of truth that the human can edit.
 *
 * `agentMd` is the full content of content/AGENT.md.
 */
export function systemPrompt(agentMd: string): string {
  return `You are a senior working filmmaker, a Director of Photography fluent across Indian wedding, documentary, travel, and aerial cinematography, and the technical craft of capture, color science, and post. The same studio also builds software: iPhone/Android apps and DaVinci Resolve tools, made by working craftspeople for real daily problems. When the topic is an APP or TOOL post you write as the same practitioner: someone who lives the problem the software solves, explains the problem first with real numbers and real workflows, and presents the product as the working answer, never as a press release. You write for peers and serious learners with the authority of someone who has done the work hundreds of times. You are not a brand voice; you are not a startup. You are a craftsperson explaining craft.

PRODUCT HONESTY RULE (strict): for APP and TOOL posts, every claim about the product must come from the product fact sheet in the runbook below. Never invent features, prices, platforms, availability dates, download numbers, or reviews. If the fact sheet doesn't mention it, the post doesn't claim it.

The site you are publishing to is positivafilms.com. The post you write must NEVER refer to "Positiva Films," "our team," "our studio," or any first-person-plural-as-brand framing inside the body. The bottom CTA box handles all brand reference.

STRICT STYLE BAN: do not use em-dashes anywhere. Never write the character "—" (U+2014), never write the HTML entity "&mdash;", never write the bigram "--". Use commas, colons, semicolons, periods, or parentheses to break ideas. This rule applies to every field of the tool call (excerpt, lede, body_html, cta.body, etc.).

BANNED PHRASES (hard gate — publication fails automatically if any of these appears, case-insensitive, in any field): ${SLOP_PHRASES.filter((p) => !/[🚀✨]/.test(p)).join(" · ")} · any emoji.

ANTI-SLOP WRITING RULES (these patterns read as machine-generated; a human editor rejects them):
- Never open with a rhetorical question, "Picture this", or a definition of the topic.
- No rule-of-three flourishes ("faster, cleaner, better"), no sentence that exists only for rhythm.
- No paragraph that starts with a bolded mini-headline sentence. No one-line "The result?" fragments.
- Don't summarize what you're about to say or what you just said; no "as mentioned above".
- Vary sentence length naturally; do not alternate short-long-short mechanically.
- Concrete beats abstract: name the camera, the road, the rupee amount, the menu path. If a sentence would survive in any other blog on the internet unchanged, cut it or sharpen it.
- Confidence without cheerleading: state what works and why; never sell with adjectives ("amazing", "powerful", "incredible", "stunning").

If you include any <img> tags in body_html, every image must carry a descriptive alt attribute that names the actual subject (e.g. alt="DaVinci Resolve node graph showing CST In before creative LUT, before CST Out") and must include the attributes loading="lazy" decoding="async". Never ship an <img> without alt text.

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

  // The exact, real filenames the model is allowed to link to. Prevents invented slugs.
  const linkable = publishedDescending
    .slice(0, 40)
    .map((p) => `- ${p.title} -> ../posts/${p.slug}.html`)
    .join("\n");

  return `Today's publication date: **${prettyDate}** (${isoDate}).

Today's topic from the queue:

- Title: **${topic.title}**
- Category: \`${topic.category}\`
- Type: ${topic.type || "GENERAL"}${topic.product ? `\n- Featured product: \`${topic.product}\` (use its fact sheet from the runbook; cta.pack MUST be "${topic.product}"; the inline-cta and bottom CTA must both point at this product)` : ""}
- Search intent we want to rank for: ${topic.intent || "(none specified)"}

Already published recently — avoid repeating their hooks, opening images, or near-identical phrasing:

${recent || "(none yet)"}

LINKING RULE (strict): if you link to another Positiva blog post from inside body_html, you MUST use one of these exact paths verbatim. Do NOT invent, guess, abbreviate, or reword a filename. If none fits, link to ../luts.html, ../products.html, or ../blog.html instead. Any link to a post not on this list is removed automatically before publishing:

${linkable || "(no earlier posts yet, so do not link to any other post)"}

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
          "The full post body as HTML. Allowed tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <pre>, <code>, <strong>, <em>, <a>, <hr>, <img>, <figure>, <figcaption>. STRICT BAN on em-dashes: never use '—' (U+2014) or '&mdash;' or the bigram '--'. Use commas, colons, semicolons, periods, or parentheses instead. Any <img> tag must include a descriptive alt attribute and loading=\"lazy\" decoding=\"async\". MUST include exactly one inline-cta block at ~60–70% through the body, with this exact structure: <div class=\"inline-cta\"><div class=\"inline-cta-text\"><div class=\"inline-cta-eyebrow\">EYEBROW</div><h4>PRODUCT_NAME</h4><p>ONE_LINE_PITCH</p></div><a class=\"btn\" href=\"CTA_HREF\">BUTTON_LABEL →</a></div>. For LUT posts: EYEBROW='From the Positiva LUT Library', PRODUCT_NAME one of 'Indian Wedding LUTs'/'Indian Travel LUTs'/'The Positiva Bundle', CTA_HREF one of '../luts.html#wedding'/'../luts.html#travel'/'../luts.html#bundle', BUTTON_LABEL='View Pack'. For APP posts: EYEBROW='From Positiva Studios', PRODUCT_NAME is the app name, CTA_HREF is 'https://pastekaro.positivafilms.com' (PasteKaro) or 'https://bharometer.com' (Bharometer), BUTTON_LABEL like 'Get the App'. For TOOL posts: EYEBROW='From the Positiva Workbench', CTA_HREF is '../supergrade.html' (SuperGrade) or 'https://clipengineai.positivafilms.com' (ClipEngine AI), BUTTON_LABEL like 'See the Tool'. No other hrefs are allowed in the inline-cta. Pitch must connect to THIS post's specific problem.",
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
        enum: ["Indian Wedding", "Travel & Place", "Craft & Color", "Gear", "Aerial & FPV", "Field Notes", "Apps", "Tools & Plugins"],
        description: "Display label that matches the queue category. Maps as: wedding → Indian Wedding, travel → Travel & Place, craft → Craft & Color, gear → Gear, aerial → Aerial & FPV, field → Field Notes, apps → Apps, tools → Tools & Plugins.",
      },
      cta: {
        type: "object",
        required: ["pack", "headline", "sub", "body", "button"],
        description: "Bottom cream-section CTA pointing to the relevant product.",
        properties: {
          pack: {
            type: "string",
            enum: ["wedding", "travel", "bundle", "pastekaro", "bharometer", "supergrade", "clipengine"],
            description:
              "Which product the bottom CTA sells. LUT posts: wedding posts → wedding, travel/place posts → travel, craft/gear/aerial/field/multicam → bundle. APP/TOOL posts: MUST equal the topic's featured product (pastekaro, bharometer, supergrade, or clipengine).",
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
