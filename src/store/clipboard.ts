import { generateId } from "@utils/format";
import type { ClipboardItem, ClipboardItemType } from "@/types";

// ─── Mock seed data ───────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<ClipboardItem> & {
    content: string;
    type: ClipboardItemType;
  }
): ClipboardItem {
  return {
    id: generateId(),
    tags: [],
    isPinned: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    size: overrides.content.length,
    ...overrides,
  };
}

export const seedItems: ClipboardItem[] = [
  makeItem({
    type: "code",
    content: `const fetchUser = async (id: string) => {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json();\n};`,
    language: "typescript",
    sourceApp: "VS Code",
    tags: ["code", "api"],
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  }),
  makeItem({
    type: "url",
    content: "https://tailwindcss.com/docs/configuration",
    sourceApp: "Google Chrome",
    tags: ["docs"],
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
  }),
  makeItem({
    type: "text",
    content:
      "Meeting rescheduled to Thursday at 3pm — please update your calendars and let me know if this works.",
    sourceApp: "Slack",
    tags: ["work"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 22),
  }),
  makeItem({
    type: "color",
    content: "#7C3AED",
    preview: "#7C3AED",
    sourceApp: "Figma",
    tags: ["design"],
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  }),
  makeItem({
    type: "code",
    content: `SELECT u.name, COUNT(o.id) as orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id\nORDER BY orders DESC;`,
    language: "sql",
    sourceApp: "DataGrip",
    tags: ["sql", "db"],
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  }),
  makeItem({
    type: "text",
    content: "npm install framer-motion lucide-react tailwind-merge clsx",
    sourceApp: "Terminal",
    tags: ["terminal"],
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  }),
  makeItem({
    type: "url",
    content: "https://ui.shadcn.com/docs/components/button",
    sourceApp: "Firefox",
    tags: ["docs", "ui"],
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
  }),
  makeItem({
    type: "text",
    content: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    sourceApp: "Notepad",
    tags: ["secret"],
    createdAt: new Date(Date.now() - 1000 * 60 * 240),
  }),
];
