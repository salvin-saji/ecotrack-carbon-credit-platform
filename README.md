# APEX Eco-Driving Carbon Credit Real-Time HUD Platform

A full-stack real-time Carbon Credit Eco-Driving platform that reads live telemetry data from an ESP32 microcontroller via USB serial, logs trip details to Firebase Firestore, and streams metrics to a glassmorphism dashboard via WebSockets (Socket.IO).

---

## Folder Structure

```text
/carbon-credit-platform
  /backend
    app.py              # Flask server + WebSockets (Socket.IO)
    serial_reader.py    # Background USB COM reader (with mock auto-simulation fallback)
    firebase_client.py  # Firebase Admin integration (with JSON file fallback db)
    requirements.txt    # Python packages
    .env                # Port, Baud rate, and Firebase key config
  /frontend
    /src
      /components
        Speedometer.jsx
        CO2Gauge.jsx
        CreditWallet.jsx
        AlertPanel.jsx
        MarketplaceTable.jsx
        LiveChart.jsx
      /pages
        Login.jsx
        Dashboard.jsx
        Marketplace.jsx
        Profile.jsx
        Settings.jsx
      /hooks
        useESP32Data.js   # Live WebSocket client stream hook
      /services
        firebase.js       # Firebase Client Auth (with LocalStorage mock auth/DB fallback)
        api.js            # Axios endpoint routing
      App.js
      index.js
      index.css           # Tailwind + Custom keyframes animations
```

---

## ESP32 Serial Inputs Format

The ESP32 microcontroller continuously transmits two types of strings:
- **Line 1**: `SPEED,Credits:85.30`
- **Line 2**: `Engine:1,Speed:120.0,ThrottleDelta:0.0,CO2_g_s:1.382,Status:HIGH`

The backend thread automatically extracts parameters (`Credits`, `Speed`, `Engine`, `ThrottleDelta`, `CO2_g_s`, and `Status`), writes them to Firestore, and pushes them to the React frontend in real-time.

---

## Startup Instructions

### 1. Backend Server Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Update `.env` to match your ESP32 serial COM port:
   ```ini
   SERIAL_PORT=COM3
   BAUD_RATE=115200
   ```
   *(Set `SERIAL_PORT=MOCK` or run as-is without hardware connected. The backend will automatically enter **Mock Auto-Simulation mode** to demonstrate real-time gauge sweeps, wallet credit changes, and scrolling graphs.)*
4. Run the Flask + WebSockets server:
   ```bash
   python app.py
   ```

### 2. Frontend React Dashboard Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Run the development server:
   ```bash
   npm start
   ```
3. Open your browser and navigate to: `http://localhost:3000`
4. Register a new driver or company profile and watch the live ESP32 telemetry telemetry stream!
