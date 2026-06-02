# Studify

AI-powered study platform for college students. Upload PDFs of textbooks, generate notes with RAG, create community summaries, and chat with your documents.

## Architecture

```
                    ┌──────────────┐
                    │  Frontend     │  React + Vite (port 5173)
                    │  (Vite Dev)   │
                    └──────┬───────┘
                           │  http://localhost:8080/api/*
                    ┌──────▼───────┐
                    │    NGINX      │  Load Balancer (port 8080)
                    │  Round Robin  │
                    └──┬───┬───┬───┘
           ┌───────────┘   │   └───────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  auth-1     │ │  auth-2     │ │  auth-3     │
    │  (port 3000)│ │  (port 3000)│ │  (port 3000)│
    │  JWT Verify │ │  JWT Verify │ │  JWT Verify │
    └──┬──────────┘ └──┬──────────┘ └──┬──────────┘
       │               │               │
       └───────┬───────┴───────┬───────┘
               │               │
        ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼───────┐
        │ Search Svc  │ │ Workspace   │ │  Notes Svc   │
        │ (port 4001) │ │ (port 4002) │ │  (port 4003) │
        │ Postgres    │ │ Postgres    │ │  Postgres+S3 │
        │             │ │ Gemini/Groq │ │              │
         └─────────────┘ └─────────────┘ └──────┬────────┘
                                                │
                                          ┌────▼───────┐
                                          │  BullMQ    │
                                          │  (Redis)   │
                                          └────│───────┘
                                                │
                                         ┌──────▼──────┐
                                         │  Worker      │
                                         │  Pinecone   │
                                         └─────────────┘
```

- **Frontend** — React 19 + Vite + TypeScript + React Query + Tailwind v4 + Framer Motion
- **NGINX** — Round‑robin load balancer (port 8080), single API entry point
- **Auth Service (×3)** — Stateless JWT auth, 3 instances behind NGINX, proxies to backend services
- **Notes Service** — PDF upload (S3), document CRUD, bookmarks
- **Search Service** — Feed, document search, university/course/semester filters
- **Workspace Service** — RAG chat (Groq), community summaries (Gemini 2.5 Flash), AI workspace
- **Worker** — Async embedding jobs via BullMQ (Redis) — pdf-parse → chunk → Pinecone

## Features

- **PDF Upload & Management** — Upload textbooks, auto-embed text chunks into Pinecone via BullMQ job queue
- **Chat with Documents** — Ask questions about any PDF; answers cite exact pages with sources
- **Community Summaries** — Generate and share PDF summaries using Gemini 2.5 Flash; edit, delete, rate‑limited
- **Explore Feed** — Browse public notes with university/course/semester filters
- **Bookmarks** — Save public notes for quick access
- **Split View** — View PDF and chat side-by-side on the note detail page
- **Edit Documents** — Update document titles inline
- **Onboarding Flow** — Select university/course/semester on first signup
- **Dashboard Stats** — View shared notes count, summary count, and unique topics
- **PDF Download** — Print any summary as PDF via browser print dialog

## Getting Started

### Prerequisites

- Node.js 22+
- Docker + Docker Compose
- API keys (see below)

### 1. Start All Services

```bash
cd ~/Studify-local-run

# Start everything (NGINX + 3 auth instances + all backend services + frontend)
docker compose up -d

# Frontend is available at http://localhost:5173
# API is available at http://localhost:8080/api
```

### 2. Environment Variables

Each service has its own `.env` file (not committed). Required variables:

| Service | Key | Description |
|---------|-----|-------------|
| auth/.env | `DATABASE_URL` | Prisma Postgres URL |
| auth/.env | `JWT_SECRET` | JWT signing secret |
| notes/.env | `DATABASE_URL` | Prisma Postgres URL |
| notes/.env | `AWS_ACCESS_KEY_ID` | S3 credentials |
| notes/.env | `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| workspace/.env | `DATABASE_URL` | Prisma Postgres URL |
| workspace/.env | `GOOGLE_API_KEY` | Gemini API key |
| workspace/.env | `GROQ_API_KEY` | Groq API key |
| workspace/.env | `AWS_ACCESS_KEY_ID` | S3 credentials (PDF download for summarization) |
| workspace/.env | `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| search/.env | `DATABASE_URL` | Prisma Postgres URL |
| embedding-worker/.env | `DATABASE_URL` | Prisma Postgres URL |
| embedding-worker/.env | `PINECONE_API_KEY` | Pinecone vector DB key |
| embedding-worker/.env | `OPENAI_API_KEY` | Embedding model key |
| embedding-worker/.env | `UPSTASH_REDIS_URL` | Redis for job queue |

