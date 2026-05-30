const { SerialPort } = require("serialport");
const { ReadLineParser } = require("@serialport/parser-readline");

// CONFIG

const SERIAL_PORT = process.env.SERIAL_PORT || "COM3"; // override via env
const BAUDE_RATE = parseInt(process.env.BAUDE_RATE) || 9600;
const RECONNECT_MS = 5000;

// DEVICE STATE
// These are values served to the dashboard
// In Stage 1, power/voltage/current/energy/temperature are hardcoded
// In Stage 2, they will come from real sensors.

let deviceState = {
    status:         "UNKNOWN",      // "ON" | "OFF" | "FAULT" | "UNKNOWN"
    poleID:         "POLE-001",
    location:       "Zone A - Main Boulevard",
    power:          "150W",
    voltage:        "220V",
    current:        "0.68A",
    energy:         "4.2 kWh",
    temperature:    "39°C",
    uptime:         "14h 22m",
    lastSeen:       null,
    connected:      false,
    faultHistory:   [],
};

let serialPort  = null;
let parser      = null;

