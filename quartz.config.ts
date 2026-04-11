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
        header: "Fraunces",
        body: "Source Serif 4",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#fdfcf8",
          lightgray: "#e7e5e4",
          gray: "#a8a29e",
          darkgray: "#44403c",
          dark: "#1c1917",
          secondary: "#1e3a8a",
          tertiary: "#b45309",
          highlight: "rgba(30, 58, 138, 0.07)",
          textHighlight: "#fef08a88",
        },
        darkMode: {
          light: "#1c1917",
          lightgray: "#292524",
          gray: "#78716c",
          darkgray: "#e7e5e4",
          dark: "#fafaf9",
          secondary: "#60a5fa",
          tertiary: "#fbbf24",
          highlight: "rgba(96, 165, 250, 0.1)",
          textHighlight: "#b4530988",
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
