# CivicVoice

A full-stack civic issue reporting platform where citizens can report, track, and resolve local issues in their community.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | SSR, routing, optimization |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| Backend | Express.js | RESTful API server |
| Database | MongoDB + Mongoose | NoSQL database with ODM |
| Auth | Firebase Auth | Google & Facebook login |
| Storage | Firebase Storage | Photo/video uploads |
| Maps | Leaflet + OpenStreetMap | GPS tagging & map display |

## Project Structure

```
major/
├── client/          # Next.js frontend
├── server/          # Express backend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project (Auth + Storage enabled)

### Setup

1. **Clone & install dependencies**
   ```bash
   # Frontend
   cd client && npm install

   # Backend
   cd server && npm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy templates and fill in your values
   cp client/.env.example client/.env.local
   cp server/.env.example server/.env
   ```

3. **Start development servers**
   ```bash
   # From root — starts both client and server
   npm run dev
   ```

   - Client: [http://localhost:3000](http://localhost:3000)
   - Server: [http://localhost:5000](http://localhost:5000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client & server |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
