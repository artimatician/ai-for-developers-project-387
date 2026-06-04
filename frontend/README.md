# Schedule a Call — Frontend

Next.js frontend for the appointment scheduling service.

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
npm install
```

## Running with Mock API

Starts both the mock API server (Stoplight Prism) and the Next.js dev server with a single command:

```bash
./start-mock.sh
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The script:

1. Compiles the TypeSpec spec to OpenAPI YAML
2. Kills any stale processes on ports 3000/4010
3. Starts Prism mock API server on port 4010
4. Waits for the mock server to respond to health checks
5. Starts Next.js dev server on port 3000
6. Cleans up all servers on Ctrl+C

## Running Servers Separately

For more control, run each server in its own terminal:

```bash
# Terminal 1 — Mock API (compiles spec + starts Prism on port 4010)
npm run mock:api

# Terminal 2 — Next.js dev server (port 3000)
npm run dev
```

## Other Commands

```bash
npm run build:spec    # Compile TypeSpec → OpenAPI YAML
npm run gen:types     # Generate TypeScript types from OpenAPI spec
```

## Environment

| File | Purpose |
|---|---|
| `.env.development` | Used by `next dev`. Points `NEXT_PUBLIC_API_URL` to `http://localhost:4010` (mock API) |
| `.env.local` | Create this to override for the real Django backend (`http://localhost:8000`) |
