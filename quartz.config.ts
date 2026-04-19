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
        lightMode: {
          light: "oklch(0.985 0.005 85)",
          lightgray: "oklch(0.89 0.008 85)",
          gray: "oklch(0.55 0.01 260)",
          darkgray: "oklch(0.38 0.01 260)",
          dark: "oklch(0.22 0.01 260)",
          secondary: "oklch(0.22 0.01 260)",
          tertiary: "oklch(0.4 0.1 230)",
          highlight: "oklch(0.5 0.1 230 / 0.08)",
          textHighlight: "oklch(0.96 0.02 230 / 0.7)",
        },
        darkMode: {
          light: "oklch(0.22 0.01 260)",
          lightgray: "oklch(0.3 0.01 260)",
          gray: "oklch(0.6 0.01 260)",
          darkgray: "oklch(0.78 0.005 85)",
          dark: "oklch(0.95 0.005 85)",
          secondary: "oklch(0.95 0.005 85)",
          tertiary: "oklch(0.7 0.1 230)",
          highlight: "oklch(0.6 0.1 230 / 0.12)",
          textHighlight: "oklch(0.5 0.1 230 / 0.5)",
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
