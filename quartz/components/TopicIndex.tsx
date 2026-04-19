import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import { QuartzPluginData } from "../plugins/vfile"

const WIKILINK_RE = /^\s*\[\[([^\|\]]+?)(?:\|([^\]]+?))?\]\]\s*$/

function resolveWikilink(
  raw: string,
  allFiles: QuartzPluginData[],
  currentSlug: string,
): { href: string; title: string } | null {
  const m = WIKILINK_RE.exec(raw)
  if (!m) return null
  const target = m[1]
  const display = m[2] ?? target
  const candidate = target.trim().toLowerCase().replace(/\s+/g, "-")
  const file = allFiles.find((f) => {
    if (!f.slug) return false
    if (f.frontmatter?.title === target) return true
    const tail = f.slug.split("/").pop() ?? ""
    return tail === candidate || tail === target
  })
  if (!file || !file.slug) return null
  return { href: resolveRelative(currentSlug as any, file.slug), title: display }
}

const TopicIndex: QuartzComponent = ({
  fileData,
  allFiles,
  displayClass,
}: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  const topics = allFiles
    .filter((f) => {
      if (!f.slug) return false
      const parts = f.slug.split("/")
      return (
        parts.length === 2 &&
        parts[1] === "index" &&
        typeof f.frontmatter?.order === "number"
      )
    })
    .map((f) => {
      const folderHref = resolveRelative(fileData.slug!, f.slug!)
      const starts = (f.frontmatter?.start_with ?? []) as string[]
      const startLinks = starts
        .map((s) => resolveWikilink(s, allFiles, fileData.slug!))
        .filter((x): x is { href: string; title: string } => x !== null)
      return {
        order: f.frontmatter!.order as number,
        name: (f.frontmatter?.title as string) ?? (f.slug!.split("/")[0]),
        description: (f.frontmatter?.description as string) ?? "",
        folderHref,
        startLinks,
      }
    })
    .sort((a, b) => a.order - b.order)

  if (topics.length === 0) return null

  return (
    <div class={classNames(displayClass, "topic-index")}>
      <div class="browse-head">Browse by topic</div>
      <div class="topic-rows">
        {topics.map((t) => (
          <div class="topic-row">
            <span class="n">{String(t.order).padStart(2, "0")}</span>
            <div class="body">
              <div class="name">
                <a href={t.folderHref} class="internal">
                  {t.name}
                </a>
              </div>
              {t.description && <div class="desc">{t.description}</div>}
              {t.startLinks.length > 0 && (
                <div class="start">
                  Start with{" "}
                  {t.startLinks.map((l, i) => (
                    <>
                      {i > 0 ? " or " : ""}
                      <a href={l.href} class="internal">
                        {l.title}
                      </a>
                    </>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div class="topic-foot">
        <div>
          Paper reviews on{" "}
          <a href="https://andlukyane.com/tag/paperreview" class="external">
            andlukyane.com/tag/paperreview
          </a>
        </div>
        <div>
          Source:{" "}
          <a href="https://github.com/Erlemar/dswok" class="external">
            github.com/Erlemar/dswok
          </a>
        </div>
      </div>
    </div>
  )
}

export default (() => TopicIndex) satisfies QuartzComponentConstructor
