# Changelog

All notable changes to PasteLab are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-05-09

### 🎉 Initial Release

**Core**
- Paste any text, code, URL, JSON, color, email, CSV, Markdown, or number
- Real-time content-type detection across 12 categories
- One-click transforms: trim, case conversion, URL encode/decode, JSON format/minify, slug, deburr, and more
- Full diff view showing exactly what changed (word-level, color-coded)
- Undo any transform with `Ctrl+Z`

**Humanize**
- 5-level AI-text humanizer (Subtle → Bold)
- Strips filler phrases, AI openers, and buzzwords
- Live diff highlights every change

**Clipboard Integration**
- Auto-detect clipboard changes (800 ms polling)
- `Ctrl+Shift+V` global quick-open shortcut
- `Ctrl+Shift+C` copy result shortcut
- Clipboard history — last 50 entries, localStorage-persisted
- Own-write suppression prevents re-triggering on copy

**UI & Experience**
- Glassmorphism dark UI — animated background orbs, grain overlay
- Animated splash screen on launch
- 3-step onboarding modal for new users
- Command palette (`⌘K`) with fuzzy search across all actions
- Keyboard shortcuts modal (`?`)
- Slide-in Settings panel (`⌘,`)
- Toast notification system (4 variants, auto-dismiss)
- Fully keyboard-navigable — mouse optional

**Windows**
- NSIS installer with desktop & Start Menu shortcuts
- Decorations-free frameless window with custom TitleBar
- Native app icon (`.ico`, `.icns`, all PNG sizes)

---

## [Unreleased]

- macOS support
- Cloud sync (end-to-end encrypted)
- Custom transform pipelines
- Plugin API
- Multi-item history view
- Regex-powered find & replace
