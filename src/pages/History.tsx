import { motion } from "framer-motion";
import { History as HistoryIcon, Search, Trash2 } from "lucide-react";
import { Button, Input, ScrollArea } from "@components/ui";
import { staggerContainer, listItem } from "@utils/animations";
import { formatRelativeTime } from "@utils/format";
import { seedItems } from "@store/clipboard";
import { cn } from "@utils/cn";

const grouped = seedItems.reduce(
  (acc, item) => {
    const label = formatRelativeTime(item.createdAt).includes("ago")
      ? "Today"
      : "Older";
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  },
  {} as Record<string, typeof seedItems>
);

export function History() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-bg-surface px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text">History</h1>
            <p className="text-xs text-text-muted">
              Full clipboard history — last 30 days
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
          >
            Clear All
          </Button>
        </div>

        <div className="mt-3">
          <Input
            icon={<Search size={14} />}
            placeholder="Search history…"
            className="h-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {group}
              </p>
              <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={listItem}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border bg-bg-card px-3 py-2.5",
                      "cursor-pointer transition-all duration-150",
                      "hover:border-border-strong hover:bg-bg-elevated"
                    )}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg-overlay">
                      <HistoryIcon size={13} className="text-text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">
                        {item.content.slice(0, 80)}
                      </p>
                      <p className="text-2xs text-text-muted">
                        {item.sourceApp} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  );
}
