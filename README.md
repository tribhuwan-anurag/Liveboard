# Draw-N-Go

A real-time collaborative drawing application built with Next.js, WebSockets, and Prisma.

## Features

- Real-time collaboration — draw with others simultaneously
- Persistent shapes — drawings are saved to the database and load on refresh
- Multiple shape tools — rectangle, circle, and pencil
- Room-based collaboration — share a room ID to draw together

## Tech Stack

- **Frontend** — Next.js, TypeScript, TailwindCSS
- **Backend** — Express.js, WebSocket (ws)
- **Database** — PostgreSQL with Prisma ORM
- **Monorepo** — Turborepo with pnpm workspaces

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository
```bash
   git clone https://github.com/your-username/Draw-N-Go.git
   cd Liveboard
```

2. Install dependencies
```bash
   pnpm install
```

3. Set up environment variables — create `.env` in `packages/db`
```env
   DATABASE_URL="postgresql://user:password@localhost:5432/drawngo"
```

4. Run database migrations
```bash
   pnpm db:migrate
```

### Running the App

Start all services:
```bash
pnpm dev
```

Or start individually:
```bash
# HTTP backend (port 3001)
cd apps/http-backend && pnpm dev

# WebSocket backend (port 8080)
cd apps/ws-backend && pnpm dev

# Frontend (port 3000)
cd apps/web && pnpm dev
```

## Usage

1. Sign up and sign in
2. Create a room
3. Share the room ID with others
4. Start drawing together in real time

## License

MIT
