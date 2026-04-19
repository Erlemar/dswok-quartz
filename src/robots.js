// robots.txt body served by the edge Worker at /robots.txt.
//
// Policy:
//   - Allow major search engines and mainstream AI crawlers (citation in AI
//     answers drives referrals; a public ML knowledge base benefits from
//     being ingestible).
//   - Block a short list of crawlers with a track record of aggressive
//     behaviour. Re-evaluate if blocked bots start ignoring the directive.
//   - Declare Cloudflare Content-Signal preferences explicitly.

const robotsTxt = `# DSWoK — Data Science Well of Knowledge
# https://dswok.com/

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Applebot
Allow: /

# AI crawlers — allowed (citation drives referrals)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Diffbot
Allow: /

# Aggressive / low-value crawlers — blocked
User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# Default policy + Cloudflare Content-Signal declaration
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: https://dswok.com/sitemap.xml
`

export default robotsTxt
