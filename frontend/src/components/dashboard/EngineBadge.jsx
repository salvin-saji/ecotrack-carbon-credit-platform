import { motion } from "framer-motion"
import { useESP32 } from "../../hooks/useESP32"
import { engineConfig } from "../../utils/display"

export default function EngineBadge() {
  const { telemetry } = useESP32()
  const engineOn = telemetry.engine === 1
                || telemetry.engine === true
                || telemetry.engine === "1"
  const cfg = engineConfig(telemetry.engine)

  return (
    <motion.div
      animate={{
        background:   cfg.bg,
        borderColor:  cfg.border,
      }}
      transition={{ duration: 0.3 }}
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "7px",
        padding:      "6px 14px",
        borderRadius: "20px",
        border:       "1px solid",
        fontSize:     "12px",
        fontWeight:   500,
        color:        cfg.color,
        cursor:       "default"
      }}>

      {/* Dot */}
      <motion.div
        animate={engineOn
          ? { opacity:[1,0.3,1], scale:[1,0.75,1] }
          : { opacity:1, scale:1 }
        }
        transition={engineOn
          ? { duration:2, repeat:Infinity, ease:"easeInOut" }
          : {}
        }
        style={{
          width:        "7px",
          height:       "7px",
          borderRadius: "50%",
          background:   cfg.dot,
          boxShadow:    engineOn
            ? `0 0 8px ${cfg.dot}`
            : "none",
          flexShrink:   0
        }} />

      {/* Icon */}
      <i className={`ti ${cfg.icon}`}
         style={{ fontSize:"14px" }} />

      {/* Label */}
      <span>{cfg.label}</span>
    </motion.div>
  )
}
