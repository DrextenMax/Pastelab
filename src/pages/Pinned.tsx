import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import { Card, ScrollArea } from "@components/ui";
import { staggerContainer, listItem } from "@utils/animations";
import { seedItems } from "@store/clipboard";

const pinned = seedItems.filter((i) => i.isPinned);

export function Pinned() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-bg-surface px-5 py-4">
        <h1 className="text-lg font-bold text-text">Pinned</h1>
        <p className="text-xs text-text-muted">
          {pinned.length} pinned items — always at hand
        </p>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        {pinned.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-bg-elevated">
              <Pin size={24} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">No pinned items yet</p>
            <p className="text-xs text-text-muted">
              Pin items from the Dashboard to keep them accessible.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3 lg:grid-cols-2"
          >
            {pinned.map((item) => (
              <motion.div key={item.id} variants={listItem}>
                <Card hoverable>
                  <div className="mb-2 flex items-center gap-2">
                    <Pin size={12} className="text-primary-400" />
                    <span className="text-xs font-medium text-primary-300">
                      Pinned
                    </span>
                    <div className="flex-1" />
                    <span className="text-2xs text-text-muted">
                      {item.sourceApp}
                    </span>
                  </div>
                  <pre className="line-clamp-3 text-sm text-text-secondary">
                    {item.content}
                  </pre>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
}
