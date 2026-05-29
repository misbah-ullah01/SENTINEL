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


## 3. Backend

### 3.1 Initialize

```bash
cd smart-light-stage1/backend
npm init -y
npm install express cors serialport @serialport/parser-readline
```

## 4. Frontend

### 4.1 Initialize

```bash
cd smart-light-stage1
npx create-react-app frontend
cd frontend
npm install axios
```


## 5. Run Instructions

### Step 1 - Upload Arduino Firmware
1. Open `arduino/street_light_stage1.ino` in Arduino IDE
2. Select Board: `Arduino Uno`
3. Select correct COM port
4. Upload
5. Close Arduino IDE Serial Monitor

### Step 2 - Start Backend
```bash
cd smart-light-stage1/backend
node server.js
```

Expected output:
```
✅  Backend running at http://localhost:5000
    Serial port: COM3

[Serial] Connecting to COM3 at 9600 baud…
[Serial] Port open: COM3
[Arduino] BOOT:OK
```

### Step 3 - Start Frontend
```bash
cd smart-light-stage1/frontend
npm start
```

Dashboard opens at: `http://localhost:3000`

### Step 4 - Demo Sequence
1. Open dashboard - pole shows UNKNOWN, then OFF
2. Click **TURN ON** - LED physically turns ON, dashboard shows ONLINE
3. Disconnect fault jumper (or connect Pin 7 to GND) - dashboard turns red, FAULT appears
4. Reconnect jumper - dashboard returns to ONLINE within 1 second

---

## 6. Serial Protocol Reference

### Commands (Frontend → Backend → Arduino)
| Command     | Effect                       |
|-------------|------------------------------|
| `LIGHT_ON`  | Turn LED on, set ledState=true |
| `LIGHT_OFF` | Turn LED off, set ledState=false |
| `PING`      | Health check - Arduino replies `PONG` |

### Status Reports (Arduino → Backend → Frontend)
| Message        | Meaning                                     |
|----------------|---------------------------------------------|
| `STATUS:ON`    | LED on, fault pin HIGH (healthy)            |
| `STATUS:OFF`   | LED off                                     |
| `STATUS:FAULT` | LED on, fault pin LOW (fault detected)      |
| `BOOT:OK`      | Arduino restarted or was reset              |
| `PONG`         | Response to PING health check               |

All serial messages are newline-terminated (`\n`). All messages are ASCII. Baud rate: 9600.

---

## 7. API Reference

Base URL: `http://localhost:5000`

| Method | Route               | Description                      | Body | Response            |
|--------|---------------------|----------------------------------|------|---------------------|
| GET    | `/api/status`       | Full device state (poll every 1s) | -    | DeviceState JSON    |
| POST   | `/api/light/on`     | Send LIGHT_ON to Arduino         | -    | `{ success, message }` |
| POST   | `/api/light/off`    | Send LIGHT_OFF to Arduino        | -    | `{ success, message }` |
| GET    | `/api/health`       | Server health check              | -    | `{ status, timestamp }` |
| GET    | `/api/fault-history`| Last 20 fault events             | -    | `{ events[] }`      |