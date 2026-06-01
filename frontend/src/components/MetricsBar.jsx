/**
 * MetricsBar
 * Displays fleet-level hardcoded KPIs at the top of the dashboard.
 * In Stage 1 all values are hardcoded — this is by design.
 */

import React from "react";

const METRICS = [
    { label: "Sectors", value: "12", note: "active map" },
    { label: "Nodes", value: "288", note: "24 per sector" },
    { label: "Online", value: "—", note: "live" },
    { label: "Issues", value: "—", note: "live" },
    { label: "Energy Today", value: "4.2 kWh", note: "hardcoded" },
    { label: "Coverage", value: "Zone A", note: "Main Blvd" },
];

export default function MetricsBar({ status }) {
    // Inject live values for online/fault count
    const live = METRICS.map(m => {
        if (m.label === "Online") return { ...m, value: status === "ON" ? "1" : "0" };
        if (m.label === "Issues") return { ...m, value: status === "FAULT" ? "1" : "0" };
        return m;
    });

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "1px",
            background: "var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
        }}>
            {live.map((m, i) => (
                <div key={i} style={{
                    background: "var(--color-surface)",
                    padding: "16px 20px",
                    borderRight: i < live.length - 1 ? "1px solid var(--color-border)" : "none",
                }}>
                    <div style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.1em",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                    }}>
                        {m.label}
                    </div>
                    <div style={{
                        fontSize: "26px",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        lineHeight: 1,
                    }}>
                        {m.value}
                    </div>
                    <div style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        marginTop: "3px",
                        fontFamily: "var(--font-mono)",
                    }}>
                        {m.note}
                    </div>
                </div>
            ))}
        </div>
    );
}