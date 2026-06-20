import { io } from "socket.io-client"

const URL = process.env.REACT_APP_BACKEND_URL
         || "http://localhost:5000"

console.log("[socket.js] Creating socket instance →", URL)

const socket = io(URL, {
  transports:           ["websocket", "polling"],
  reconnection:         true,
  reconnectionDelay:    1000,
  reconnectionAttempts: Infinity,
  timeout:              10000,
  autoConnect:          true,
  withCredentials:      false,
  forceNew:             false,   // ← ensure singleton
})

// Connection lifecycle logs
socket.on("connect", () => {
  console.log("[socket.js] ✅ Connected | id:", socket.id)
})

socket.on("disconnect", (reason) => {
  console.log("[socket.js] ❌ Disconnected:", reason)
})

socket.on("connect_error", (err) => {
  console.warn("[socket.js] Connection error:", err.message)
})

socket.on("reconnect", (attempt) => {
  console.log("[socket.js] ✅ Reconnected after", attempt, "attempts")
})

// Verify telemetry arrives at singleton level
socket.on("telemetry", (data) => {
  console.log("[socket.js] ✅ Telemetry at singleton:",
    "engine:", data?.engine,
    "speed:", data?.speed,
    "co2:", data?.co2
  )
})

export default socket
