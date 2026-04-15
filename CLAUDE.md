# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NVM Manager (nvm-ui)** - A lightweight nvm desktop manager built with Electron + React + TypeScript + Vite.

- Version: 1.4.2
- License: MIT
- **Package Manager**: pnpm >= 8.0.0 (REQUIRED - enforced by package.json)

## Tech Stack

- **Desktop**: Electron 28.3.3
- **Frontend**: React 18.3.1, TypeScript ~5.4.5
- **Build**: Vite 5.4.11
- **Styling**: Tailwind CSS 3.4.0 + UnoCSS 3.6
- **UI**: Radix UI, Lucide React icons, class-variance-authority

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm electron:dev` | **RECOMMENDED** - Concurrently start Vite + Electron |
| `pnpm dev` | Start Vite dev server (port 5173) |
| `pnpm start` | Start Electron (requires Vite to be running first) |
| `pnpm build` | Build frontend (output to dist/) |
| `pnpm electron:build` | Build full Electron app (output to dist-electron/) |
| `pnpm lint` | ESLint check (strict mode, --max-warnings 0) |
| `pnpm preview` | Preview Vite build |

## Development Workflow

### Hot Reload
- **No restart needed**: `src/**/*.tsx`, `src/**/*.ts`, `src/**/*.css`, `uno.config.ts`
- **Restart required**: `electron/main.cjs`, `vite.config.ts`, `package.json`

### Debugging
- Open Electron DevTools: Ctrl+Shift+I (Windows/Linux) or View → Toggle Developer Tools

## Architecture & Key Files

```
nvm-ui/
├── electron/
│   └── main.cjs          # Electron main process (IPC, window management, nvm integration)
├── src/
│   ├── components/
│   │   ├── Toast.tsx     # Toast notifications
│   │   ├── VersionItem.tsx
│   │   └── Dialog.tsx
│   ├── hooks/
│   │   ├── useElectron.ts   # Electron IPC communication hook
│   │   └── useToast.ts      # Toast notification hook
│   ├── App.tsx           # Main application UI
│   └── main.tsx          # React entry point
```

### Important Configuration
- **Path alias**: `@` maps to `./src` (tsconfig.json + vite.config.ts)
- **Strict TypeScript**: Enabled with no unused vars/params
- **Electron entry**: `electron/main.cjs`
- **Build output**: `dist-electron/` (Electron app), `dist/` (frontend only)

## Key Features
- Display current Node.js version
- View/installed Node.js versions
- One-click version switching (Windows)
- Browse/download available Node.js versions
- Custom title bar with minimize/maximize/close
- Dark theme UI
- Toast notifications
- NVM installation detection
