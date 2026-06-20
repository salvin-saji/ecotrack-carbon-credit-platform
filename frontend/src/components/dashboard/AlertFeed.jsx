import { motion, AnimatePresence } from "framer-motion"
import { useESP32 } from "../../hooks/useESP32"

// Alert type → visual config
const alertStyle = {
  success: {
    iconBg:    "rgba(34,197,94,0.12)",
    iconColor: "#22c55e",
    titleColor:"#22c55e",
    border:    "rgba(34,197,94,0.10)"
  },
  info: {
    iconBg:    "rgba(59,130,246,0.12)",
    iconColor: "#3b82f6",
    titleColor:"#3b82f6",
    border:    "rgba(59,130,246,0.10)"
  },
  warning: {
    iconBg:    "rgba(245,158,11,0.12)",
    iconColor: "#f59e0b",
    titleColor:"#f59e0b",
    border:    "rgba(245,158,11,0.10)"
  },
  danger: {
    iconBg:    "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
    titleColor:"#ef4444",
    border:    "rgba(239,68,68,0.10)"
  }
}

export default function AlertFeed() {
  const { alerts, clearAlerts, telemetry, isLive }
    = useESP32()
  const engineOn = telemetry.engine === 1

  return (
    <div style={{
      background:   "#111",
      border:       "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding:      "20px 22px",
      height:       "340px",
      display:      "flex",
      flexDirection:"column"
    }}>

      {/* Header */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   "16px"
      }}>
        <div style={{ display:"flex", alignItems:"center",
                      gap:"8px" }}>
          <span style={{
            fontSize:"11px", fontWeight:500,
            textTransform:"uppercase", letterSpacing:"0.8px",
            color:"#3a3a45"
          }}>
            Live Alerts
          </span>
          {alerts.length > 0 && (
            <span style={{
              background: "rgba(239,68,68,0.15)",
              color:      "#ef4444",
              fontSize:   "10px", fontWeight:600,
              padding:    "2px 7px",
              borderRadius:"10px"
            }}>
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button onClick={clearAlerts} style={{
            fontSize:"11px", color:"#3a3a45",
            background:"none", border:"none",
            cursor:"pointer",
            transition:"color 0.2s"
          }}
          onMouseEnter={e => e.target.style.color="#f1f1f3"}
          onMouseLeave={e => e.target.style.color="#3a3a45"}>
            Clear all
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex:       1,
        minHeight:  0,
        overflowY:  "auto",
        paddingRight:"4px"
      }}>

        {/* Engine OFF state */}
        {!isLive && (
          <div style={{
            textAlign:"center", padding:"24px 0",
            color:"#3a3a45", fontSize:"12px"
          }}>
            Connect ESP32 to see alerts
          </div>
        )}

        {isLive && !engineOn && (
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "10px",
            padding:      "12px",
            background:   "rgba(107,107,122,0.06)",
            border:       "1px solid rgba(107,107,122,0.12)",
            borderRadius: "8px"
          }}>
            <div style={{
              width:"28px", height:"28px",
              borderRadius:"6px", minWidth:"28px",
              display:"flex", alignItems:"center",
              justifyContent:"center",
              background:"rgba(107,107,122,0.12)"
            }}>
              <i className="ti ti-engine-off"
                 style={{color:"#6b6b7a",fontSize:"13px"}} />
            </div>
            <div>
              <p style={{
                fontSize:"12px", color:"#6b6b7a",
                fontWeight:500, marginBottom:"2px"
              }}>
                Engine OFF — Vehicle Idle
              </p>
              <p style={{fontSize:"11px", color:"#3a3a45"}}>
                No driving alerts while engine is off
              </p>
            </div>
          </div>
        )}

        {isLive && engineOn && alerts.length === 0 && (
          <div style={{
            textAlign:"center", padding:"24px 0",
            color:"#3a3a45", fontSize:"12px"
          }}>
            No alerts — driving normally
          </div>
        )}

        <AnimatePresence initial={false}>
          {alerts.map(alert => {
            const style = alertStyle[alert.type]
                       || alertStyle["info"]
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity:0, x:20, height:0 }}
                animate={{ opacity:1, x:0, height:"auto" }}
                exit={{    opacity:0, x:20, height:0 }}
                transition={{ duration:0.2, ease:"easeOut" }}
                style={{ overflow:"hidden" }}>
                <div style={{
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "10px",
                  padding:      "10px 0",
                  borderBottom: `1px solid rgba(255,255,255,0.04)`
                }}>
                  {/* Icon */}
                  <div style={{
                    width:     "30px", height:"30px",
                    minWidth:  "30px",
                    borderRadius:"8px",
                    background: style.iconBg,
                    border:    `1px solid ${style.border}`,
                    display:   "flex",
                    alignItems:"center",
                    justifyContent:"center"
                  }}>
                    <i className={`ti ${alert.icon}`}
                       style={{
                         fontSize:"13px",
                         color: style.iconColor
                       }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{
                      fontSize:    "12px",
                      fontWeight:  500,
                      color:       style.titleColor,
                      marginBottom:"3px"
                    }}>
                      {alert.title}
                    </p>
                    <p style={{
                      fontSize:   "11px",
                      color:      "#6b6b7a",
                      lineHeight: 1.5
                    }}>
                      {alert.text}
                    </p>
                    <p style={{
                      fontSize:  "10px",
                      color:     "#3a3a45",
                      marginTop: "3px"
                    }}>
                      {alert.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
