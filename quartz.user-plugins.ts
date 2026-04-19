import { QuartzTransformerPlugin } from "./quartz/plugins/types"

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
