import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@context/ThemeContext";

// ─── Noise grain ─────────────────────────────────────────────────────────────
const NOISE_FILTER = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="200" height="200" filter="url(#noise)" opacity="0.04" />
  </svg>
`;
const NOISE_DATA = `data:image/svg+xml;base64,${btoa(NOISE_FILTER)}`;

// ─── Dark aurora ribbons ──────────────────────────────────────────────────────
const darkRibbons = [
  {
    style: {
      left: "-40%", right: "-40%", top: "5%", height: "45%",
      background: "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(109,40,217,0.32) 0%, rgba(76,29,149,0.14) 45%, transparent 75%)",
      filter: "blur(55px)",
    },
    animate: { x: ["-4%","6%","-2%","5%","-4%"], scaleX:[1,1.08,0.96,1.05,1], scaleY:[1,1.12,0.92,1.07,1], opacity:[0.65,0.90,0.55,0.80,0.65] },
    duration: 20,
  },
  {
    style: {
      left: "-30%", right: "-30%", top: "8%", height: "38%",
      background: "radial-gradient(ellipse 75% 45% at 55% 45%, rgba(6,182,212,0.28) 0%, rgba(14,116,144,0.10) 50%, transparent 78%)",
      filter: "blur(48px)",
    },
    animate: { x:["6%","-7%","3%","-5%","6%"], scaleX:[1,1.10,0.93,1.06,1], scaleY:[1,0.88,1.10,0.94,1], opacity:[0.50,0.78,0.40,0.68,0.50] },
    duration: 26,
  },
  {
    style: {
      left: "-20%", right: "-20%", top: "18%", height: "20%",
      background: "radial-gradient(ellipse 90% 35% at 42% 55%, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.12) 55%, transparent 80%)",
      filter: "blur(28px)",
    },
    animate: { x:["-8%","10%","-5%","8%","-8%"], scaleX:[0.95,1.15,0.90,1.08,0.95], opacity:[0.55,0.85,0.45,0.75,0.55] },
    duration: 14,
  },
  {
    style: {
      left: "-25%", right: "-25%", top: "25%", height: "25%",
      background: "radial-gradient(ellipse 70% 40% at 60% 50%, rgba(20,184,166,0.20) 0%, rgba(6,182,212,0.08) 50%, transparent 78%)",
      filter: "blur(42px)",
    },
    animate: { x:["3%","-9%","6%","-4%","3%"], scaleX:[1,1.09,0.92,1.04,1], opacity:[0.40,0.65,0.30,0.55,0.40] },
    duration: 31,
  },
  {
    style: {
      left: "-50%", right: "-50%", top: "-5%", height: "55%",
      background: "radial-gradient(ellipse 60% 60% at 48% 50%, rgba(67,20,120,0.18) 0%, rgba(45,12,90,0.06) 55%, transparent 80%)",
      filter: "blur(70px)",
    },
    animate: { x:["-2%","3%","-1%","2%","-2%"], opacity:[0.50,0.70,0.40,0.65,0.50] },
    duration: 38,
  },
  {
    style: {
      left: "5%", right: "5%", top: "20%", height: "8%",
      background: "linear-gradient(to right, transparent 0%, rgba(139,92,246,0.22) 20%, rgba(6,182,212,0.28) 50%, rgba(109,40,217,0.20) 80%, transparent 100%)",
      filter: "blur(14px)",
    },
    animate: { x:["-6%","8%","-3%","6%","-6%"], scaleX:[0.90,1.12,0.88,1.08,0.90], scaleY:[1,1.40,0.80,1.25,1], opacity:[0.45,0.80,0.30,0.70,0.45] },
    duration: 11,
  },
  {
    style: {
      left: "-10%", right: "-10%", top: "0%", height: "28%",
      background: "radial-gradient(ellipse 80% 50% at 38% 60%, rgba(192,132,252,0.14) 0%, rgba(139,92,246,0.06) 55%, transparent 80%)",
      filter: "blur(36px)",
    },
    animate: { x:["5%","-6%","2%","-4%","5%"], scaleX:[1,1.07,0.94,1.04,1], opacity:[0.35,0.58,0.25,0.50,0.35] },
    duration: 17,
  },
];

// ─── Light aurora ribbons (pastel, multiply blend) ────────────────────────────
const lightRibbons = [
  {
    style: {
      left: "-40%", right: "-40%", top: "0%", height: "55%",
      background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.22) 0%, rgba(167,139,250,0.08) 50%, transparent 75%)",
      filter: "blur(60px)",
    },
    animate: { x:["-4%","6%","-2%","5%","-4%"], scaleX:[1,1.08,0.96,1.05,1], opacity:[0.70,0.95,0.55,0.85,0.70] },
    duration: 22,
  },
  {
    style: {
      left: "-30%", right: "-30%", top: "5%", height: "42%",
      background: "radial-gradient(ellipse 75% 45% at 55% 45%, rgba(6,182,212,0.18) 0%, rgba(103,232,249,0.08) 50%, transparent 78%)",
      filter: "blur(50px)",
    },
    animate: { x:["6%","-7%","3%","-5%","6%"], scaleX:[1,1.10,0.93,1.06,1], opacity:[0.55,0.80,0.40,0.70,0.55] },
    duration: 28,
  },
  {
    style: {
      left: "-20%", right: "-20%", top: "18%", height: "22%",
      background: "radial-gradient(ellipse 90% 35% at 42% 55%, rgba(192,132,252,0.28) 0%, rgba(139,92,246,0.10) 55%, transparent 80%)",
      filter: "blur(30px)",
    },
    animate: { x:["-8%","10%","-5%","8%","-8%"], scaleX:[0.95,1.15,0.90,1.08,0.95], opacity:[0.50,0.75,0.35,0.65,0.50] },
    duration: 15,
  },
  {
    style: {
      left: "-25%", right: "-25%", top: "25%", height: "28%",
      background: "radial-gradient(ellipse 70% 40% at 60% 50%, rgba(244,114,182,0.15) 0%, rgba(236,72,153,0.06) 50%, transparent 78%)",
      filter: "blur(45px)",
    },
    animate: { x:["3%","-9%","6%","-4%","3%"], scaleX:[1,1.09,0.92,1.04,1], opacity:[0.40,0.60,0.25,0.50,0.40] },
    duration: 33,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function FloatingBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="dark-bg"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{ background: "linear-gradient(175deg, #04040e 0%, #06060f 45%, #050510 100%)" }}
          >
            {/* Dot grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.018) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Aurora ribbon system */}
            <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
              {darkRibbons.map((r, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={r.style as React.CSSProperties}
                  animate={r.animate}
                  transition={{ duration: r.duration, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: i * 1.7 }}
                />
              ))}
            </div>

            {/* Shimmer line */}
            <motion.div
              className="absolute inset-x-0"
              style={{
                top: "14%", height: "2px",
                background: "linear-gradient(to right, transparent 0%, rgba(139,92,246,0.55) 25%, rgba(6,182,212,0.65) 50%, rgba(109,40,217,0.50) 75%, transparent 100%)",
                filter: "blur(2px)",
              }}
              animate={{ opacity:[0.25,0.70,0.20,0.65,0.25], scaleX:[0.85,1.08,0.80,1.05,0.85], y:[0,4,-3,2,0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />
            <motion.div
              className="absolute inset-x-0"
              style={{ top:"calc(14% + 2px)", height:"60px", background:"linear-gradient(to bottom, rgba(109,40,217,0.10) 0%, rgba(6,182,212,0.06) 50%, transparent 100%)", filter:"blur(12px)" }}
              animate={{ opacity:[0.30,0.65,0.20,0.55,0.30] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />

            {/* Noise */}
            <div className="absolute inset-0" style={{ backgroundImage:`url("${NOISE_DATA}")`, backgroundRepeat:"repeat", backgroundSize:"200px 200px", mixBlendMode:"overlay", opacity:0.35 }} />
            {/* Vignette */}
            <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 85% 75% at 50% 40%, transparent 30%, rgba(4,4,14,0.72) 100%)" }} />
            <div className="absolute inset-x-0 top-0 h-20" style={{ background:"linear-gradient(to bottom, rgba(4,4,14,0.60), transparent)" }} />
            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background:"linear-gradient(to top, rgba(4,4,14,0.50), transparent)" }} />
          </motion.div>
        ) : (
          <motion.div
            key="light-bg"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{ background: "linear-gradient(175deg, #f7f5ff 0%, #ede9fe 45%, #f0f9ff 100%)" }}
          >
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(109,40,217,0.07) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Light aurora ribbons — multiply blend darkens light bg */}
            <div className="absolute inset-0" style={{ mixBlendMode: "multiply" }}>
              {lightRibbons.map((r, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={r.style as React.CSSProperties}
                  animate={r.animate}
                  transition={{ duration: r.duration, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: i * 2.1 }}
                />
              ))}
            </div>

            {/* Light shimmer line */}
            <motion.div
              className="absolute inset-x-0"
              style={{
                top: "14%", height: "2px",
                background: "linear-gradient(to right, transparent 0%, rgba(139,92,246,0.35) 25%, rgba(6,182,212,0.40) 50%, rgba(109,40,217,0.30) 75%, transparent 100%)",
                filter: "blur(2px)",
              }}
              animate={{ opacity:[0.20,0.55,0.15,0.50,0.20], scaleX:[0.85,1.08,0.80,1.05,0.85] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />

            {/* Noise */}
            <div className="absolute inset-0" style={{ backgroundImage:`url("${NOISE_DATA}")`, backgroundRepeat:"repeat", backgroundSize:"200px 200px", mixBlendMode:"overlay", opacity:0.15 }} />
            {/* Soft edge fade */}
            <div className="absolute inset-x-0 top-0 h-20" style={{ background:"linear-gradient(to bottom, rgba(247,245,255,0.70), transparent)" }} />
            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background:"linear-gradient(to top, rgba(240,249,255,0.60), transparent)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
