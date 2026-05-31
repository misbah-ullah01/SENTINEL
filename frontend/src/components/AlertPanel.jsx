/**
 * AlertPanel
 * Displays the last 20 fault events from backend memory.
 * Props: { events }  — array of { timestamp, type }
 */

import React from "react";

const EVENT_CONFIG = {
    FAULT_DETECTED: { label: "Fault Detected", color: "#ef4444", icon: "⚠" },
    FAULT_CLEARED: { label: "Fault Cleared", color: "#22c55e", icon: "✓" },
};

function formatTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export default function AlertPanel({ events = [] }) {
    return (
        <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
        }}>
            {/* Header */}
            <div style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <span style={{
                    fontSize: "10px",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                }}>
                    Fault History
                </span>
                <span style={{
                    background: events.length > 0 ? "var(--color-red-dim)" : "var(--color-surface-2)",
                    color: events.length > 0 ? "var(--color-red)" : "var(--color-text-muted)",
                    borderRadius: "999px",
                    fontSize: "10px",
                    padding: "2px 8px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                }}>
                    {events.length} events
                </span>
            </div>

            {/* List */}
            <div style={{
                maxHeight: "220px",
                overflowY: "auto",
                padding: events.length === 0 ? "24px" : "0",
            }}>
                {events.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        color: "var(--color-text-muted)",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                    }}>
                        No fault events recorded
                    </div>
                ) : (
                    events.map((ev, i) => {
                        const cfg = EVENT_CONFIG[ev.type] ?? EVENT_CONFIG.FAULT_DETECTED;
                        return (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 20px",
                                borderBottom: i < events.length - 1 ? "1px solid var(--color-border)" : "none",
                            }}>
                                <span style={{ color: cfg.color, fontSize: "14px", minWidth: "16px" }}>
                                    {cfg.icon}
                                </span>
                                <span style={{
                                    flex: 1,
                                    fontSize: "12px",
                                    color: cfg.color,
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    {cfg.label}
                                </span>
                                <span style={{
                                    fontSize: "11px",
                                    color: "var(--color-text-muted)",
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    {formatTime(ev.timestamp)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}