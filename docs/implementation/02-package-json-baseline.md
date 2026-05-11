# Package JSON Baseline

This is a starting template. Validate exact package versions against `@evefrontier/dapp-kit` peer dependencies before committing.

```json
{
  "name": "signal-vault",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24 <27",
    "pnpm": ">=10"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@evefrontier/dapp-kit": "latest",
    "@tanstack/react-query": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router": "latest",
    "zustand": "latest",
    "zod": "latest",
    "dexie": "latest",
    "tailwindcss": "latest",
    "@tailwindcss/vite": "latest",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest",
    "jsdom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/dom": "latest",
    "@testing-library/user-event": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "typescript-eslint": "latest",
    "prettier": "latest"
  }
}
```

## Version Policy

After install, lock the versions in `pnpm-lock.yaml`.

Do not let AI assistants repeatedly update dependencies unless there is a specific incompatibility or security issue.
