/**
 * Dashboard.jsx
 * Root component. Owns polling interval and all application state.
 * All child components receive data as props — no child calls the API.
 *
 * State shape:
 *   poleData    — backend /api/status response
 *   faultEvents — backend /api/fault-history events[]
 *   connected   — backend reachable flag
 *   lastPoll    — ISO string of last successful poll
 *   error       — last error message or null
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchStatus, fetchFaultHistory, turnLightOn, turnLightOff } from "../api/lightApi";

import MetricsBar from "./MetricsBar";
import PoleCard from "./PoleCard";
import ControlPanel from "./ControlPanel";
import AlertPanel from "./AlertPanel";
import StatusBadge from "./StatusBadge";

const POLL_INTERVAL_MS = 1000; // 1 second — matches Arduino report interval

const DEFAULT_POLE_DATA = {
    status: "UNKNOWN",
    poleId: "POLE-001",
    location: "Zone A — Main Boulevard",
    power: "—",
    voltage: "—",
    current: "—",
    energy: "—",
    temperature: "—",
    uptime: "—",
    connected: false,
    faultHistory: [],
};

export default function Dashboard() {
    const [poleData, setPoleData] = useState(DEFAULT_POLE_DATA);
    const [faultEvents, setFaultEvents] = useState([]);
    const [connected, setConnected] = useState(false);
    const [lastPoll, setLastPoll] = useState(null);
    const [error, setError] = useState(null);

    const intervalRef = useRef(null);

    // ── POLLING ──────────────────────────────────────────────────────────────
    const poll = useCallback(async () => {
        try {
            const data = await fetchStatus();
            setPoleData(data);
            setFaultEvents(data.faultHistory ?? []);
            setConnected(true);
            setLastPoll(new Date().toISOString());
            setError(null);
        } catch (err) {
            setConnected(false);
            setError(err.message || "Backend unreachable");
        }
    }, []);

    useEffect(() => {
        poll(); // Immediate first poll
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, [poll]);

    // ── HANDLERS ─────────────────────────────────────────────────────────────
    async function handleTurnOn() { await turnLightOn(); await poll(); }
    async function handleTurnOff() { await turnLightOff(); await poll(); }

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

            {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
            <header style={{
                background: "var(--color-surface)",
                borderBottom: "1px solid var(--color-border)",
                padding: "0 24px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        background: "var(--color-accent)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                    }}>
                        💡
                    </div>
                    <div>
                        <div style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            color: "var(--color-text)",
                        }}>
                            SMART CITY LIGHTING
                        </div>
                        <div style={{
                            fontSize: "10px",
                            color: "var(--color-text-muted)",
                            fontFamily: "var(--font-mono)",
                        }}>
                            Stage 1 — Proof of Concept
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Backend connection status */}
                    <StatusBadge status={connected ? "ON" : "FAULT"} size="sm" />

                    {/* Last poll timestamp */}
                    {lastPoll && (
                        <span style={{
                            fontSize: "10px",
                            color: "var(--color-text-muted)",
                            fontFamily: "var(--font-mono)",
                        }}>
                            {`Last sync: ${new Date(lastPoll).toLocaleTimeString("en-US", { hour12: false })}`}
                        </span>
                    )}
                </div>
            </header>

            {/* ── METRICS BAR ──────────────────────────────────────────────────── */}
            <MetricsBar status={poleData.status} />

            {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <main style={{
                flex: 1,
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gridTemplateRows: "auto auto 1fr",
                gap: "16px",
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
            }}>

                {/* Pole Card — spans 1 col, row 1 */}
                <div style={{ gridColumn: "1", gridRow: "1" }}>
                    <PoleCard poleData={poleData} />
                </div>

                {/* Control Panel — col 2, row 1 */}
                <div style={{ gridColumn: "2", gridRow: "1" }}>
                    <ControlPanel
                        status={poleData.status}
                        onTurnOn={handleTurnOn}
                        onTurnOff={handleTurnOff}
                        disabled={!connected}
                    />
                </div>

                {/* Alert Panel — col 2, row 2 */}
                <div style={{ gridColumn: "2", gridRow: "2" }}>
                    <AlertPanel events={faultEvents} />
                </div>

                {/* Architecture Note — col 1, row 2 */}
                <div style={{
                    gridColumn: "1",
                    gridRow: "2",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                }}>
                    <div style={{
                        fontSize: "10px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                    }}>
                        System Architecture
                    </div>
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--color-text-dim)",
                        lineHeight: 2,
                    }}>
                        <span style={{ color: "var(--color-accent)" }}>React Dashboard</span>
                        {" → "}
                        <span style={{ color: "var(--color-accent)" }}>Node.js Backend</span>
                        {" → "}
                        <span style={{ color: "var(--color-accent)" }}>Arduino Uno R3</span>
                    </div>
                    <div style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                    }}>
                        HTTP polling every 1s · Serial @ 9600 baud · COM3
                    </div>

                    {error && (
                        <div style={{
                            marginTop: "12px",
                            padding: "8px 12px",
                            background: "var(--color-red-dim)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--color-red)",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                        }}>
                            {error}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
