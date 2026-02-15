# Cloudflare Workers Full-Stack Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/docuflux-intelligent-pdf-data-extraction)

A production-ready full-stack application template built on Cloudflare Workers, featuring Durable Objects for stateful entities, a modern React frontend with shadcn/ui, and TanStack Query for data fetching. This template demonstrates a real-time chat application with users, chat boards, and messages, using a shared Global Durable Object for efficient multi-entity storage.

## Features

- **Serverless Backend**: Cloudflare Workers with Hono routing and Durable Objects for users, chats, and messages.
- **Indexed Entities**: Automatic listing, pagination, seeding, and deletion with prefix-based indexes.
- **Modern Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components, dark mode, and responsive design.
- **Data Management**: TanStack Query for caching, optimistic updates, and infinite queries.
- **Type-Safe APIs**: Shared types between frontend and worker, with full API response validation.
- **Development Workflow**: Hot-reload for both frontend (Vite) and worker routes, with Bun support.
- **Production-Ready**: CORS, error handling, health checks, client error reporting, and observability.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router, Zustand, Framer Motion
- **Utilities**: Bun (package manager/runtime), Immer, Zod, Lucide Icons
- **Dev Tools**: ESLint, TypeScript 5, Wrangler CLI

## Quick Start

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   bun install
   ```

2. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (frontend) and exposes APIs at `/api/*`.

3. **Build & Preview**:
   ```bash
   bun build
   bun preview
   ```

## API Examples

Interact with the backend via `fetch` or the provided `api()` client:

```typescript
// List users (paginated)
const { items: users, next } = await api<{ items: User[]; next: string | null }>('/api/users?limit=10');

// Create chat
const chat = await api<Chat>('/api/chats', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Chat' })
});

// Send message
const message = await api<ChatMessage>('/api/chats/c1/messages', {
  method: 'POST',
  body: JSON.stringify({ userId: 'u1', text: 'Hello!' })
});
```

Available endpoints:
- `GET/POST /api/users` – List/create users
- `GET/POST /api/chats` – List/create chats
- `GET/POST /api/chats/:chatId/messages` – List/send messages
- `DELETE /api/users/:id`, `POST /api/users/deleteMany`
- `GET /api/health` – Health check

## Development

- **Frontend**: Edit `src/` files; hot-reload via Vite.
- **Backend Routes**: Add routes in `worker/user-routes.ts` (auto-reloads in dev).
- **Entities**: Extend `IndexedEntity` in `worker/entities.ts` for new models (users/chats pre-built).
- **Types**: Shared in `shared/`; regenerate with `bun cf-typegen`.
- **Custom Styling**: Tailwind config in `tailwind.config.js`; shadcn components ready in `src/components/ui/`.
- **Lint & Types**: `bun lint`, `bun cf-typegen`.

Customize the demo UI in `src/pages/HomePage.tsx` or add routes in `src/main.tsx`.

## Deployment

Deploy to Cloudflare Workers in one command:

```bash
bun install -g wrangler  # If not installed
wrangler login
wrangler deploy
```

Configures automatic asset serving, Durable Objects, and SPA fallback.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/docuflux-intelligent-pdf-data-extraction)

**Bindings**: Ensure `GlobalDurableObject` is bound in `wrangler.jsonc`.

## Customization Notes

- **Do not modify**: `worker/core-utils.ts`, `worker/index.ts`, config files (breaks core functionality).
- **Extend entities**: Use `worker/entities.ts` as template.
- **Seed data**: Auto-seeds on first list call via `ensureSeed`.
- **Error Reporting**: Client errors auto-reported to `/api/client-errors`.

## License

MIT – See [LICENSE](LICENSE) for details.