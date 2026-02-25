# GitGudFolio

![GitHub top language](https://img.shields.io/github/languages/top/At0mXploit/GitGudFolio.svg?style=popout-square) ![GitHub last commit](https://img.shields.io/github/last-commit/At0mXploit/GitGudFolio.svg?style=popout-square) ![GitHub](https://img.shields.io/github/license/At0mXploit/GitGudFolio.svg?style=popout-square) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

### A personal portfolio + blog for every GitHub user — but better.

GitGudFolio generates a portfolio website from your GitHub profile and gives you a full-featured blog editor with Markdown, LaTeX, syntax highlighting, Giscus comments, custom social links, a friends section, and flexible repo filtering.

Checkout the demo [here](https://at0mxploit.github.io/)

<img width="1340" height="607" alt="2026-02-24_21-07" src="https://github.com/user-attachments/assets/dbf27676-bd0f-4f15-8718-4c348188f271" />

<img width="1345" height="557" alt="2026-02-24_21-26" src="https://github.com/user-attachments/assets/f4a58932-61c7-4505-b205-b95994871c31" />

<img width="1350" height="609" alt="2026-02-24_21-27" src="https://github.com/user-attachments/assets/cec69f65-a909-462e-803f-d63b18f3dedf" />

---

# Getting Started

### Install

Clone the repo and install dependencies locally — no global npm install needed.

```sh
git clone https://github.com/At0mXploit/GitGudFolio.git
cd GitGudFolio
npm install
```

### Build

Using the UI (recommended):

```sh
npm run ui
```

Then open `http://localhost:3000` in your browser.

> Tip: Use the UI to build your portfolio, write blogs, and manage everything.

Or via CLI:

```sh
node bin/gitfolio.js build <username>
```

`<username>` is your GitHub username. Outputs to the `./dist` folder.

To run the built site locally:

```sh
npm run serve
# or with a custom port:
node bin/gitfolio.js run -p [port]
```

---

# Customization

### Themes

```sh
$ node bin/gitfolio.js build <username> --theme dark
$ node bin/gitfolio.js build <username> --theme light
```

### Background Image

```sh
$ node bin/gitfolio.js build <username> --background https://images.unsplash.com/photo-1557277770-baf0ca74f908?w=1634
```

You can also edit `index.css` directly for custom styles.

### Include Forks

```sh
$ node bin/gitfolio.js build <username> -f
```

### Sort & Order Repos

`[sortBy]` can be `star`, `created`, `updated`, `pushed`, `full_name`. Default: `created`

```sh
$ node bin/gitfolio.js build <username> --sort star --order desc
```

### Filter Repos

**Top N repos** (applied after sorting):

```sh
$ node bin/gitfolio.js build <username> --sort star --order desc --limit 10
```

**Specific repos by name** (comma-separated, shown in the order you list them):

```sh
$ node bin/gitfolio.js build <username> --repos "my-project,awesome-lib,side-hustle"
```

Combine both — `--repos` picks repos, `--limit` caps the count:

```sh
$ node bin/gitfolio.js build <username> --repos "my-project,awesome-lib,side-hustle,other" --limit 3
```

Both options are also available in the UI under **Repo Filter**.

### Social Media Links

Built-in socials (Twitter, LinkedIn, Medium, Dribbble):

```sh
node bin/gitfolio.js build <username> --twitter <handle> --linkedin <handle> --medium <handle> --dribbble <handle>
```

### Custom Social Links

Add any platform using `--social label:url` (repeatable). Known labels auto-resolve to brand icons; everything else gets a generic link icon.

```sh
node bin/gitfolio.js build <username> \
  --social "discord:https://discord.gg/yourserver" \
  --social "hackthebox:https://app.hackthebox.com/users/yourprofile" \
  --social "ctftime:https://ctftime.org/user/12345"
```

Labels with automatic icons (Font Awesome 5): `discord`, `github`, `gitlab`, `twitch`, `youtube`, `instagram`, `reddit`, `telegram`, `keybase`, `stackoverflow`, `dev`, `npm`, `codepen`, `pinterest`, `spotify`, `facebook`, `mastodon`, `hackerrank`, `patreon`. Anything else uses `fa-link`.

In the UI, use the **Custom Socials** section to add rows dynamically.

### Loading Screen Animation

By default the site shows a spinner while loading. You can replace it with a **text scramble** animation — phrases that cycle through with a glitch/scramble effect before the portfolio appears.

```sh
# Enable with one phrase
node bin/gitfolio.js build <username> --scramble --scramble-phrase "At0m"

# Multiple phrases (cycle through in order, then reveal site)
node bin/gitfolio.js build <username> --scramble \
  --scramble-phrase "At0m" \
  --scramble-phrase "Lets Pwn" \
  --scramble-phrase "Loading..."
```

In the UI, scroll to **Loading Screen**, tick **Enable scramble animation**, and add phrases with **+ Add Phrase**.

Phrases are displayed one at a time with a scramble/glitch effect. After the last phrase resolves, the loading screen fades out and the portfolio appears.

### Friends Section

Add friends with their websites — they appear as a **Friends.** card grid on your portfolio.

```sh
# name|url
node bin/gitfolio.js build <username> --friend "Alice|https://alice.dev"

# name|url|optional tagline
node bin/gitfolio.js build <username> \
  --friend "Alice|https://alice.dev|Security researcher" \
  --friend "Bob|https://bob.io|Full-stack dev"
```

In the UI, use the **Friends** section to add rows dynamically (name, URL, optional tagline).

---

# Publishing

Create a GitHub repo named `username.github.io` and push everything inside `/dist` to it.

Your site will be live at `username.github.io`.

### Updating

```sh
$ npm run update
```

Or use the **Update** button in the UI. This refreshes your GitHub profile info and repo list.

To change background or theme, re-run the `build` command.

---

# Blog

Open the UI and click **New Blog** to create a post. Fill in the title, subtitle, top image, and paragraphs, then hit **Create Blog**. The post is written to `./dist/blog/`.

### Markdown Support

Every paragraph input supports full Markdown:

- Headings (`#`, `##`, `###`)
- Bold, italic, strikethrough
- Ordered and unordered lists
- Task lists (`- [ ]` / `- [x]`)
- Links and images
- Inline and fenced code blocks
- Tables
- Footnotes
- Blockquotes
- Emojis (`:smile:`, `:rocket:`)

### Syntax Highlighting

Fenced code blocks are syntax-highlighted using [Prism.js](https://prismjs.com/). Specify the language on the opening fence:

````
```python
def hello():
    print("Hello, world!")
```
````

Supported: `javascript`, `python`, `bash`, `css`, `html`, `json`, `typescript`, and [100+ more](https://prismjs.com/#supported-languages). Grammars load automatically — no config needed.

### LaTeX / Math

Paragraphs support LaTeX math via [KaTeX](https://katex.org/), rendered server-side at build time.

| Syntax | Usage |
|--------|-------|
| `$...$` | Inline math |
| `$$...$$` | Display (block) math |

```
Inline: $e = mc^2$

Block:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

The **Preview** tab renders math live before you publish.

### Blog Editor Tools

- **Write / Preview tabs** — live rendered preview with syntax highlighting and math.
- **Copy Markdown** — copies title, subtitle, and all paragraphs to clipboard as Markdown.

### Giscus Comments

Blog posts support [Giscus](https://giscus.app) — comments powered by GitHub Discussions. Readers need a GitHub account to comment.

**One-time setup:**

1. Enable **Discussions** on your GitHub repo (Settings → Features → Discussions ✓).
2. Install the [Giscus GitHub App](https://github.com/apps/giscus) on the repo.
3. Go to [giscus.app](https://giscus.app), enter your repo, pick a Discussion category, and copy the `data-repo-id` and `data-category-id` values.
4. In the UI at `http://localhost:3000`, scroll to **Giscus Comments**, tick **Enable comments by default**, fill in the four fields, pick a theme, and click **Build**.

Config is saved to `config.json` and applied to every future blog post automatically.

**Per-post control:**

When writing a post at `/blog`, an **Enable Comments** toggle appears (pre-checked if you enabled by default). Uncheck it to publish a post without a comment section.

**Themes:** `Auto (follows system)` · `Light` · `Dark`

---

# Blog JSON Format

Each blog post adds an entry to `blog.json`:

```json
{
  "url_title": "my-first-blog",
  "title": "Lorem ipsum dolor sit amet",
  "sub_title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "top_image": "top_image.jpg",
  "visible": true
}
```

---

# License

![GitHub](https://img.shields.io/github/license/At0mXploit/GitGudFolio.svg?style=popout-square)

---

> **GitGudFolio** is a fork of [Gitfolio](https://github.com/imfunniee/gitfolio) by [@imfunniee](https://github.com/imfunniee). Original concept and base code belong to them. This fork adds Markdown, LaTeX, syntax highlighting, Giscus comments, custom social links, friends section, repo filtering, and various bug fixes on top of the original.

