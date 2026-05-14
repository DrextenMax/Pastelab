import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingBackground } from "@components/app/FloatingBackground";
import { ClipPanel } from "@components/app/ClipPanel";
import { SplashScreen } from "@components/app/SplashScreen";
import { ToastProvider } from "@context/ToastContext";
import { ThemeProvider } from "@context/ThemeContext";
import { ToastContainer } from "@components/ui/ToastContainer";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleReady = useCallback(() => setSplashDone(true), []);

  return (
    <ThemeProvider>
    <ToastProvider>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {!splashDone ? (
            <SplashScreen key="splash" onReady={handleReady} />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <FloatingBackground />
              <ClipPanel />
              <ToastContainer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
    </ThemeProvider>
  );
}
