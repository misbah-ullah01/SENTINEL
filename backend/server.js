const express = require("express");
const cors = require("cors");
const { connect, sendCommand, getState } = require("./serialHandler");

// ── APP SETUP ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── REQUEST LOGGING ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
});

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Full device state (polled every 1 second by React)
app.get("/api/status", (_req, res) => {
    res.json(getState());
});

// Turn light ON
app.post("/api/light/on", async (_req, res) => {
    try {
        await sendCommand("LIGHT_ON");
        res.json({ success: true, message: "LIGHT_ON sent to Arduino" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Turn light OFF
app.post("/api/light/off", async (_req, res) => {
    try {
        await sendCommand("LIGHT_OFF");
        res.json({ success: true, message: "LIGHT_OFF sent to Arduino" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Server health
app.get("/api/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Fault history (last 20 events)
app.get("/api/fault-history", (_req, res) => {
    const state = getState();
    res.json({ events: state.faultHistory });
});

// 404 catch-all
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ── START ─────────────────────────────────────────────────────────────────────
connect(); // Open Arduino serial connection

app.listen(PORT, () => {
    console.log(`\n✅  Backend running at http://localhost:${PORT}`);
    console.log(`    Serial port: ${process.env.SERIAL_PORT || "COM3"}\n`);
});