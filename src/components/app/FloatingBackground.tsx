import { motion } from "framer-motion";

// ─── Orb definitions ─────────────────────────────────────────────────────────

const orbs = [
  {
    size: "720px",
    color: "radial-gradient(circle at 40% 40%, rgba(109,40,217,0.22) 0%, rgba(76,29,149,0.08) 60%, transparent 80%)",
    pos: { top: "-260px", left: "-200px" },
    path: { x: [0, 60, -30, 20, 0], y: [0, 40, 70, -25, 0] },
    dur: 26,
    blur: "0px",
  },
  {
    size: "600px",
    color: "radial-gradient(circle at 60% 40%, rgba(6,182,212,0.16) 0%, rgba(14,116,144,0.06) 60%, transparent 80%)",
    pos: { top: "-200px", right: "-180px" },
    path: { x: [0, -50, 30, -20, 0], y: [0, 60, -25, 45, 0] },
    dur: 32,
    blur: "0px",
  },
  {
    size: "500px",
    color: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.04) 60%, transparent 80%)",
    pos: { bottom: "-150px", left: "25%" },
    path: { x: [0, 35, -55, 25, 0], y: [0, -35, 30, -45, 0] },
    dur: 21,
    blur: "0px",
  },
  {
    size: "340px",
    color: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.11) 0%, transparent 70%)",
    pos: { bottom: "5%", right: "8%" },
    path: { x: [0, -30, 45, 0], y: [0, 45, -35, 0] },
    dur: 17,
    blur: "0px",
  },
  // Extra aurora streak
  {
    size: "900px",
    color: "radial-gradient(ellipse at 50% 50%, rgba(109,40,217,0.07) 0%, transparent 65%)",
    pos: { top: "30%", left: "-20%" },
    path: { x: [0, 80, -40, 0], y: [0, -60, 40, 0] },
    dur: 38,
    blur: "0px",
  },
];

// ─── Noise SVG filter (grain texture) ────────────────────────────────────────

const NOISE_FILTER = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="200" height="200" filter="url(#noise)" opacity="0.035" />
  </svg>
`;

const NOISE_DATA = `data:image/svg+xml;base64,${btoa(NOISE_FILTER)}`;

export function FloatingBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #060612 0%, #07070f 50%, #050510 100%)" }}
    >
      {/* ── Noise grain texture ───────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${NOISE_DATA}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "overlay",
          opacity: 0.4,
        }}
      />

      {/* ── Dot grid ──────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.022) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Gradient orbs ─────────────────────────────────── */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: orb.blur ? `blur(${orb.blur})` : undefined,
            ...orb.pos,
          }}
          animate={orb.path}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          }}
        />
      ))}

      {/* ── Aurora horizontal band ────────────────────────── */}
      <motion.div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "15%",
          height: "1px",
          background:
            "linear-gradient(to right, transparent 5%, rgba(109,40,217,0.18) 30%, rgba(6,182,212,0.12) 60%, transparent 95%)",
          filter: "blur(1px)",
        }}
        animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.9, 1.05, 0.9] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "calc(15% + 2px)",
          height: "40px",
          background:
            "linear-gradient(to bottom, rgba(109,40,217,0.05), transparent)",
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Edge vignette ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 35%, rgba(5,5,14,0.65) 100%)",
        }}
      />

      {/* ── Top fade ──────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-28 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(6,6,18,0.55), transparent)",
        }}
      />

      {/* ── Bottom fade ───────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(5,5,14,0.45), transparent)",
        }}
      />
    </div>
  );
}
