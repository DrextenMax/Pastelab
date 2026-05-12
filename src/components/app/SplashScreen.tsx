// ─── Splash screen ────────────────────────────────────────────────────────────
// Shown for ~1.2 s on first paint while the app hydrates.

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";

interface SplashScreenProps {
  onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  useEffect(() => {
    const t = setTimeout(onReady, 1250);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#06060f" }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(109,40,217,0.22) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.72, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 22 }}
        className="relative mb-6"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-5 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />

        {/* Icon container */}
        <div
          className="relative flex size-[72px] items-center justify-center rounded-[22px]"
          style={{
            background: "linear-gradient(145deg, rgba(139,92,246,0.45) 0%, rgba(109,40,217,0.7) 100%)",
            border: "1px solid rgba(167,139,250,0.35)",
            boxShadow:
              "0 0 40px rgba(109,40,217,0.5), 0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <FlaskConical size={32} style={{ color: "#e9d5ff" }} strokeWidth={1.75} />
        </div>
      </motion.div>

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-2 text-[22px] font-bold tracking-tight"
        style={{ color: "rgba(255,255,255,0.92)" }}
      >
        PasteLab
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.34, duration: 0.5 }}
        className="text-[13px]"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Paste anything. Improve everything.
      </motion.p>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="absolute bottom-12 overflow-hidden rounded-full"
        style={{
          width: 120,
          height: 2,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ delay: 0.5, duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
          className="h-full w-full rounded-full"
          style={{
            background: "linear-gradient(to right, transparent, rgba(139,92,246,0.9), transparent)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
