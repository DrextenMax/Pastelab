import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Copy,
  Pin,
  Heart,
  Trash2,
  Code2,
  Link,
  Type,
  Palette,
  Clock,
  Zap,
} from "lucide-react";
import { Input, Badge, Button, Card, ScrollArea } from "@components/ui";
import { staggerContainer, listItem } from "@utils/animations";
import { formatRelativeTime, formatBytes, truncate } from "@utils/format";
import { seedItems } from "@store/clipboard";
import { cn } from "@utils/cn";
import type { ClipboardItem, ClipboardItemType } from "@/types";

const typeIcon: Record<ClipboardItemType, React.ElementType> = {
  text: Type,
  code: Code2,
  url: Link,
  image: Palette,
  color: Palette,
};

const typeColor: Record<ClipboardItemType, string> = {
  text: "default",
  code: "violet",
  url: "cyan",
  image: "emerald",
  color: "amber",
};

const filterTabs = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "code", label: "Code" },
  { id: "url", label: "URLs" },
  { id: "color", label: "Colors" },
] as const;

type FilterId = (typeof filterTabs)[number]["id"];

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          accent ?? "bg-primary-subtle"
        )}
      >
        <Icon size={16} className="text-primary-400" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold tabular-nums text-text">{value}</p>
        <p className="truncate text-2xs text-text-muted">{label}</p>
      </div>
    </Card>
  );
}

// ─── Clipboard item card ───────────────────────────────────────────────────────

function ClipCard({ item }: { item: ClipboardItem }) {
  const [copied, setCopied] = useState(false);
  const Icon = typeIcon[item.type];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div variants={listItem}>
      <Card
        hoverable
        className="group relative cursor-default p-0 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-bg-overlay">
            <Icon size={11} className="text-text-muted" />
          </div>
          <Badge
            variant="subtle"
            color={typeColor[item.type] as never}
            size="xs"
          >
            {item.type}
          </Badge>
          {item.sourceApp && (
            <span className="truncate text-2xs text-text-muted">
              {item.sourceApp}
            </span>
          )}
          <div className="flex-1" />
          {item.isPinned && <Pin size={11} className="text-primary-400" />}
          {item.isFavorite && <Heart size={11} className="text-danger" />}
          <span className="text-2xs text-text-muted">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div className="px-3 py-2.5">
          {item.type === "color" ? (
            <div className="flex items-center gap-2">
              <div
                className="size-6 rounded-md border border-border"
                style={{ backgroundColor: item.content }}
              />
              <code className="text-sm font-mono text-text">{item.content}</code>
            </div>
          ) : (
            <pre
              className={cn(
                "line-clamp-3 text-sm leading-relaxed text-text-secondary",
                item.type === "code" && "font-mono"
              )}
            >
              {truncate(item.content, 220)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 border-t border-border px-3 py-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="xs">
              {tag}
            </Badge>
          ))}
          <div className="flex-1" />
          <span className="text-2xs text-text-muted">{formatBytes(item.size)}</span>

          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopy}
              icon={<Copy size={12} />}
              className="h-6 px-2"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              icon={<Pin size={12} />}
              className="h-6 w-6 p-0"
            />
            <Button
              variant="ghost"
              size="xs"
              icon={<Trash2 size={12} />}
              className="h-6 w-6 p-0 hover:text-danger"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    return seedItems.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.type === activeFilter;
      const matchesQuery =
        !query ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchesFilter && matchesQuery;
    });
  }, [query, activeFilter]);

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-border bg-bg-surface px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text">Dashboard</h1>
            <p className="text-xs text-text-muted">
              {seedItems.length} items in your clipboard history
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Zap size={14} />}>
            Smart Fix
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard
            label="Total items"
            value={seedItems.length}
            icon={Clock}
          />
          <StatCard
            label="Pinned"
            value={seedItems.filter((i) => i.isPinned).length}
            icon={Pin}
          />
          <StatCard
            label="Code snippets"
            value={seedItems.filter((i) => i.type === "code").length}
            icon={Code2}
          />
          <StatCard
            label="Favorites"
            value={seedItems.filter((i) => i.isFavorite).length}
            icon={Heart}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-bg-surface px-5 py-2.5">
        <div className="flex-1">
          <Input
            icon={<Search size={14} />}
            placeholder="Search clipboard…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <div className="flex items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                activeFilter === tab.id
                  ? "bg-primary-subtle text-primary-300"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <ScrollArea className="flex-1 px-5 py-4">
        {filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <Search size={28} className="text-text-muted" />
            <p className="text-sm text-text-secondary">No items match your search</p>
            <p className="text-xs text-text-muted">Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3 lg:grid-cols-2"
          >
            {filtered.map((item) => (
              <ClipCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
}
