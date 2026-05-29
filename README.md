# SENTINEL
Smart Edge Node Telemetry Intelligence & Network Embedded Lighting

# STAGE 1

This is first version of the project. It has the following features:

- Arduino UNO R3
- Frontend + Backend connected with Uno R3

---

### This stage involves:

- Arduino UNO R3
- Frontend + Backend connected with Uno R3
- Recieve data from Serial COM ports

---

**Architecture Law:**
```
Frontend → Backend → Arduino
```

---

## 1. Repository Scaffold

Create the following directory tree **exactly**. Do not rename folders. Do not add files outside this structure unless instructed.

```
smart-light-stage1/
├── arduino/
│   └── street_light_stage1.ino
├── backend/
│   ├── package.json
│   ├── server.js
│   └── serialHandler.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── lightApi.js
│   │   └── components/
│   │       ├── Dashboard.jsx
│   │       ├── PoleCard.jsx
│   │       ├── AlertPanel.jsx
│   │       ├── MetricsBar.jsx
│   │       ├── ControlPanel.jsx
│   │       └── StatusBadge.jsx
│   └── package.json
└── README.md
```

---

## 2. Arduino Firmware

### File: `arduino/street_light_stage1.ino`

Do not modify pin numbers without updating the backend documentation comment.

**Validation checklist before uploading:**
- [ ] Board set to "Arduino Uno" in Arduino IDE
- [ ] Correct COM port selected
- [ ] Serial Monitor closed (backend will own the port)
- [ ] Baud rate = 9600
- [ ] LED wired: Pin 8 → 220Ω → LED anode → LED cathode → GND
- [ ] Fault wire: Pin 7 to GND (disconnecting = healthy, connecting = fault)


---


