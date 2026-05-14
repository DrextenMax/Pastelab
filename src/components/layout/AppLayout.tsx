import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { fadeIn } from "@utils/animations";
import type { PageId } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  clipCount?: number;
}

export function AppLayout({
  children,
  activePage,
  onNavigate,
  clipCount,
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-bg" style={{ borderRadius: 12, overflow: "hidden", clipPath: "inset(0 round 12px)" }}>
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          clipCount={clipCount}
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex h-full flex-col overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
