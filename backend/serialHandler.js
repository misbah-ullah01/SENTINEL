/**
 * serialHandler.js
 * Owns the Arduino serial port connection.
 * Exports: { connect, sendCommand, getState }
 */

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

// ── CONFIG ──────────────────────────────────────────────────────────────────
const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";   // Override via env
const BAUD_RATE = parseInt(process.env.BAUD_RATE) || 9600;
const RECONNECT_MS = 5000;

// ── DEVICE STATE ─────────────────────────────────────────────────────────────
// These are the values served to the dashboard.
// In Stage 1, power/voltage/current/energy/temperature are hardcoded.
// In Stage 2, they will come from real sensors.
let deviceState = {
    status: "UNKNOWN",   // "ON" | "OFF" | "FAULT" | "UNKNOWN"
    poleId: "POLE-001",
    location: "Zone A — Main Boulevard",
    power: "150W",
    voltage: "220V",
    current: "0.68A",
    energy: "4.2 kWh",
    temperature: "39°C",
    uptime: "14h 22m",
    lastSeen: null,
    connected: false,
    faultHistory: [],
};

let serialPort = null;
let parser = null;

// ── CONNECT ──────────────────────────────────────────────────────────────────
function connect() {
    console.log(`[Serial] Connecting to ${SERIAL_PORT} at ${BAUD_RATE} baud…`);

    serialPort = new SerialPort({
        path: SERIAL_PORT,
        baudRate: BAUD_RATE,
        autoOpen: true,
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    // ── EVENTS ────────────────────────────────────────────────────────────────
    serialPort.on("open", () => {
        console.log(`[Serial] Port open: ${SERIAL_PORT}`);
        deviceState.connected = true;
        deviceState.lastSeen = new Date().toISOString();
    });

    serialPort.on("error", (err) => {
        console.error(`[Serial] Error: ${err.message}`);
        deviceState.connected = false;
        scheduleReconnect();
    });

    serialPort.on("close", () => {
        console.warn("[Serial] Port closed.");
        deviceState.connected = false;
        deviceState.status = "UNKNOWN";
        scheduleReconnect();
    });

    parser.on("data", (raw) => {
        const line = raw.trim();
        console.log(`[Arduino] ${line}`);
        deviceState.lastSeen = new Date().toISOString();
        parseArduinoLine(line);
    });
}

// ── PARSE INCOMING DATA ───────────────────────────────────────────────────────
function parseArduinoLine(line) {
    if (line.startsWith("STATUS:")) {
        const newStatus = line.replace("STATUS:", "");
        const prevStatus = deviceState.status;

        deviceState.status = newStatus;

        // Record fault transitions in history (last 20)
        if (newStatus === "FAULT" && prevStatus !== "FAULT") {
            deviceState.faultHistory.unshift({
                timestamp: new Date().toISOString(),
                type: "FAULT_DETECTED",
            });
            if (deviceState.faultHistory.length > 20) deviceState.faultHistory.pop();
        }
        if (prevStatus === "FAULT" && newStatus === "ON") {
            deviceState.faultHistory.unshift({
                timestamp: new Date().toISOString(),
                type: "FAULT_CLEARED",
            });
            if (deviceState.faultHistory.length > 20) deviceState.faultHistory.pop();
        }
    } else if (line === "BOOT:OK") {
        console.log("[Serial] Arduino boot confirmed.");
        deviceState.status = "OFF";
    } else if (line === "PONG") {
        // Health check response — no-op
    }
}

// ── SEND COMMAND ──────────────────────────────────────────────────────────────
function sendCommand(command) {
    return new Promise((resolve, reject) => {
        if (!serialPort || !serialPort.isOpen) {
            return reject(new Error("Serial port not open"));
        }
        serialPort.write(`${command}\n`, (err) => {
            if (err) return reject(err);
            console.log(`[Serial] Sent: ${command}`);
            resolve();
        });
    });
}

// ── RECONNECT ─────────────────────────────────────────────────────────────────
function scheduleReconnect() {
    setTimeout(() => {
        console.log("[Serial] Attempting reconnect…");
        try { serialPort.close(); } catch (_) { }
        connect();
    }, RECONNECT_MS);
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
module.exports = {
    connect,
    sendCommand,
    getState: () => ({ ...deviceState }),
};