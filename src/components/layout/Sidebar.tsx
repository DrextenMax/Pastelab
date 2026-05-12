import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Pin,
  Settings,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Tooltip } from "@components/ui";
import { slideInLeft } from "@utils/animations";
import type { PageId } from "@/types";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  clipCount?: number;
}

interface NavEntry {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavEntry[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "History", icon: History },
  { id: "pinned", label: "Pinned", icon: Pin },
];

export function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  clipCount,
}: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className={cn(
        "relative flex h-full shrink-0 flex-col",
        "border-r border-border bg-bg-surface"
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex h-14 items-center gap-3 border-b border-border px-3",
          collapsed && "justify-center"
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-subtle ring-1 ring-primary/20">
          <FlaskConical size={16} className="text-primary-400" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 overflow-hidden"
            >
              <p className="truncate text-sm font-bold tracking-tight text-text">
                PasteLab
              </p>
              <p className="truncate text-2xs text-text-muted">
                {clipCount ?? 0} items
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            {...item}
            collapsed={collapsed}
            isActive={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}

        {/* Pro badge section */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              {...slideInLeft}
              className="mt-4 rounded-xl border border-primary/20 bg-primary-subtle p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-primary-400" />
                <span className="text-xs font-semibold text-primary-300">
                  PasteLab Pro
                </span>
              </div>
              <p className="text-2xs leading-relaxed text-text-secondary">
                Unlock sync, unlimited history, and smart transformations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Settings at bottom */}
        <NavItem
          id="settings"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
          isActive={activePage === "settings"}
          onClick={() => onNavigate("settings")}
        />
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "absolute -right-3 top-16 z-10",
          "flex size-6 items-center justify-center rounded-full",
          "border border-border bg-bg-surface text-text-muted shadow-card",
          "transition-all duration-150 hover:border-border-strong hover:text-text"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} />
        ) : (
          <ChevronLeft size={12} />
        )}
      </button>
    </motion.aside>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: number;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({
  label,
  icon: Icon,
  badge,
  collapsed,
  isActive,
  onClick,
}: NavItemProps) {
  const button = (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "nav-item w-full",
        collapsed ? "justify-center px-0" : "",
        isActive && "active"
      )}
    >
      <Icon size={16} className="shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 truncate text-left"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {badge !== undefined && badge > 0 && !collapsed && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-2xs font-bold text-primary-300">
          {badge}
        </span>
      )}
    </motion.button>
  );

  if (collapsed) {
    return <Tooltip content={label} side="right">{button}</Tooltip>;
  }

  return button;
}
