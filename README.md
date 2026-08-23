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
  uploads/                  Uploaded files storage
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

## Purpose

This repository is organized as a clear separation between client (frontend), server (backend), and domain-specific irrigation logic, making it easier to extend features over time.
