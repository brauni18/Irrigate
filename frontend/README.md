# Irrigate Frontend

Frontend application for the Irrigate project.

Built with React, TypeScript, and Vite. It provides the user interface for authentication, garden management, irrigation line setup, and calculation workflows.

## Structure

```text
frontend/
  src/
    App.tsx                 App entry wrapper
    main.tsx                React bootstrap
    ui/                     Pages and UI components
    router/                 Route config and guards
    store/                  Redux store, slices, APIs
    hooks/                  Reusable custom hooks
    services/               API-facing service layer
    types/                  Frontend TypeScript types
    consts/                 Constants and UI strings
    styles/                 Global styles
    shadcn/                 Shared design-system components
  public/                   Static public assets
  vite.config.ts            Vite configuration
```

## Development

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build: `npm run build`
4. Preview build: `npm run preview`
