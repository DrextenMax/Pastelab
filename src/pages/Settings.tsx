import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Keyboard,
  Database,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Separator } from "@components/ui";
import { staggerContainer, listItem } from "@utils/animations";
import { cn } from "@utils/cn";

interface SettingRowProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function SettingRow({ label, description, children, onClick }: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        )}
      </div>
      {children ?? (onClick && <ChevronRight size={14} className="shrink-0 text-text-muted" />)}
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors duration-200",
        enabled ? "bg-primary" : "bg-bg-overlay"
      )}
      aria-checked={enabled}
      role="switch"
    >
      <motion.span
        animate={{ x: enabled ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-0.5 block size-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
}

const sections: Section[] = [
  { id: "appearance", icon: Moon, title: "Appearance" },
  { id: "shortcuts", icon: Keyboard, title: "Shortcuts" },
  { id: "storage", icon: Database, title: "Storage" },
  { id: "notifications", icon: Bell, title: "Notifications" },
  { id: "privacy", icon: Shield, title: "Privacy" },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState("appearance");
  const [autoStart, setAutoStart] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="flex h-full">
      {/* Section nav */}
      <div className="w-44 shrink-0 border-r border-border bg-bg-surface p-3">
        <p className="mb-2 px-2 text-2xs font-semibold uppercase tracking-widest text-text-muted">
          Settings
        </p>
        <nav className="flex flex-col gap-0.5">
          {sections.map(({ id, icon: Icon, title }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150",
                activeSection === id
                  ? "bg-primary-subtle text-primary-300"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text"
              )}
            >
              <Icon size={14} className="shrink-0" />
              {title}
            </button>
          ))}
        </nav>
      </div>

      {/* Section content */}
      <motion.div
        key={activeSection}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-6 py-5"
      >
        {activeSection === "appearance" && (
          <motion.div variants={listItem} className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-text">Appearance</h2>
              <p className="text-xs text-text-muted">
                Customize how PasteLab looks on your desktop.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {(["dark", "light", "system"] as const).map((t) => (
                    <button
                      key={t}
                      className={cn(
                        "rounded-xl border py-3 text-xs font-medium capitalize transition-all",
                        t === "dark"
                          ? "border-primary/40 bg-primary-subtle text-primary-300"
                          : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Motion</CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-3" />
                <SettingRow
                  label="Reduced motion"
                  description="Simplify animations for accessibility"
                >
                  <Toggle enabled={reducedMotion} onToggle={() => setReducedMotion((v) => !v)} />
                </SettingRow>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeSection === "storage" && (
          <motion.div variants={listItem} className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-text">Storage</h2>
              <p className="text-xs text-text-muted">
                Manage clipboard history and data limits.
              </p>
            </div>

            <Card>
              <CardContent>
                <SettingRow
                  label="History limit"
                  description="Maximum number of stored items"
                >
                  <span className="text-xs font-semibold text-primary-300">
                    500 items
                  </span>
                </SettingRow>
                <Separator />
                <SettingRow
                  label="Auto-start on login"
                  description="Launch PasteLab when Windows starts"
                >
                  <Toggle enabled={autoStart} onToggle={() => setAutoStart((v) => !v)} />
                </SettingRow>
                <Separator />
                <SettingRow
                  label="Cloud sync"
                  description="Sync clipboard history across devices"
                >
                  <Toggle enabled={syncEnabled} onToggle={() => setSyncEnabled((v) => !v)} />
                </SettingRow>
              </CardContent>
            </Card>

            <Button variant="danger" size="sm" className="self-start">
              Clear all history
            </Button>
          </motion.div>
        )}

        {activeSection === "notifications" && (
          <motion.div variants={listItem} className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-text">Notifications</h2>
              <p className="text-xs text-text-muted">
                Control when PasteLab alerts you.
              </p>
            </div>

            <Card>
              <CardContent>
                <SettingRow
                  label="System notifications"
                  description="Show Windows notifications for new clips"
                >
                  <Toggle
                    enabled={notifications}
                    onToggle={() => setNotifications((v) => !v)}
                  />
                </SettingRow>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(activeSection === "shortcuts" || activeSection === "privacy") && (
          <motion.div variants={listItem}>
            <p className="text-sm text-text-secondary">
              This section is coming soon.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
