# Borrow Before Buy (BBB)

> *"Why buy it for one lab? Borrow it from someone in your batch."*

Borrow Before Buy is a trusted, campus-only peer-to-peer sharing web application built for college students to borrow short-term items (scientific calculators, HDMI cables, lab coats, tripods, stationery) from verified peers.

---

## Non-Negotiable Invariants

1. **Zero Financial Processing**: BBB **never** touches, holds, processes, or transfers money. All security amounts and tips are strictly offline acknowledgements settled directly between the two students.
2. **Authoritative Backend State Engine**: All transaction state transitions are governed by a single backend service function with PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
3. **Dynamic QR Handover**: Handover requires a dynamic, single-use, 5-minute signed QR code scanned by the borrower.
4. **Campus-Only Safety**: Meeting points are restricted to verified public campus spots (e.g. *Library Steps*, *Block A Lobby*, *Canteen*). No room or phone number exposure.
5. **Universal Email & Instant Activation**: Registrations support personal emails (Gmail, Outlook, Yahoo) as well as college emails, with instant account activation.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide React, Sonner, Framer Motion, HTML5-QRCode, Recharts.
- **Backend**: Node.js 20, Express.js (ESM), Prisma ORM, PostgreSQL 16, Argon2id, JWT (httpOnly cookies), Multer, Pino Logger, Node-Cron, Socket.IO.
- **Dev Tooling**: Docker Compose (Postgres 16 + Mailpit SMTP), Vitest, Supertest.

---

## Cloud Deployment

Deploy the entire stack for free in under 5 minutes:
- **Frontend**: Hosted on [Vercel](https://vercel.com)
- **Backend**: Hosted on [Render](https://render.com)
- **Database**: Serverless PostgreSQL on [Neon.tech](https://neon.tech)

👉 Follow the complete step-by-step instructions in [**DEPLOYMENT.md**](./DEPLOYMENT.md).

---

## Quickstart Setup (Local Development)

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose (or local PostgreSQL 16)

### 2. Start PostgreSQL & Mailpit
```bash
docker compose up -d
```
- **Postgres**: `localhost:5432` (`bbb_user` / `bbb_password`)
- **Mailpit Web UI**: [http://localhost:8025](http://localhost:8025)

### 3. Install Dependencies
```bash
# In backend
cd backend
npm install
npx prisma generate

# In frontend
cd ../frontend
npm install
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (Port 5173)
cd frontend
npm run dev
```

### 5. Run Tests
```bash
cd backend
npm test
```

---

## Creator Note
Built with care as a mini-project by **Deepu Rao**, B.Tech CSE (AIML), Lloyd Institute of Engineering & Technology.
