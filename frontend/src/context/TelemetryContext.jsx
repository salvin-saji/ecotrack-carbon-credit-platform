import React, { createContext, useState, useEffect, useRef, useCallback } from "react"
import socket from "../services/socket"

export const TelemetryContext = createContext(null)

const EMPTY_TELEMETRY = {
  engine:        null,
  engineBool:    false,
  speed:         null,
  throttleDelta: null,
  co2:           null,
  credits:       null,
  rpm:           null,
  ecoScore:      null,
  impactScore:   null,
  harshCount:    null,
  sessionCO2:    null,
  taxStatus:     null,
  rank:          null,
  drivingStatus: null,
  suggestion:    null,
  esp32Status:   null,
  timestamp:     null,
}

const EMPTY_ESP32 = { connected: false, port: null }

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(EMPTY_TELEMETRY)
  const [history, setHistory] = useState([])
  const [esp32, setEsp32] = useState(EMPTY_ESP32)
  const [socketOK, setSocketOK] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [packetCount, setPacketCount] = useState(0)

  const idleTimerRef       = useRef(null)
  const timeoutTimerRef    = useRef(null)
  const alertCooldownRef   = useRef({})          // key → last-fired timestamp
  const prevCO2Ref         = useRef(null)         // previous CO₂ reading for delta
  const aggressiveTimerRef = useRef(null)         // auto-expiry for AGGRESSIVE alert

  // ── ALERT GENERATOR ──
  const generateAlerts = useCallback((data) => {
    if (!data || !data.engineBool) return   // never alert when engine is OFF

    const now    = Date.now()
    const status = data.drivingStatus || ""
    const time   = new Date().toLocaleTimeString()

    // Cooldowns (ms) per alert key — prevents spam
    const COOLDOWNS = {
      ECO_DRIVING:   20_000,
      SMOOTH_DRIVING:20_000,
      NORMAL_DRIVING:30_000,
      IDLE:          15_000,
      HIGH_SPEED:    10_000,
      HIGH_EMISSION:  8_000,
      AGGRESSIVE:     8_000,
    }

    /**
     * add() — only fires if the cooldown for `key` has expired.
     * Returns true when the alert was actually added.
     */
    const add = (type, icon, title, text, key) => {
      const lastFired = alertCooldownRef.current[key] || 0
      if (now - lastFired < (COOLDOWNS[key] ?? 8_000)) return false
      alertCooldownRef.current[key] = now
      setAlerts(prev => {
        const arr = Array.isArray(prev) ? prev : []
        return [{
          id: Date.now() + Math.random(),
          key, type, icon, title, text, time
        }, ...arr].slice(0, 8)           // keep max 8 alerts
      })
      return true
    }

    // ── SPIKE DETECTION for AGGRESSIVE ACCELERATION ──
    // We require a genuine sudden jump in CO₂ OR a high throttleDelta.
    // Stable high-speed driving (co2 plateau, small throttleDelta) is ignored.
    const currentCO2   = Number(data.co2 || 0)
    const prevCO2      = prevCO2Ref.current
    const co2Delta     = prevCO2 !== null ? currentCO2 - prevCO2 : 0
    prevCO2Ref.current = currentCO2

    const throttleDelta = Number(data.throttleDelta || 0)
    const isSpike = throttleDelta > 0.6 || co2Delta > 0.05

    if (isSpike && status === "AGGRESSIVE_ACCELERATION") {
      const fired = add(
        "danger", "ti-bolt",
        "Aggressive Acceleration",
        `Throttle Δ ${throttleDelta.toFixed(2)}, CO₂ +${co2Delta.toFixed(3)} g/s — ease off.`,
        "AGGRESSIVE"
      )
      if (fired) {
        // Auto-remove this alert 5 s after the spike is detected
        clearTimeout(aggressiveTimerRef.current)
        aggressiveTimerRef.current = setTimeout(() => {
          setAlerts(prev => (Array.isArray(prev) ? prev : []).filter(a => a.key !== "AGGRESSIVE"))
        }, 5000)
      }
    } else {
      // Spike has stopped — cancel any pending auto-remove and remove existing alert
      if (!isSpike) {
        clearTimeout(aggressiveTimerRef.current)
        aggressiveTimerRef.current = null
        setAlerts(prev => (Array.isArray(prev) ? prev : []).filter(a => a.key !== "AGGRESSIVE"))
      }
    }

    // ── STATUS-BASED ALERTS (stable conditions) ──
    switch (status) {
      case "ECO_DRIVING":
        add("success", "ti-leaf", "Eco Driving", "Low emission — excellent eco driving!", "ECO_DRIVING")
        break
      case "SMOOTH_DRIVING":
        add("success", "ti-leaf", "Smooth Driving", "Gentle and efficient driving.", "SMOOTH_DRIVING")
        break
      case "NORMAL_DRIVING":
        add("info", "ti-car", "Normal Driving", "Moderate speed, acceptable emissions.", "NORMAL_DRIVING")
        break
      case "ENGINE_IDLE":
        add("warning", "ti-engine", "Engine Idling", "Engine running while stationary — turn off to reduce idle emissions.", "IDLE")
        break
      case "HIGH_SPEED":
        add("warning", "ti-gauge", "High Speed Warning", `${Number(data.speed || 0).toFixed(0)} km/h — reduce speed.`, "HIGH_SPEED")
        break
      case "HIGH_EMISSION":
        add("danger", "ti-cloud", "High Emission", `CO₂ ${Number(data.co2 || 0).toFixed(3)} g/s — reduce throttle.`, "HIGH_EMISSION")
        break
      default:
        break
    }

    // ── IDLE FALLBACK (engine on, speed = 0 for 10 s) ──
    if (data.engineBool && Number(data.speed || 0) === 0) {
      if (!idleTimerRef.current) {
        idleTimerRef.current = setTimeout(() => {
          add("warning", "ti-engine-off", "Engine Idling", "Engine on while stationary.", "IDLE")
        }, 10000)
      }
    } else {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  // ── TELEMETRY HANDLER ──
  const handleTelemetry = useCallback((raw) => {
    console.log("[FRONTEND RECEIVED]", raw)

    if (!raw || typeof raw !== "object") {
      console.warn("[TelemetryContext] Invalid telemetry raw packet:", raw)
      return
    }

    // Recover ESP32 connection state if it was marked disconnected
    setEsp32(prev => {
      if (!prev.connected) {
        return { connected: true, port: raw.esp32Status || "COM12" };
      }
      return prev;
    });

    const data = {
      engine:        raw.engine        ?? null,
      engineBool:    Boolean(raw.engineBool ?? raw.engine === 1),
      speed:         raw.speed         ?? null,
      throttleDelta: raw.throttleDelta ?? null,
      co2:           raw.co2           ?? null,
      credits:       raw.credits       ?? null,
      rpm:           raw.rpm           ?? null,
      ecoScore:      raw.ecoScore      ?? null,
      impactScore:   raw.impactScore   ?? null,
      harshCount:    raw.harshCount    ?? null,
      sessionCO2:    raw.sessionCO2    ?? null,
      taxStatus:     raw.taxStatus     ?? null,
      rank:          raw.rank          ?? null,
      drivingStatus: raw.drivingStatus ?? null,
      suggestion:    raw.suggestion    ?? null,
      esp32Status:   raw.esp32Status   ?? null,
      timestamp:     raw.timestamp     ?? new Date().toISOString(),
    }

    setTelemetry(data)
    setPacketCount(c => c + 1)
    setLastUpdate(Date.now())

    setHistory(prev => {
      const point = {
        ...data,
        time: new Date().toLocaleTimeString("en-US", {
          hour:   "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      }
      const arr = Array.isArray(prev) ? prev : []
      return [...arr, point].slice(-100) // keep last 100 for global history log
    })

    generateAlerts(data)

    // Reset the 4-second packet timeout trigger
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    timeoutTimerRef.current = setTimeout(() => {
      console.warn("[TelemetryContext] Telemetry packet timeout: Setting engine OFF and ESP32 disconnected.");
      setEsp32(EMPTY_ESP32);
      setTelemetry({
        ...EMPTY_TELEMETRY,
        engine: 0,
        engineBool: false,
        drivingStatus: "ENGINE_OFF"
      });
    }, 4000);

  }, [generateAlerts])

  const handleESP32Status = useCallback((raw) => {
    console.log("[SOCKET RX] esp32_status:", raw)
    if (!raw) return

    setEsp32({
      connected: Boolean(raw.connected),
      port:      raw.port || null,
    })

    if (!raw.connected) {
      setTelemetry(EMPTY_TELEMETRY)
      setHistory([])
      setAlerts([])
      clearTimeout(idleTimerRef.current)
    }
  }, [])

  useEffect(() => {
    setSocketOK(socket.connected)

    const onConnect = () => {
      console.log("[TelemetryContext] Socket connected")
      setSocketOK(true)
      socket.emit("ping_status")
    }

    const onDisconnect = (reason) => {
      console.log("[TelemetryContext] Socket disconnected:", reason)
      setSocketOK(false)
    }

    socket.on("connect",      onConnect)
    socket.on("disconnect",   onDisconnect)
    socket.on("telemetry",    handleTelemetry)
    socket.on("esp32_status", handleESP32Status)

    if (socket.connected) {
      socket.emit("ping_status")
    }

    return () => {
      socket.off("connect",      onConnect)
      socket.off("disconnect",   onDisconnect)
      socket.off("telemetry",    handleTelemetry)
      socket.off("esp32_status", handleESP32Status)
      clearTimeout(idleTimerRef.current)
      clearTimeout(timeoutTimerRef.current)
      clearTimeout(aggressiveTimerRef.current)
    }
  }, [handleTelemetry, handleESP32Status])

  const validHistory = Array.isArray(history) ? history : []

  const avgSpeed = validHistory.length > 0
    ? Math.round(validHistory.reduce((s, h) => s + Number(h?.speed || 0), 0) / validHistory.length)
    : null

  const avgCO2 = validHistory.length > 0
    ? parseFloat((validHistory.reduce((s, h) => s + Number(h?.co2 || 0), 0) / validHistory.length).toFixed(3))
    : null

  // Derived graph datasets - sliced to last 30 items for rolling visual graphs
  const co2GraphData = validHistory.slice(-30).map(h => ({
    time:  h?.time  || "",
    value: Number(h?.co2 || 0)
  }))

  const speedGraphData = validHistory.slice(-30).map(h => ({
    time:  h?.time  || "",
    value: Number(h?.speed || 0)
  }))

  const ecoGraphData = validHistory.slice(-30).map(h => ({
    time:  h?.time  || "",
    value: Number(h?.ecoScore || 0)
  }))

  const creditsGraphData = validHistory.slice(-30).map(h => ({
    time:  h?.time  || "",
    value: Number(h?.credits || 0)
  }))

  return (
    <TelemetryContext.Provider value={{
      telemetry,
      history: validHistory,
      esp32,
      socketOK,
      isLive: esp32.connected && socketOK,
      alerts,
      clearAlerts: () => setAlerts([]),
      lastUpdate,
      avgSpeed,
      avgCO2,
      co2GraphData,
      speedGraphData,
      ecoGraphData,
      creditsGraphData,
      packetCount
    }}>
      {children}
    </TelemetryContext.Provider>
  )
}
