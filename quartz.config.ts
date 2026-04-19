import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { NormalizeObsidianBlockMath } from "./quartz.user-plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DSWoK — Data Science Well of Knowledge",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-BJGMPLWXT4",
    },
    locale: "en-US",
    baseUrl: "dswok.com",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      ".smart-connections",
      ".claude",
      ".idea",
      "CV",
      "claude.md",
      "improvement_plan.md",
      "ideas_1.md",
      "missing_notes.md",
      "README.md",
      "sitemap.xml",
      "publish.js",
      "generate_sitemap.js",
      "**/.DS_Store",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Source Serif 4",
        body: "Source Serif 4",
        code: "JetBrains Mono",
      },
      colors: {
        // sRGB mirrors of the OKLCH tokens in custom.scss.
        // Quartz's CustomOgImages emitter (satori) can't parse oklch(), so
        // these stay hex; browsers use the OKLCH tokens via custom.scss.
        lightMode: {
          light: "#fbfaf6",
          lightgray: "#dfdacf",
          gray: "#71737e",
          darkgray: "#464851",
          dark: "#232530",
          secondary: "#232530",
          tertiary: "#1a5f80",
          highlight: "rgba(38, 123, 165, 0.08)",
          textHighlight: "rgba(229, 238, 243, 0.7)",
        },
        darkMode: {
          light: "#232530",
          lightgray: "#363946",
          gray: "#8a8b94",
          darkgray: "#c8c6bd",
          dark: "#f4f2ec",
          secondary: "#f4f2ec",
          tertiary: "#6ba7c8",
          highlight: "rgba(107, 167, 200, 0.14)",
          textHighlight: "rgba(38, 123, 165, 0.5)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      NormalizeObsidianBlockMath(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.HardLineBreaks(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
