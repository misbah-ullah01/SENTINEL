/**
 * StatusBadge
 * Props:
 *   status: "ON" | "OFF" | "FAULT" | "UNKNOWN"
 *   size:   "sm" | "md" | "lg"  (default "md")
 */

import React from "react";

const CONFIG = {
    ON: { label: "ONLINE", color: "#22c55e", bg: "rgba(34,197,94,0.12)", dot: "#22c55e" },
    OFF: { label: "OFFLINE", color: "#64748b", bg: "rgba(100,116,139,0.12)", dot: "#64748b" },
    FAULT: { label: "FAULT", color: "#ef4444", bg: "rgba(239,68,68,0.12)", dot: "#ef4444" },
    UNKNOWN: { label: "UNKNOWN", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", dot: "#f59e0b" },
};

const SIZES = {
    sm: { fontSize: "10px", padding: "2px 8px", dotSize: "6px" },
    md: { fontSize: "11px", padding: "4px 10px", dotSize: "8px" },
    lg: { fontSize: "13px", padding: "6px 14px", dotSize: "10px" },
};

export default function StatusBadge({ status = "UNKNOWN", size = "md" }) {
    const cfg = CONFIG[status] ?? CONFIG.UNKNOWN;
    const sz = SIZES[size];

    const pulse = status === "ON" || status === "FAULT";

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: sz.padding,
            borderRadius: "999px",
            background: cfg.bg,
            border: `1px solid ${cfg.color}33`,
            color: cfg.color,
            fontSize: sz.fontSize,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            userSelect: "none",
        }}>
            <span style={{
                width: sz.dotSize,
                height: sz.dotSize,
                borderRadius: "50%",
                background: cfg.dot,
                flexShrink: 0,
                animation: pulse ? "pulse-dot 1.4s ease-in-out infinite" : "none",
            }} />
            {cfg.label}
            <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
        </span>
    );
}