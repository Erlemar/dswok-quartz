import { QuartzTransformerPlugin, QuartzEmitterPlugin } from "./quartz/plugins/types"
import { write } from "./quartz/plugins/emitters/helpers"
import { FullSlug } from "./quartz/util/path"

/**
 * Obsidian treats `$$formula$$` on a single line as display math, but strict
 * CommonMark (via remark-math + micromark-extension-math) requires `$$` on its
 * own lines to enter block/flow math mode. DSWoK uses the single-line form
 * throughout, which would otherwise render as inline KaTeX wrapped in <p>.
 *
 * This plugin rewrites every line that is exactly `$$...$$` into a three-line
 * block before parsing. Multi-line `$$...$$` blocks are unaffected.
 */
export const NormalizeObsidianBlockMath: QuartzTransformerPlugin = () => ({
  name: "NormalizeObsidianBlockMath",
  textTransform(_ctx, src) {
    // Function replacement avoids the `$$` escape trap in string replace
    return src.replace(/^\$\$([^\n]+?)\$\$\s*$/gm, (_, expr) => `$$\n${expr}\n$$`)
  },
})

/**
 * Emits /llms.txt — the llmstxt.org index that tells AI crawlers and answer
 * engines what lives on the site and how it is organised.
 *
 * Structure follows the spec: one H1, a blockquote summary, a details
 * paragraph, then one H2 per content folder listing that folder's notes.
 * Section order and section blurbs come from each folder's `index.md`
 * (`order` and `description` frontmatter, the same fields TopicIndex.tsx
 * reads for the homepage). Per-note blurbs come from `file.data.description`,
 * which Plugin.Description() has already populated by the time emitters run.
 */

// Working files and folders that live in the vault but are not publishable
// content. These are untracked in DSWoK, so a production build (which clones
// from GitHub) never sees them — but a local build against the ./content
// symlink does. Listing them keeps local output identical to deployed output.
// The folder list matters most: without it the missing-index.md fallback below
// would surface drafts/ as a section.
const NON_CONTENT_FOLDERS = new Set(["drafts", "private", "templates", "CV"])

const NON_CONTENT_SLUGS = new Set([
  "index",
  "404",
  "audit_report_2026-05-08",
  "content_plan",
  "improvement_plan",
  "missing_notes",
  "prompts",
  "Untitled",
])

const SUMMARY =
  "A practitioner reference on machine learning and data science: concise, " +
  "cross-linked notes on classical algorithms, deep learning, NLP, evaluation " +
  "metrics, recommender systems, and ML interview preparation."

const DETAILS =
  "Written and maintained by Andrey Lukyanenko, an ML engineer at Meta and a " +
  "Kaggle Competition Master and Notebook Grandmaster. The notes are reference " +
  "material rather than tutorials: each one defines a concept, explains the " +
  "mechanism, and says where it applies and where it breaks down. Paper reviews " +
  "are published separately at https://andlukyane.com/tag/paperreview."

// Trails last, after the content sections — an LLM answering "who wrote this"
// or looking for adjacent material should find these, but they rank below the
// notes themselves.
const ABOUT_LINKS = [
  "- [Andrey Lukyanenko — personal site](https://andlukyane.com/): Blog, ML paper reviews, " +
    "competition write-ups, and project notes.",
  "- [Andrey Lukyanenko on LinkedIn](https://www.linkedin.com/in/andlukyane/): " +
    "Professional profile and contact.",
]

// Plugin.Description() runs escapeHTML() over the text, so descriptions arrive
// carrying entities. llms.txt is plain text and needs them back as characters.
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
}

/** Collapse whitespace, unescape entities, and trim to a short single line. */
function tidy(desc: string, title: string, limit = 180): string {
  let flat = desc
    .replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim()

  // Notes that open with an H1 matching their title yield "Title Notes on…".
  // Only strip when a new sentence follows, so "BERTopic is a pipeline" — where
  // the title is the sentence's subject — is left intact.
  if (flat.startsWith(title + " ")) {
    const rest = flat.slice(title.length + 1)
    if (/^[A-Z]/.test(rest)) flat = rest
  }

  if (flat.length <= limit) return flat
  const cut = flat.slice(0, limit)
  const lastSpace = cut.lastIndexOf(" ")
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, "") + "…"
}

type Section = { title: string; order: number; blurb: string; hub: string }
type Entry = { title: string; url: string; blurb: string }

export const LlmsTxt: QuartzEmitterPlugin = () => ({
  name: "LlmsTxt",
  async *emit(ctx, content) {
    const base = ctx.cfg.configuration.baseUrl ?? "dswok.com"
    const url = (slug: string) => `https://${base}/${encodeURI(slug)}`

    const sections = new Map<string, Section>()
    const entries = new Map<string, Entry[]>()

    for (const [, file] of content) {
      const slug = file.data.slug!
      if (NON_CONTENT_SLUGS.has(slug)) continue

      const segments = slug.split("/")
      // Root-level notes have no folder to file under; the vault has none today.
      if (segments.length < 2) continue

      const folder = segments[0]
      if (NON_CONTENT_FOLDERS.has(folder)) continue

      const fm = file.data.frontmatter
      const title = fm?.title ?? segments[segments.length - 1]

      // A folder's index.md defines the section, it is not an entry itself.
      if (segments[segments.length - 1] === "index") {
        sections.set(folder, {
          title,
          order: typeof fm?.order === "number" ? fm.order : Number.MAX_SAFE_INTEGER,
          blurb: (fm?.description as string) ?? "",
          hub: url(folder),
        })
        continue
      }

      const list = entries.get(folder) ?? []
      list.push({ title, url: url(slug), blurb: tidy(file.data.description ?? "", title) })
      entries.set(folder, list)
    }

    const lines = [
      `# ${ctx.cfg.configuration.pageTitle}`,
      "",
      `> ${SUMMARY}`,
      "",
      DETAILS,
    ]

    // A folder holding notes but no index.md has no section to file them under,
    // and they would drop out of the index silently. Synthesise a section so the
    // notes still appear, and say so in the build log so the gap gets noticed.
    for (const folder of entries.keys()) {
      if (sections.has(folder)) continue
      console.log(
        `[LlmsTxt] "${folder}" has notes but no index.md — llms.txt will list it ` +
          `without a section blurb, and order it last. Add index.md with ` +
          `title/order/description to control this.`,
      )
      sections.set(folder, {
        title: folder.replaceAll("-", " ").replaceAll("_", " "),
        order: Number.MAX_SAFE_INTEGER,
        blurb: "",
        hub: url(folder),
      })
    }

    const ordered = [...sections.entries()].sort(
      ([, a], [, b]) => a.order - b.order || a.title.localeCompare(b.title),
    )

    for (const [folder, section] of ordered) {
      const notes = (entries.get(folder) ?? []).sort((a, b) => a.title.localeCompare(b.title))
      if (notes.length === 0) continue

      lines.push("", `## ${section.title}`, "")
      if (section.blurb) lines.push(section.blurb, "")
      lines.push(`- [${section.title} (section index)](${section.hub})`)
      for (const note of notes) {
        lines.push(`- [${note.title}](${note.url})${note.blurb ? `: ${note.blurb}` : ""}`)
      }
    }

    lines.push("", "## About", "", ...ABOUT_LINKS)

    yield write({ ctx, content: lines.join("\n") + "\n", slug: "llms" as FullSlug, ext: ".txt" })
  },
})
