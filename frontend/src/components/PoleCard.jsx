/**
 * PoleCard
 * Central status card for the single pole in Stage 1.
 * Props: { poleData }  — shape matches backend getState()
 */

import React from "react";
import StatusBadge from "./StatusBadge";

const BORDER_COLOR = {
    ON: "#22c55e",
    OFF: "#1e2d45",
    FAULT: "#ef4444",
    UNKNOWN: "#f59e0b",
};

export default function PoleCard({ poleData }) {
    const { status, poleId, location, power, voltage, current, energy, temperature, uptime } = poleData;
    const border = BORDER_COLOR[status] ?? BORDER_COLOR.UNKNOWN;
    const isFault = status === "FAULT";

    const rows = [
        { key: "Power", val: power },
        { key: "Voltage", val: voltage },
        { key: "Current", val: current },
        { key: "Energy", val: energy },
        { key: "Temperature", val: temperature },
        { key: "Uptime", val: uptime },
    ];

    return (
        <div style={{
            background: "var(--color-surface)",
            border: `1px solid ${border}`,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            transition: "border-color 400ms ease",
            boxShadow: isFault
                ? "0 0 30px rgba(239,68,68,0.15), 0 0 60px rgba(239,68,68,0.06)"
                : status === "ON"
                    ? "0 0 30px rgba(34,197,94,0.08)"
                    : "none",
        }}>

            {/* Header */}
            <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${border}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: `${border}08`,
            }}>
                <div>
                    <div style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        marginBottom: "2px",
                    }}>
                        {poleId}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)" }}>
                        {location}
                    </div>
                </div>
                <StatusBadge status={status} size="md" />
            </div>

            {/* Telemetry Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--color-border)",
            }}>
                {rows.map(({ key, val }) => (
                    <div key={key} style={{
                        background: "var(--color-surface)",
                        padding: "14px 16px",
                    }}>
                        <div style={{
                            fontSize: "10px",
                            color: "var(--color-text-muted)",
                            fontFamily: "var(--font-mono)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: "4px",
                        }}>
                            {key}
                        </div>
                        <div style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontFamily: "var(--font-mono)",
                        }}>
                            {val ?? "—"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fault Banner */}
            {isFault && (
                <div style={{
                    padding: "10px 20px",
                    background: "var(--color-red-dim)",
                    borderTop: "1px solid rgba(239,68,68,0.3)",
                    color: "var(--color-red)",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    animation: "fault-flash 1.2s ease-in-out infinite",
                }}>
                    ⚠ FAULT DETECTED - Check physical LED and fault wire connection
                    <style>{`
            @keyframes fault-flash {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.6; }
            }
          `}</style>
                </div>
            )}
        </div>
    );
}