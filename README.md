# Irrigate

A full-stack irrigation planning app.

The project helps users manage gardens and irrigation lines, and run irrigation calculations based on configurable line and dripper settings.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: MongoDB (via Mongoose)

## Project Structure

```text
13_Irrigate/
  frontend/                 React client app (UI, routing, state, pages)
  backend/                  Express API (controllers, routes, models, domain)
  additional_files/         Reference/config scripts and sample data files
   uploads/                  Legacy local uploads storage for older records
  package.json              Root-level scripts and workspace metadata
  README.md                 Project summary
```

## Main Folders

### frontend/
- `src/ui/`: pages and UI components
- `src/router/`: route definitions and guards
- `src/store/`: Redux store, slices, and APIs
- `src/hooks/`: reusable React hooks
- `src/styles/`: global styling

### backend/
- `src/index.ts`: API bootstrap and middleware setup
- `src/controllers/`: request handlers
- `src/routes/`: API route definitions
- `src/models/`: MongoDB/Mongoose models
- `src/domain/irrigation/`: irrigation calculation logic
- `src/middleware/`: cross-cutting request middleware

## Run Locally

1. Install dependencies:
   - `npm install`
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Start backend:
   - `cd backend && npm run dev`
3. Start frontend:
   - `cd frontend && npm run dev`

## R2 Signed Upload Deployment

Garden photos now use direct browser-to-R2 uploads with signed URLs. The backend no longer stores new photos on the local filesystem.

### Backend environment

Set these variables in the production backend environment:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_UPLOAD_URL_TTL_SECONDS` (optional, default `300`)
- `R2_ASSET_URL_TTL_SECONDS` (optional, default `3600`)

The backend will fail fast on startup in production if the required R2 variables are missing.

### Frontend and API flow

1. The frontend requests a signed upload URL from `POST /api/uploads/gardens/photo-url`.
2. The browser uploads the image directly to Cloudflare R2 with `PUT`.
3. The frontend sends the returned `photoKey` when creating or updating the garden.
4. The backend stores the object key in MongoDB and returns a signed read URL in the `photo` field.

### R2 bucket CORS

Configure the R2 bucket to allow your frontend origin to send `PUT` requests with the `Content-Type` header. In production, that should match the value you expose through `FRONTEND_URL` on the backend.

## Purpose

This repository is organized as a clear separation between client (frontend), server (backend), and domain-specific irrigation logic, making it easier to extend features over time.
