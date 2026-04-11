# Minsik

**A book discovery and tracking app.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-minsik.jtuta.cloud-blue?style=flat-square)](https://minsik.jtuta.cloud)
[![Server Repo](https://img.shields.io/badge/Server%20Repo-GitHub-181717?style=flat-square&logo=github)](https://github.com/JakubTuta/Minsik-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Minsik is a web app for people who love books. Track what you're reading, rate books across multiple dimensions, write reviews, and explore authors and series — all from a clean, fast interface. Public bookshelves let you share your reading life with others.

**[Live Demo](https://minsik.jtuta.cloud) · [Server Repo](https://github.com/JakubTuta/Minsik-server) · [Report Bug](https://github.com/JakubTuta/Minsik-web/issues/new?template=bug_report.md) · [Request Feature](https://github.com/JakubTuta/Minsik-web/issues/new?template=feature_request.md)**

---

## ✨ Features

**Discovery**
- Full-text search across books, authors, and series with type filters and infinite scroll
- Browse books by genre via the Categories dropdown (navbar)
- Rich author pages with biography, portrait, and sortable bibliography
- Series pages with cover collage, book list, and complete author info
- Discover page with filters for book length, mood, era, and quality threshold

**Your Reading Life**
- Personal bookshelf with four reading statuses: *Want to Read*, *Reading*, *Read*, *Abandoned*
- Public bookshelves viewable at `/bookshelf/[username]` — share your collection with anyone
- Favourites list to bookmark the books that matter most

**Ratings & Reviews**
- Overall star rating plus 8 sub-dimensions: Pacing, Emotional Impact, Intellectual Depth, Writing Quality, Rereadability, Readability, Plot Complexity, and Humor
- Comments with optional spoiler flag — readers choose when to reveal the contents
- Dashboard with personal reading stats and personalized recommendations

**Casino**
- Play Slots — spin a slot machine to discover random book recommendations
- Open a Case — reveal a random book with collectible rarity tiers (Common → Legendary)
- Open a Pack — open a themed pack of books to find your next read

**Content & SEO**
- Server-side rendered book, author, and series pages with JSON-LD structured data
- Open Graph meta tags, canonical URLs, and auto-generated sitemap

**Admin**
- Book ingestion from Open Library and Google Books
- Database coverage stats and import tooling

---

##  Tech Stack

| Layer | Stack |
|---|---|
| Framework | [Nuxt.js 3](https://nuxt.com/) + [Vue 3](https://vuejs.org/) + TypeScript |
| UI Components | [Vuetify 3](https://vuetifyjs.com/) |
| Utility CSS | [UnoCSS](https://unocss.dev/) |
| State Management | [Pinia](https://pinia.vuejs.org/) |
| HTTP Client | [Axios](https://axios-http.com/) |
| Charts | [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) |
| Package Manager | [Bun](https://bun.sh/) |
| Container | Docker (`oven/bun:1-alpine`) |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js ≥ 18)
- A running instance of the [Minsik server](https://github.com/JakubTuta/Minsik-server)

### Install & run

```bash
# Install dependencies
bun install

# Start the dev server at http://localhost:3040
bun run dev
```

### Build for production

```bash
bun run build
bun run preview
```

### Environment variables

Create a `.env` file in the project root:

| Variable | Default | Description |
|---|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8040` | Base URL of the backend API |
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3040` | Canonical URL used for SEO and structured data |

---

## 🐳 Docker

```bash
docker build \
  --build-arg NUXT_PUBLIC_API_BASE_URL=https://your-api.example.com \
  --build-arg NUXT_PUBLIC_SITE_URL=https://your-app.example.com \
  -t minsik-web .

docker run -p 3040:3000 minsik-web
```

The app listens on port `3000` inside the container and is mapped to `3040` on the host by default.

---

## ⚖️ License

Distributed under the [MIT License](LICENSE). Copyright © 2025 Jakub Tutka.
