/**
 * lightApi.js
 * Single source of truth for all backend API communication.
 * Components import from here only — never call fetch/axios directly.
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 3000,
    headers: { "Content-Type": "application/json" },
});

// ── FETCH STATUS (called every 1 second) ──────────────────────────────────────
export async function fetchStatus() {
    const res = await api.get("/api/status");
    return res.data;
}

// ── LIGHT COMMANDS ────────────────────────────────────────────────────────────
export async function turnLightOn() {
    const res = await api.post("/api/light/on");
    return res.data;
}

export async function turnLightOff() {
    const res = await api.post("/api/light/off");
    return res.data;
}

// ── FAULT HISTORY ─────────────────────────────────────────────────────────────
export async function fetchFaultHistory() {
    const res = await api.get("/api/fault-history");
    return res.data;
}

// ── SERVER HEALTH ─────────────────────────────────────────────────────────────
export async function checkHealth() {
    const res = await api.get("/api/health");
    return res.data;
}