### 3. Run Migrations

```bash
docker exec studify-auth-1 npx prisma migrate deploy
docker exec studify-notes npx prisma migrate deploy
docker exec studify-search npx prisma migrate deploy
```

> The Workspace service uses Prisma v7 with a custom output path. Run once:
> ```bash
> docker exec studify-workspace npx prisma generate
> ```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Query, Framer Motion, Sonner |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Prisma ORM), Pinecone (vectors), Redis (jobs) |
| AI | Gemini 2.5 Flash (summaries), Groq / Llama 3 (chat + RAG) |
| Storage | AWS S3 (PDFs) |
| Job Queue | BullMQ (Redis) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Load Balancer | NGINX (round‑robin, 3 auth instances) |
| Orchestration | Docker Compose |

## Project Structure

```
Studify-local-run/
├── docker-compose.yml       # 10 services (nginx, auth-1/2/3, notes, search, workspace, worker, frontend)
├── nginx/
│   └── nginx.conf           # Round‑robin upstream to auth-1/2/3:3000, proxies /api/*
│
├── auth/                    # Auth service (×3 instances via YAML anchors)
│   ├── src/
│   │   ├── controllers/     # login, signup, me
│   │   ├── middlewares/     # JWT verify, proxy to backend services
│   │   └── routes/          # Auth routes + proxy routes
│   └── .env
│
├── notes/                   # Notes service
│   ├── src/
│   │   ├── controllers/     # Upload, document CRUD, bookmarks
│   │   └── routes/
│   └── .env
│
├── search/                  # Search + explore feed
│   ├── src/
│   │   ├── controllers/    # Search, feed, filters
│   │   └── routes/
│   └── .env
│
├── workspace/               # Workspace service (summaries + RAG chat)
│   ├── src/
│   │   ├── controllers/    # RAG chat, summaries CRUD, AI workspace
│   │   ├── services/       # Groq RAG, Gemini summarization
│   │   ├── routes/         # workspaceRoutes, summariesRoutes
│   │   └── middleware/     # Rate limiter (2 req/min for generate)
│   ├── lib/                # Prisma client (v7)
│   ├── prisma/             # Schema + config
│   └── .env
│
├── embedding-worker/        # Async embedding worker
│   ├── src/
│   │   ├── jobs/           # Queue consumers
│   │   └── services/       # pdf-parse, chunk, embed, Pinecone upsert
│   └── .env
│
└── frontend/               # React SPA
    ├── src/
    │   ├── pages/          # landing, dashboard, notes/[id], explore, workspace, profile, onboarding
    │   ├── components/     # shared, dashboard, chat, ui
    │   ├── hooks/          # React Query hooks (use-notes, use-auth, use-summaries, use-search)
    │   ├── services/       # API client functions
    │   ├── store/          # Zustand auth store + UI store
    │   ├── types/          # TypeScript interfaces
    │   └── lib/            # Utils, constants, axios config
    └── .env                # VITE_API_BASE_URL=http://localhost:8080/api
```

## API Endpoints

All requests go through NGINX at `http://localhost:8080/api` with `Authorization: Bearer <token>`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register (name, email, password) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/me` | Update profile (university, course, semester) |

### Notes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/notesservice/posts` | Upload PDF |
| GET | `/api/notesservice/posts` | List user documents |
| GET | `/api/notesservice/posts/:id` | Single document |
| PATCH | `/api/notesservice/posts/:id` | Update document (title, etc.) |
| POST | `/api/notesservice/bookmarks/toggle` | Toggle bookmark |
| GET | `/api/notesservice/bookmarks` | List bookmarked IDs |

### Workspace (Community Summaries)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/summaries/generate` | Generate summary (2 req/min rate limit) |
| GET | `/api/workspace/summaries/count` | Total summary count |
| GET | `/api/workspace/summaries/:docId` | List summaries for a document |
| GET | `/api/workspace/summaries/:docId/:summaryId` | Get single summary |
| PATCH | `/api/workspace/summaries/:summaryId` | Update summary (owner only) |
| DELETE | `/api/workspace/summaries/:summaryId` | Delete summary (owner only) |
| POST | `/api/workspace/summaries/:summaryId/chat` | Chat with summary context |

### Workspace (RAG)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/ask` | Ask a question grounded in document(s) |
| POST | `/api/workspace/rewrite` | Rewrite/improve text |
| POST | `/api/workspace/compress` | Compress/shorten text |

### Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/searchservie/feed` | Explore feed |
| GET | `/api/searchservie/search` | Search documents |

## License

MIT
