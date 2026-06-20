import { motion } from "framer-motion"
import { useESP32 } from "../../hooks/useESP32"

export default function ConnectionStatus() {
  const { esp32, socketOK, isLive } = useESP32()

  const items = [
    {
      label:     "Backend",
      active:    socketOK,
      detail:    socketOK ? "ONLINE" : "OFFLINE"
    },
    {
      label:     "ESP32",
      active:    esp32.connected,
      detail:    esp32.connected
                   ? `${esp32.port || "COM12"} CONNECTED`
                   : "NOT DETECTED"
    },
    {
      label:     "Live Stream",
      active:    isLive,
      detail:    isLive ? "ACTIVE" : "WAITING"
    }
  ]

  return (
    <div style={{
      display:"flex", gap:"8px", alignItems:"center"
    }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          animate={{
            backgroundColor: item.active
              ? "rgba(34,197,94,0.07)"
              : "rgba(245,158,11,0.07)",
            borderColor: item.active
              ? "rgba(34,197,94,0.18)"
              : "rgba(245,158,11,0.18)"
          }}
          transition={{ duration: 0.3 }}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            padding:      "5px 12px",
            borderRadius: "20px",
            border:       "1px solid",
            fontSize:     "11px",
            fontWeight:   500,
            color:        item.active ? "#22c55e" : "#f59e0b",
            whiteSpace:   "nowrap"
          }}>
          <motion.div
            animate={item.active
              ? { opacity:[1,0.3,1], scale:[1,0.8,1] }
              : { opacity:1, scale:1 }
            }
            transition={item.active
              ? { duration:2, repeat:Infinity,
                  ease:"easeInOut" }
              : {}
            }
            style={{
              width:        "6px",
              height:       "6px",
              borderRadius: "50%",
              background:   item.active ? "#22c55e" : "#f59e0b",
              boxShadow:    item.active
                ? "0 0 6px rgba(34,197,94,0.7)"
                : "none",
              flexShrink:   0
            }} />
          <span>{item.label}</span>
          <span style={{ opacity:0.7 }}>· {item.detail}</span>
        </motion.div>
      ))}
    </div>
  )
}
