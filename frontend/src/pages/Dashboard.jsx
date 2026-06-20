import React, { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useESP32 }       from "../hooks/useESP32"
import {
  val, speedColor, co2Color,
  pct
} from "../utils/display"
import ConnectionStatus   from "../components/dashboard/ConnectionStatus"
import MetricCard         from "../components/dashboard/MetricCard"
import LiveCO2Chart       from "../components/charts/LiveCO2Chart"
import LiveSpeedChart     from "../components/charts/LiveSpeedChart"
import DiagnosticPanel    from "../components/DiagnosticPanel"
import AlertFeed          from "../components/dashboard/AlertFeed"
import EngineBadge        from "../components/dashboard/EngineBadge"
import DrivingStatusBadge from "../components/dashboard/DrivingStatusBadge"
import EcoAIAssistant     from "../components/dashboard/EcoAIAssistant"

export default function Dashboard() {
  const {
    telemetry = {}, isLive = false,
    avgSpeed = 0,
    history = []
  } = useESP32()

  // Destructure primitive values safely with fallbacks
  const speed = telemetry?.speed ?? 0
  const co2 = telemetry?.co2 ?? 0
  const credits = telemetry?.credits ?? 0
  const engine = telemetry?.engine ?? 0
  const throttleDelta = telemetry?.throttleDelta ?? 0
  const rpm = telemetry?.rpm ?? 0
  const harshCount = telemetry?.harshCount ?? 0
  const sessionCO2 = telemetry?.sessionCO2 ?? 0

  const engineOn = engine === 1
                || engine === true
                || engine === "1"
  const showLiveValues = isLive && engineOn

  // Credit flash state
  const [creditFlash, setCreditFlash] = useState(null)
  const prevCredits = useRef(null)
  useEffect(() => {
    if (credits === null || credits === undefined) return
    if (prevCredits.current !== null) {
      if (credits < prevCredits.current) {
        setCreditFlash("down")
      } else if (credits > prevCredits.current) {
        setCreditFlash("up")
      }
      const timer = setTimeout(() => setCreditFlash(null), 500)
      return () => clearTimeout(timer)
    }
    prevCredits.current = credits
  }, [credits])

  return (
    <div style={{
      padding:   "24px 28px",
      minHeight: "100vh",
      background:"#050816",
      color: "#888888"
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   "24px"
      }}>
        <div>
          <h1 style={{
            fontSize:"16px", fontWeight:500, color:"#f1f1f3"
          }}>
            Live Dashboard
          </h1>
          <p style={{ fontSize:"12px", color:"#6b6b7a" }}>
            Real-time telemetry from ESP32
          </p>
        </div>
        <ConnectionStatus />
      </div>

      {/* ── METRIC CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <MetricCard
          label="Speed"
          value={showLiveValues ? val(speed, 1) : "—"}
          suffix={showLiveValues ? "km/h" : ""}
          color={showLiveValues ? speedColor(speed) : "#3a3a45"}
          isEmpty={!showLiveValues}
          sub={engineOn ? val(avgSpeed, 0, " km/h avg") : "Engine OFF"}
          icon="ti-gauge"
        />

        <MetricCard
          label="CO₂ Rate"
          value={showLiveValues ? val(co2, 3) : "—"}
          suffix={showLiveValues ? "g/s" : ""}
          color={showLiveValues ? co2Color(co2) : "#3a3a45"}
          isEmpty={!showLiveValues}
          sub={engineOn ? val(sessionCO2, 1, "g session") : "No emission"}
          icon="ti-cloud"
        />

        <MetricCard
          label="Engine"
          value={engine === 1 ? "ON" : engine === 0 ? "OFF" : "—"}
          color={engine === 1 ? "#22c55e" : engine === 0 ? "#ef4444" : "#3a3a45"}
          isEmpty={engine === null}
          sub={engine === 1 ? "Running" : engine === 0 ? "Stopped" : "No data"}
          icon="ti-activity"
        />

        <MetricCard
          label="Credits"
          value={val(credits, 2)}
          sub={credits !== null
            ? `≈ ₹${(credits * 11.5).toFixed(0)}`
            : "—"}
          icon="ti-wallet"
          color={creditFlash === "up"   ? "#22c55e"
               : creditFlash === "down" ? "#ef4444"
               : "#f1f1f3"}
          isEmpty={credits === null}
        />

        {/* Driving status card */}
        <div style={{
          background:   "#111",
          border:       "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding:      "20px 22px"
        }}>
          <p style={{
            fontSize:"11px", color:"#3a3a45",
            textTransform:"uppercase", letterSpacing:"0.8px",
            marginBottom:"12px"
          }}>
            Drive Status
          </p>
          <DrivingStatusBadge />
          <div style={{ marginTop:"8px" }}>
            <EngineBadge />
          </div>
        </div>
      </div>

      {/* ── MID ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-5">

        {/* Speedometer panel */}
        <div className="premium-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px] lg:col-span-3 shadow-md border-[#22c55e]/15">
          <p style={{
            fontSize:"11px", color:"#6b6b7a",
            textTransform:"uppercase", letterSpacing:"0.8px",
            marginBottom:"16px"
          }}>
            Speedometer
          </p>

          {/* Large speed number */}
          <AnimatePresence mode="wait">
            <motion.div
              key={Math.round(speed || 0)}
              initial={{ opacity:0.6, scale:0.97 }}
              animate={{ opacity:1,   scale:1 }}
              transition={{ duration:0.15 }}
              style={{
                textAlign:"center", padding:"12px 0 8px",
                fontSize:"52px", fontWeight:"200",
                color: !engineOn ? "#3a3a45" : speedColor(speed),
                lineHeight:1
              }}>
              {engineOn ? Math.round(speed || 0) : "—"}
            </motion.div>
          </AnimatePresence>
          <p style={{
            textAlign:"center", fontSize:"11px",
            color:"#6b6b7a", marginBottom:"16px"
          }}>
            kilometers per hour
          </p>

          {/* Progress bar */}
          <div style={{
            height:"4px", background:"#18181c",
            borderRadius:"4px", overflow:"hidden",
            marginBottom:"6px"
          }}>
            <motion.div
              animate={{ width: engineOn ? `${pct(speed, 120)}%` : "0%" }}
              transition={{ duration:0.3, ease:"easeOut" }}
              style={{
                height:"100%", borderRadius:"4px",
                background: engineOn
                  ? `linear-gradient(90deg, ${speedColor(speed)}, ${speedColor(speed)}aa)`
                  : "#1a1a1a"
              }} />
          </div>
          <div style={{
            display:"flex", justifycontent:"space-between",
            fontSize:"10px", color:"#3a3a45",
            marginBottom:"16px"
          }}>
            <span>0</span><span>60</span><span>120</span>
          </div>

          {/* Stats 2x2 */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { l:"RPM",      v: engineOn ? val(rpm) : "—", c: engineOn ? "#ccc" : "#3a3a45" },
              { l:"Throttle Δ", v: engineOn ? val(throttleDelta,2) : "—", c: engineOn ? "#ccc" : "#3a3a45" },
              { l:"Engine",
                v: engine===1 ? "ON"
                 : engine===0 ? "OFF" : "—",
                c: engine===1 ? "#22c55e"
                 : engine===0 ? "#ef4444" : "#3a3a45" },
              { l:"Harsh Events", v: engineOn ? val(harshCount) : "—", c: engineOn ? "#ccc" : "#3a3a45" }
            ].map(item => (
              <div key={item.l} style={{
                background:"#0a0f1d",
                border: "1px solid rgba(255,255,255,0.02)",
                borderRadius:"8px", padding:"10px 12px"
              }}>
                <p style={{fontSize:"10px",color:"#6b6b7a",
                           marginBottom:"4px"}}>
                  {item.l}
                </p>
                <p style={{
                  fontSize:"15px", fontWeight:500,
                  color: item.c || "#f1f1f3"
                }}>
                  {item.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Speed Chart panel */}
        <div className="premium-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px] lg:col-span-3 shadow-md border-[#22c55e]/15">
          <div style={{
            display:"flex", justifycontent:"space-between",
            alignItems:"center", marginBottom:"16px"
          }}>
            <p style={{
              fontSize:"11px", color:"#6b6b7a",
              textTransform:"uppercase", letterSpacing:"0.8px"
            }}>
              Speed — Live
            </p>
            <span style={{fontSize:"10px",color:"#6b6b7a"}}>
              {history.length} pts
            </span>
          </div>
          <LiveSpeedChart />
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:"8px", marginTop:"12px"
          }}>
            <div style={{
              background:"#0a0f1d", borderRadius:"8px",
              border: "1px solid rgba(255,255,255,0.02)",
              padding:"10px 12px"
            }}>
              <p style={{fontSize:"10px",color:"#6b6b7a",
                         marginBottom:"4px"}}>
                Current
              </p>
              <p style={{
                fontSize:"15px", fontWeight:500,
                color: showLiveValues ? speedColor(speed) : "#3a3a45"
              }}>
                {showLiveValues ? val(speed, 1, " km/h") : "—"}
              </p>
            </div>
            <div style={{
              background:"#0a0f1d", borderRadius:"8px",
              border: "1px solid rgba(255,255,255,0.02)",
              padding:"10px 12px"
            }}>
              <p style={{fontSize:"10px",color:"#6b6b7a",
                         marginBottom:"4px"}}>
                Average
              </p>
              <p style={{
                fontSize:"15px", fontWeight:500,
                color: engineOn ? "#f1f1f3" : "#3a3a45"
              }}>
                {engineOn ? val(avgSpeed, 1, " km/h") : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* CO2 Chart panel */}
        <div className="premium-card rounded-2xl p-5 flex flex-col justify-between min-h-[280px] lg:col-span-2 shadow-md border-[#22c55e]/15">
          <div style={{
            display:"flex", justifycontent:"space-between",
            alignItems:"center", marginBottom:"16px"
          }}>
            <p style={{
              fontSize:"11px", color:"#6b6b7a",
              textTransform:"uppercase", letterSpacing:"0.8px"
            }}>
              CO₂ Emission — Live
            </p>
            <span style={{fontSize:"10px",color:"#6b6b7a"}}>
              {history.length} pts
            </span>
          </div>
          <LiveCO2Chart />
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:"8px", marginTop:"12px"
          }}>
            <div style={{
              background:"#0a0f1d", borderRadius:"8px",
              border: "1px solid rgba(255,255,255,0.02)",
              padding:"10px 12px"
            }}>
              <p style={{fontSize:"10px",color:"#6b6b7a",
                         marginBottom:"4px"}}>
                Current
              </p>
              <p style={{
                fontSize:"15px", fontWeight:500,
                color: showLiveValues ? co2Color(co2) : "#3a3a45"
              }}>
                {showLiveValues ? val(co2, 3, " g/s") : "—"}
              </p>
            </div>
            <div style={{
              background:"#0a0f1d", borderRadius:"8px",
              border: "1px solid rgba(255,255,255,0.02)",
              padding:"10px 12px"
            }}>
              <p style={{fontSize:"10px",color:"#6b6b7a",
                         marginBottom:"4px"}}>
                Session Total
              </p>
              <p style={{
                fontSize:"15px", fontWeight:500,
                color: engineOn ? "#f1f1f3" : "#3a3a45"
              }}>
                {engineOn ? val(sessionCO2, 2, " g") : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Live Alerts | Socket Diagnostic | Eco AI Assistant ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <AlertFeed />
        <DiagnosticPanel />
        <EcoAIAssistant />
      </div>
    </div>
  )
}
