import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

function folderFromRelativePath(relativePath: string | undefined): string {
  if (!relativePath) return ""
  const parts = relativePath.split("/")
  if (parts.length < 2) return ""
  return parts[0]
}

function formatDate(d: Date | undefined): string {
  if (!d) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const allPagesWithTag = (tag: string) =>
      allFiles.filter((file) =>
        (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
      )

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    if (tag === "/") {
      const tags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))
      const tagItemMap: Map<string, QuartzPluginData[]> = new Map()
      for (const tag of tags) {
        tagItemMap.set(tag, allPagesWithTag(tag))
      }
      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <p>{i18n(cfg.locale).pages.tagContent.totalTags({ count: tags.length })}</p>
          <div>
            {tags.map((tag) => {
              const pages = tagItemMap.get(tag)!
              const listProps = {
                ...props,
                allFiles: pages,
              }

              const contentPage = allFiles.filter((file) => file.slug === `tags/${tag}`).at(0)

              const root = contentPage?.htmlAst
              const content =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)

              return (
                <div>
                  <h2>
                    <a class="internal tag-link" href={href}>
                      {tag}
                    </a>
                  </h2>
                  {content && <p>{content}</p>}
                  <div class="page-listing">
                    <p>
                      {i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}
                      {pages.length > options.numPages && (
                        <>
                          {" "}
                          <span>
                            {i18n(cfg.locale).pages.tagContent.showingFirst({
                              count: options.numPages,
                            })}
                          </span>
                        </>
                      )}
                    </p>
                    <PageList limit={options.numPages} {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)

      // Co-occurrence: other tags appearing on the same notes, ranked by frequency
      const coCounts = new Map<string, number>()
      for (const page of pages) {
        const others = (page.frontmatter?.tags ?? [])
          .flatMap(getAllSegmentPrefixes)
          .filter((t) => t !== tag)
        for (const t of others) {
          coCounts.set(t, (coCounts.get(t) ?? 0) + 1)
        }
      }
      const coTags = [...coCounts.entries()].sort((a, b) => b[1] - a[1])

      // Last-updated across tagged notes
      const dates = pages
        .map((p) => p.dates?.modified)
        .filter((d): d is Date => d instanceof Date)
        .sort((a, b) => b.getTime() - a.getTime())
      const lastUpdated = dates[0]

      // Sort by most recent by default; honor user-supplied sort if set
      const sortedPages = opts?.sort
        ? [...pages].sort(opts.sort)
        : [...pages].sort((a, b) => {
            const da = a.dates?.modified?.getTime() ?? 0
            const db = b.dates?.modified?.getTime() ?? 0
            return db - da
          })

      return (
        <div class="popover-hint tag-page">
          {content && (tree as Root).children.length > 0 && (
            <article class={classes}>{content}</article>
          )}
          <p class="tag-stat">
            <b>
              {pages.length} {pages.length === 1 ? "note" : "notes"}
            </b>{" "}
            · co-occurs with{" "}
            <b>
              {coTags.length} {coTags.length === 1 ? "tag" : "tags"}
            </b>
            {lastUpdated && (
              <>
                {" "}
                · last updated <b>{formatDate(lastUpdated)}</b>
              </>
            )}
          </p>

          {coTags.length > 0 && (
            <div class="co-tag-row">
              <span class="l">Co-tags</span>
              {coTags.map(([t, count], i) => {
                const href = resolveRelative(fileData.slug!, `tags/${t}` as FullSlug)
                const muted = i >= 3
                return (
                  <a href={href} class={`co-tag-chip${muted ? " muted" : ""}`}>
                    <span class="hash">#</span>
                    {t}
                    <span class="count">{count}</span>
                  </a>
                )
              })}
            </div>
          )}

          <div class="list-head">
            Notes tagged <code>#{tag}</code>
          </div>

          <div class="tag-note-list">
            {sortedPages.map((page, idx) => {
              const href = resolveRelative(fileData.slug!, page.slug!)
              const title = page.frontmatter?.title ?? page.slug
              const desc = page.frontmatter?.description ?? page.description
              const folder = folderFromRelativePath(page.relativePath)
              return (
                <a href={href} class="tag-note-row">
                  <span class="n">{String(idx + 1).padStart(2, "0")}</span>
                  <div class="body">
                    <div class="nm">{title}</div>
                    {desc && <div class="desc">{desc}</div>}
                    {page.dates?.modified && (
                      <div class="meta">{formatDate(page.dates.modified)}</div>
                    )}
                  </div>
                  {folder && (
                    <div class="fold">
                      <b>{folder}</b>
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        </div>
      )
    }
  }

  TagContent.css = concatenateResources(style, PageList.css)
  return TagContent
}) satisfies QuartzComponentConstructor
