# Guvery Blog — Admin Dashboard

> Full-stack blog platform with an admin panel built with **Next.js 15**, **TypeScript**, and **PostgreSQL**. Features a complete editorial workflow, role-based authentication, rich text editor, newsletter system, and dark mode. Built for Spanish-speaking users.

[![🌐 Live Demo](https://img.shields.io/badge/🌐_Live_Demo-nextjs--blog--guvery.vercel.app-000?style=for-the-badge&logo=vercel)](https://nextjs-blog-guvery.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e5bf?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Preview

![Guvery Blog — public blog view](./docs/preview.jpeg)

---

## Why this project?

Most Next.js tutorials stop at basic CRUD. This project goes further:

- **Real editorial workflow** — Draft → Review → Published → Archived, with real-time notifications between roles
- **Role-based access control** — three distinct roles (ADMIN, EDITOR, MEMBER) with route protection middleware
- **Production-grade security** — comment rate limiting (5/hour per user), server-side HTML sanitization with `sanitize-html`, Zod validation on all Server Actions
- **Full newsletter system** — double opt-in subscription flow with email confirmation via Resend

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Editorial Workflow](#editorial-workflow)
- [User Roles](#user-roles)
- [Deploy to Vercel](#deploy-to-vercel)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styles | Tailwind CSS |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Authentication | NextAuth v4 (Credentials + Google OAuth) |
| Rich Text Editor | Tiptap |
| Email | Resend |
| Validation | Zod |
| Rate Limiting | Upstash Redis |
| Deploy | Vercel |

---

## Features

### Public Blog
- Paginated article listing with category filters
- Article detail with table of contents, reading time, and view counter
- Related and popular articles
- Full-text search
- Comment system with rate limiting (5 comments/hour per user)
- Newsletter with double opt-in via email
- Author profiles
- Social media sharing

### Admin Panel
- Dashboard with key metrics: articles, views, subscribers
- Article management with rich text editor (Tiptap)
- Editorial workflow: Draft → Review → Published → Archived
- Real-time notification system between authors and admins
- Author and category management
- Subscriber CSV export
- Profile settings and avatar upload
- Dark mode support

### Security & Access
- Role-based access control: ADMIN, EDITOR, MEMBER
- Route protection middleware for `/admin/*`
- Zod validation on all Server Actions
- Server-side HTML sanitization with `sanitize-html`
- Rate limiting on comments and article views (Upstash Redis)

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin panel (protected routes)
│   │   ├── admin/        # Dashboard, articles, authors, categories
│   │   └── pages/        # Settings and profile
│   ├── (blog)/           # Public blog
│   │   ├── blog/         # Article listing and detail
│   │   ├── autor/        # Author profile
│   │   ├── buscar/       # Search
│   │   └── categoria/    # Articles by category
│   ├── admin/login/      # Public login page
│   └── api/              # API routes (auth, search, newsletter, export)
├── actions/              # Server Actions (CRUD with Zod validation)
├── services/             # Database queries
├── components/
│   ├── admin/            # Admin panel forms and components
│   └── blog/             # Public blog components
└── lib/                  # Auth, Prisma client, constants, utilities
```

---

## Database Models

| Model | Description |
|---|---|
| **User** | Users with roles (ADMIN, EDITOR) and account types (STAFF, MEMBER) |
| **Post** | Articles with states, SEO metadata, reading time and view count |
| **Category** | Categories with slug and color |
| **Tag** | Article tags |
| **Comment** | Comments with approval state |
| **Subscriber** | Newsletter subscribers with double opt-in |
| **Notification** | System notifications for the editorial workflow |

---

## Prerequisites

- Node.js 18+
- PostgreSQL (or a [Neon](https://neon.tech) account)
- [Resend](https://resend.com) account (for newsletter emails)
- [Upstash](https://upstash.com) account (for Redis rate limiting)
- [Google Cloud Console](https://console.cloud.google.com) project (for Google OAuth)

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/YulianaGP/nextjs-blog-guvery.git
cd nextjs-blog-guvery

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed the database with sample data
npm run db:seed

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth — generate secret with: openssl rand -hex 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google OAuth — configure at console.cloud.google.com
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend — for newsletter emails
RESEND_API_KEY=""

# Upstash Redis — for rate limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Public site URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Important:** `.env.local` is in `.gitignore` and must never be committed to the repository.

---

## Available Scripts

```bash
npm run dev          # Development server at localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

npm run db:migrate   # Run Prisma migrations
npm run db:push      # Sync schema without generating a migration
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:generate  # Regenerate Prisma Client
```

---

## Editorial Workflow

```
DRAFT → REVIEW → PUBLISHED → ARCHIVED
  ↑         |
  └─────────┘ (return to draft)
```

1. The **Editor** creates an article as a draft and submits it for review
2. The **Admin** receives a notification and can publish, return to draft, or archive it
3. The **Editor** receives a notification with the result

---

## User Roles

| Role | Permissions |
|---|---|
| **ADMIN** | Full access: publish articles, manage authors, categories, and subscribers |
| **EDITOR** | Create and edit their own articles, submit for review |
| **MEMBER** | Read published articles, comment, subscribe to the newsletter |

---

## Deploy to Vercel

### 1. Verify the build

```bash
npm run build
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project** and import your GitHub repository
3. Vercel will automatically detect it as a Next.js project

### 3. Configure environment variables

In **Settings → Environment Variables**, add all variables from `.env.example` with production values:

| Variable | Production Value |
|---|---|
| `DATABASE_URL` | Your Neon URL with `pgbouncer=true` |
| `DIRECT_URL` | Your Neon direct URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `RESEND_API_KEY` | Your Resend API Key |
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST Token |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

### 4. Configure Google OAuth for production

In [Google Cloud Console](https://console.cloud.google.com):
1. Go to **APIs & Services → Credentials**
2. Edit your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**: `https://your-app.vercel.app/api/auth/callback/google`

### 5. Deploy

Click **Deploy**. Vercel will automatically redeploy on every push to `main`.

> **Note:** Run migrations from your local machine pointing to the production database — not from Vercel.

---

## License

MIT — free for personal and commercial use.
