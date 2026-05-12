# Contributing to PasteLab

Thank you for your interest in PasteLab! We welcome contributions of all kinds — bug reports, feature ideas, documentation improvements, and code.

---

## Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/DrextenMax/Pastelab.git
cd pastelab

# 2. Install dependencies
npm install

# 3. Start the dev server (Tauri + Vite HMR)
npm run tauri dev
```

> **Prerequisites:** [Node.js 18+](https://nodejs.org), [Rust + Cargo](https://rustup.rs), [Tauri CLI prerequisites for Windows](https://tauri.app/start/prerequisites/)

---

## Project Structure

```
pastelab/
├── src/                        # React frontend
│   ├── components/
│   │   ├── app/                # Feature components (ClipPanel, CommandPalette, …)
│   │   ├── layout/             # TitleBar, Sidebar, AppLayout
│   │   └── ui/                 # Primitive UI (Button, Card, Toast, …)
│   ├── context/                # React context providers (Toast)
│   ├── hooks/                  # Custom hooks (useSettings, useClipboardHistory, …)
│   ├── pages/                  # Full-page views (Dashboard, History, …)
│   ├── store/                  # Seed / mock data
│   ├── styles/                 # globals.css + Tailwind base
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Pure helpers (transforms, diff, humanize, …)
├── src-tauri/                  # Rust backend
│   ├── src/                    # lib.rs, main.rs
│   ├── icons/                  # App icons (generated — source: icon.svg)
│   ├── capabilities/           # Tauri permission manifest
│   └── tauri.conf.json         # Tauri app config
├── public/                     # Static assets
└── scripts/                    # Dev/build helper scripts
```

---

## Development Workflow

### Branch naming
| Type | Pattern |
|------|---------|
| Feature | `feat/short-description` |
| Bug fix | `fix/short-description` |
| Docs | `docs/short-description` |
| Refactor | `refactor/short-description` |
| Chore | `chore/short-description` |

### Commit style
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add regex find-and-replace transform
fix: clipboard watcher fires on own writes
docs: update keyboard shortcuts table in README
chore: bump framer-motion to 11.4
```

### Before opening a PR
```bash
npm run type-check   # zero TypeScript errors
npm run lint         # zero ESLint warnings
npm run build        # clean production bundle
```

---

## Adding a Transform

All transforms live in `src/utils/transforms.ts`. Each entry is a `TransformFn` record:

```typescript
{
  id: "my-transform",
  label: "My Transform",
  description: "What it does in one sentence",
  icon: SomeLucideIcon,
  types: ["text"],          // which content types to show it for
  fn: (text) => doSomething(text),
}
```

Add a corresponding command entry in `src/components/app/CommandPalette.tsx` and a keyboard shortcut row in `src/components/app/KeyboardShortcutsModal.tsx` if applicable.

---

## Reporting Bugs

Use the **Bug Report** issue template. Please include:
- PasteLab version (shown in Settings → About)
- Windows version
- Steps to reproduce
- What you expected vs. what happened
- Console output if relevant (DevTools: `Ctrl+Shift+I` in dev mode)

---

## Feature Requests

Use the **Feature Request** issue template. Describe the problem you're trying to solve, not just the solution. We can discuss implementation together.

---

## Code Style

- **TypeScript strict mode** — no `any`, no unused variables
- **Framer Motion** for all animations — no raw CSS transitions on interactive elements
- **Tailwind** for layout/spacing; inline `style={}` for dynamic values (colors, opacities)
- **Lucide React** for all icons — keep icon size consistent (`size={13}` in headers, `size={16}` in nav)
- Components are co-located with their feature folder
- Hooks always start with `use`, return typed objects (not arrays unless it mirrors `useState`)

---

## License

By contributing you agree that your contributions will be licensed under the [MIT License](./LICENSE).
