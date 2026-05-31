/**
 * ControlPanel
 * Props:
 *   status      — current light status
 *   onTurnOn    — async callback to turn light on
 *   onTurnOff   — async callback to turn light off
 *   disabled    — true when backend is unreachable
 */

import React, { useState } from "react";

export default function ControlPanel({ status, onTurnOn, onTurnOff, disabled }) {
    const [loading, setLoading] = useState(null); // "on" | "off" | null

    async function handleOn() {
        setLoading("on");
        try { await onTurnOn(); } finally { setLoading(null); }
    }

    async function handleOff() {
        setLoading("off");
        try { await onTurnOff(); } finally { setLoading(null); }
    }

    const isOn = status === "ON";
    const isOff = status === "OFF";
    const isFault = status === "FAULT";

    const btnBase = {
        padding: "12px 28px",
        borderRadius: "var(--radius-md)",
        border: "1px solid transparent",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all var(--transition)",
        opacity: disabled ? 0.4 : 1,
        minWidth: "130px",
    };

    return (
        <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
        }}>
            <div style={{
                fontSize: "10px",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "16px",
            }}>
                Remote Control
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {/* TURN ON */}
                <button
                    onClick={handleOn}
                    disabled={disabled || loading !== null || isOn}
                    style={{
                        ...btnBase,
                        background: isOn
                            ? "var(--color-green-dim)"
                            : "rgba(34,197,94,0.08)",
                        borderColor: isOn ? "var(--color-green)" : "rgba(34,197,94,0.3)",
                        color: isOn ? "var(--color-green)" : "rgba(34,197,94,0.7)",
                    }}
                >
                    {loading === "on" ? "SENDING…" : isOn ? "▲ ACTIVE" : "▲ TURN ON"}
                </button>

                {/* TURN OFF */}
                <button
                    onClick={handleOff}
                    disabled={disabled || loading !== null || isOff}
                    style={{
                        ...btnBase,
                        background: isOff ? "rgba(100,116,139,0.15)" : "rgba(100,116,139,0.08)",
                        borderColor: isOff ? "#64748b" : "rgba(100,116,139,0.3)",
                        color: isOff ? "#94a3b8" : "rgba(100,116,139,0.7)",
                    }}
                >
                    {loading === "off" ? "SENDING…" : isOff ? "● INACTIVE" : "● TURN OFF"}
                </button>
            </div>

            {isFault && (
                <div style={{
                    marginTop: "12px",
                    fontSize: "11px",
                    color: "var(--color-red)",
                    fontFamily: "var(--font-mono)",
                }}>
                    ⚠ Fault active — commands still relay to Arduino
                </div>
            )}

            {disabled && (
                <div style={{
                    marginTop: "12px",
                    fontSize: "11px",
                    color: "var(--color-yellow)",
                    fontFamily: "var(--font-mono)",
                }}>
                    ⚠ Backend unreachable — check server on port 5000
                </div>
            )}
        </div>
    );
}