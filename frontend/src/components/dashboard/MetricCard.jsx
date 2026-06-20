import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion"

export default function MetricCard({
  label, value, suffix, sub, icon,
  color, trend, isEmpty
}) {
  const prevVal = useRef(value)
  const direction = value > prevVal.current ? "up"
                  : value < prevVal.current ? "down"
                  : "same"
  useEffect(() => { prevVal.current = value }, [value])

  return (
    <div className="premium-card premium-card-hover" style={{
      borderRadius: "14px",
      padding:      "20px 22px",
      transition:   "border-color 0.2s"
    }}>

      {/* Label row */}
      <div style={{
        display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:"12px"
      }}>
        <span style={{
          fontSize:"11px", fontWeight:500,
          textTransform:"uppercase", letterSpacing:"0.8px",
          color:"#6b6b7a"
        }}>
          {label}
        </span>
        <i className={`ti ti-${icon}`}
           style={{ fontSize:"16px", color:"#22c55e" }} />
      </div>

      {/* Value with live animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0.5, y: direction==="up" ? 4 : -4 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize:   "26px",
            fontWeight: "200",
            color:      isEmpty ? "#3a3a45" : (color || "#f1f1f3"),
            lineHeight: 1,
            marginBottom: "8px",
            fontFamily: "Inter, sans-serif"
          }}>
          {value}
          {!isEmpty && suffix && (
            <span style={{
              fontSize:"13px", color:"#6b6b7a",
              marginLeft:"4px", fontWeight:400
            }}>
              {suffix}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sub text */}
      <div style={{
        fontSize:"11px", color:"#6b6b7a",
        display:"flex", alignItems:"center", gap:"4px"
      }}>
        {!isEmpty && trend && (
          <i className={`ti ti-trending-${
            trend === "up" ? "up" : "down"
          }`} style={{
            color: trend === "up" ? "#22c55e" : "#ef4444",
            fontSize:"11px"
          }} />
        )}
        {sub}
      </div>
    </div>
  )
}
