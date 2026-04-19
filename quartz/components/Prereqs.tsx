import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"

const WIKILINK_RE = /^\s*\[\[([^\|\]]+?)(?:\|([^\]]+?))?\]\]\s*$/

function slugifyCandidate(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-")
}

const Prereqs: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
  const raw = fileData.frontmatter?.prereqs as unknown
  if (!Array.isArray(raw) || raw.length === 0) return null

  type Entry = { href: string | null; title: string }

  const resolved: Entry[] = raw
    .map((item): Entry | null => {
      if (typeof item !== "string") return null
      const m = WIKILINK_RE.exec(item)
      if (!m) return null

      const target = m[1]
      const display = m[2] ?? target
      const candidate = slugifyCandidate(target)

      const file = allFiles.find((f) => {
        if (!f.slug) return false
        if (f.frontmatter?.title === target) return true
        const simple = simplifySlug(f.slug)
        const tail = simple.toString().split("/").pop() ?? ""
        return tail === candidate || tail === target
      })

      if (!file || !file.slug) {
        return { href: null, title: display }
      }
      return { href: resolveRelative(fileData.slug!, file.slug), title: display }
    })
    .filter((e): e is Entry => e !== null)

  if (resolved.length === 0) return null

  return (
    <div class={classNames(displayClass, "prereqs")}>
      <span class="l">Prereqs</span>
      <span>
        {resolved.map((r, i) => (
          <>
            {i > 0 ? ", " : ""}
            {r.href ? (
              <a href={r.href} class="internal">
                {r.title}
              </a>
            ) : (
              <span>{r.title}</span>
            )}
          </>
        ))}
      </span>
    </div>
  )
}

export default (() => Prereqs) satisfies QuartzComponentConstructor
