import { useContext } from "react"
import { TelemetryContext } from "../context/TelemetryContext"

export function useESP32() {
  const context = useContext(TelemetryContext)
  if (!context) {
    console.error("[useESP32] Must be used within a <TelemetryProvider>")
    return {
      telemetry: {},
      history: [],
      esp32: { connected: false, port: null },
      socketOK: false,
      isLive: false,
      alerts: [],
      clearAlerts: () => {},
      lastUpdate: null,
      avgSpeed: null,
      avgCO2: null,
      co2GraphData: [],
      speedGraphData: [],
      ecoGraphData: [],
      creditsGraphData: [],
      packetCount: 0
    }
  }
  return context
}