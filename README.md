# PoE 2 Filter Manager

A simple item filter manager for **Path of Exile 2**.

This project was built to explore better tooling for managing complex Path of Exile 2 item filters, which are traditionally edited manually.

It provides a UI for building/editing filter “blocks”, and a small API + Postgres database for saving and loading filters by token.

The frontend is currently hosted at:

- https://poe2filter.versus-gaming.eu

> This repo contains both the React frontend and the Node/Express backend.

## What you can do

- Import item filters from `.filter` files
- Edit filters with a UI
- Save filters back to a file / download as `.filter`
- Drag & drop to reorder filter blocks
- Add/remove blocks and rules
- Persist filters via an API backed by Postgres

## Repo layout

- `front/` – Vite + React + Chakra UI frontend
- `back/` – Express + TypeScript API
- `docker-compose.yml` – dev-friendly stack: frontend + backend + Postgres

## How it works (high level)

### Token model

The backend issues a token (via `GET /get-token`). The frontend stores it in `localStorage` and sends it in the header:

- `Authorization: Token <token>`

Most API routes require a valid token.

### API endpoints (current)

Base URL is configured in the frontend via `VITE_API_URL` (Vite env).

- `GET /get-token` – create a new user/token
- `GET /check-token` – validate token (requires `Authorization` header)
- `GET /get-filters` – list filters for token (requires `Authorization`)
- `GET /get-filter/:id` – fetch a single filter (token is accepted if present)
- `POST /create-filter` – create filter (requires `Authorization`)
- `PUT /update-filter` – update filter (requires `Authorization`)

Notes:

- A couple endpoints are stubbed in code (`/create-link`, `/delete-filter`).

## Running with Docker (recommended)

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3000`
- Postgres on `localhost:5432`

### Prereqs

- Docker + Docker Compose

### Start

```bash
docker compose up --build
```

#### Environment variables

Both Docker images support a convenient fallback: if a real `.env` file is missing, they’ll copy `.env.example` to `.env` during the image build.

The backend reads configuration from environment variables (via `dotenv`).

There’s an example file you can copy:

- `back/.env.example` → `back/.env`

**Backend** (`back/.env`) variables:

- `PORT=3000`
- `DB_USER=postgres`
- `DB_HOST=db` (when using docker-compose)
- `DB_NAME=postgres` (or your DB)
- `DB_PASSWORD=postgres`
- `DB_PORT=5432`

The frontend uses Vite env (`import.meta.env`) for the API base URL.

There’s an example file you can copy:

- `front/.env.example` → `front/.env`

**Frontend** (`front/.env`) variables:

- `VITE_API_URL=http://localhost:3000`

## Running locally (without Docker)

### Prereqs

- Node.js (the Dockerfiles use Node 22)
- Yarn
- A Postgres instance

### Backend

From `back/`:

```bash
yarn install
yarn dev
```

The API reads configuration from environment variables (see above).

### Frontend

From `front/`:

```bash
yarn install
yarn dev
```

## Troubleshooting

### Frontend can’t reach the backend

- Confirm `VITE_API_URL` points at your backend, e.g. `http://localhost:3000`.
- If you changed how `VITE_API_URL` is provided, restart the Vite dev server.

### Backend can’t connect to Postgres

- For docker-compose the DB host should be `db`.
- Make sure `DB_PORT` is numeric (defaults to `5432`).

## Tech stack

- Frontend: React + TypeScript + Vite + Chakra UI
- Backend: Express + TypeScript + `pg`
- Database: Postgres

## License

MIT (see package metadata).
