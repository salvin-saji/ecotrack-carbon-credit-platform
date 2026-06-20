import { useEffect, useState, useRef } from "react"
import socket from "../services/socket"

export default function DiagnosticPanel() {
  const [packets,   setPackets]   = useState(0)
  const [last,      setLast]      = useState(null)
  const [connected, setConnected] = useState(false)
  const [log,       setLog]       = useState([])
  const countRef = useRef(0)

  useEffect(() => {
    setConnected(socket.connected)

    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    const onTelemetry = (data) => {
      countRef.current += 1
      setPackets(countRef.current)
      setLast(data)
      const entry = `[${new Date().toLocaleTimeString()}] `
                  + `spd:${data?.speed ?? "—"} `
                  + `co2:${data?.co2 ?? "—"} `
                  + `eng:${data?.engine ?? "—"}`
      setLog(prev => [entry, ...prev].slice(0, 10))
    }

    socket.on("connect",    onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("telemetry",  onTelemetry)

    return () => {
      socket.off("connect",    onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("telemetry",  onTelemetry)
    }
  }, [])

  const borderColor = connected ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"
  const dotColor    = connected ? "#22c55e" : "#ef4444"

  return (
    <div style={{
      background:    "#111",
      border:        `1px solid ${borderColor}`,
      borderRadius:  "14px",
      padding:       "20px 22px",
      height:        "340px",
      display:       "flex",
      flexDirection: "column",
      fontFamily:    "monospace",
      fontSize:      "11px",
      boxShadow:     `0 0 0 1px ${connected ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)"}, 0 4px 24px rgba(0,0,0,0.3)`,
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        borderBottom:   "1px solid rgba(255,255,255,0.04)",
        paddingBottom:  "12px",
        marginBottom:   "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width:      "8px",
            height:     "8px",
            borderRadius: "50%",
            background: dotColor,
            boxShadow:  connected ? "0 0 8px rgba(34,197,94,0.7)" : "none",
            flexShrink: 0,
          }} />
          <span style={{
            fontSize:      "11px",
            fontWeight:    500,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color:         "#3a3a45",
            fontFamily:    "inherit",
          }}>
            Socket Diagnostic
          </span>
        </div>
        <span style={{
          fontSize:     "10px",
          color:        connected ? "#22c55e" : "#ef4444",
          fontWeight:   600,
          background:   connected ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border:       `1px solid ${connected ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
          borderRadius: "20px",
          padding:      "2px 8px",
        }}>
          {connected ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {/* ── PACKET COUNTER ── */}
      <div style={{
        display:       "flex",
        gap:           "8px",
        marginBottom:  "12px",
      }}>
        <div style={{
          flex:         1,
          background:   "#0a0f1d",
          border:       "1px solid rgba(255,255,255,0.04)",
          borderRadius: "8px",
          padding:      "8px 10px",
          textAlign:    "center",
        }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#f1f1f3", lineHeight: 1 }}>
            {packets}
          </div>
          <div style={{ fontSize: "9px", color: "#3a3a45", marginTop: "3px", letterSpacing: "0.6px" }}>
            PACKETS
          </div>
        </div>
        <div style={{
          flex:         2,
          background:   "#0a0f1d",
          border:       "1px solid rgba(255,255,255,0.04)",
          borderRadius: "8px",
          padding:      "8px 10px",
        }}>
          {last ? (
            <div style={{ color: "#6b6b7a", lineHeight: 1.7, fontSize: "10px" }}>
              <span>eng: </span><Val v={last.engine} ok={last.engine === 1 || last.engine === true} />
              <span>spd: </span><Val v={last.speed}  ok={last.speed > 0} />
              <br />
              <span>co2: </span><Val v={last.co2}    ok={last.co2 !== null} />
              <span style={{ color: "#3b82f6" }}>{last.drivingStatus ? ` ${last.drivingStatus}` : ""}</span>
            </div>
          ) : (
            <div style={{ color: "#3a3a45", fontSize: "10px", paddingTop: "4px" }}>
              Waiting for telemetry...
            </div>
          )}
        </div>
      </div>

      {/* ── LOG SCROLL ── */}
      <div style={{
        flex:      1,
        minHeight: 0,
        overflowY: "auto",
      }}>
        {log.length === 0 ? (
          <div style={{ color: "#2a2a35", fontSize: "10px", textAlign: "center", paddingTop: "8px" }}>
            No packets yet
          </div>
        ) : log.map((l, i) => (
          <div key={i} style={{
            color:        i === 0 ? "#555566" : "#333344",
            borderBottom: "1px solid #1a1a1f",
            padding:      "2px 0",
            fontSize:     "10px",
            lineHeight:   1.6,
          }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

function Val({ v, ok }) {
  return (
    <span style={{
      color:       ok ? "#22c55e" : "#ef4444",
      fontWeight:  600,
      marginRight: "6px",
    }}>
      {v ?? "—"}
    </span>
  )
}
