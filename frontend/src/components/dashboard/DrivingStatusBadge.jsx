import { motion, AnimatePresence } from "framer-motion"
import { useESP32 } from "../../hooks/useESP32"
import { drivingStatusConfig } from "../../utils/display"

export default function DrivingStatusBadge() {
  const { telemetry } = useESP32()
  const cfg = drivingStatusConfig(telemetry.drivingStatus)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={telemetry.drivingStatus || "empty"}
        initial={{ opacity:0, scale:0.95, y:4 }}
        animate={{ opacity:1, scale:1,    y:0 }}
        exit={{    opacity:0, scale:0.95, y:-4 }}
        transition={{ duration:0.25, ease:"easeOut" }}
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "10px",
          padding:      "12px 16px",
          borderRadius: "12px",
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
        }}>

        {/* Pulsing dot */}
        {cfg.pulse && (
          <motion.div
            animate={{ opacity:[1,0.3,1], scale:[1,0.7,1] }}
            transition={{
              duration:2, repeat:Infinity, ease:"easeInOut"
            }}
            style={{
              width:        "8px",
              height:       "8px",
              borderRadius: "50%",
              background:   cfg.color,
              boxShadow:    `0 0 10px ${cfg.color}`,
              flexShrink:   0
            }} />
        )}

        {/* Icon */}
        <i className={`ti ${cfg.icon}`}
           style={{ fontSize:"18px", color:cfg.color }} />

        {/* Labels */}
        <div>
          <p style={{
            fontSize:   "13px",
            fontWeight: 500,
            color:      cfg.color,
            lineHeight: 1
          }}>
            {cfg.label}
          </p>
          {cfg.sub && (
            <p style={{
              fontSize:  "11px",
              color:     "#6b6b7a",
              marginTop: "3px"
            }}>
              {cfg.sub}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
