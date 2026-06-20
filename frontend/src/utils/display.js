// ── ENGINE STATUS ──
export const engineConfig = (engineValue) => {
  const isOn = engineValue === 1
            || engineValue === true
            || engineValue === "1"

  const isOff = engineValue === 0
             || engineValue === false
             || engineValue === "0"

  if (isOn) return {
    label:   "Engine ON",
    color:   "#22c55e",
    bg:      "rgba(34,197,94,0.10)",
    border:  "rgba(34,197,94,0.20)",
    icon:    "ti-engine",
    dot:     "#22c55e"
  }
  if (isOff) return {
    label:   "Engine OFF",
    color:   "#ef4444",
    bg:      "rgba(239,68,68,0.10)",
    border:  "rgba(239,68,68,0.20)",
    icon:    "ti-engine-off",
    dot:     "#ef4444"
  }
  // null — no data yet
  return {
    label:   "—",
    color:   "#3a3a45",
    bg:      "rgba(58,58,69,0.10)",
    border:  "rgba(58,58,69,0.15)",
    icon:    "ti-engine",
    dot:     "#3a3a45"
  }
}

// ── DRIVING STATUS ──
export const drivingStatusConfig = (status) => {
  const map = {

    "ENGINE_OFF": {
      label:   "Vehicle Idle",
      sub:     "Engine is off",
      color:   "#6b6b7a",
      bg:      "rgba(107,107,122,0.08)",
      border:  "rgba(107,107,122,0.15)",
      icon:    "ti-zZZ",
      type:    "idle",
      pulse:   false
    },

    "ENGINE_IDLE": {
      label:   "Engine Idle",
      sub:     "Engine running while stationary",
      color:   "#f59e0b",
      bg:      "rgba(245,158,11,0.10)",
      border:  "rgba(245,158,11,0.22)",
      icon:    "ti-engine",
      type:    "warning",
      pulse:   true
    },

    "ECO_DRIVING": {
      label:   "Eco Driving",
      sub:     "Low emission • Green mode",
      color:   "#22c55e",
      bg:      "rgba(34,197,94,0.10)",
      border:  "rgba(34,197,94,0.25)",
      icon:    "ti-leaf",
      type:    "positive",
      pulse:   true
    },

    "SMOOTH_DRIVING": {
      label:   "Smooth Driving",
      sub:     "Gentle and efficient",
      color:   "#22c55e",
      bg:      "rgba(34,197,94,0.08)",
      border:  "rgba(34,197,94,0.18)",
      icon:    "ti-leaf",
      type:    "positive",
      pulse:   false
    },

    "NORMAL_DRIVING": {
      label:   "Normal Driving",
      sub:     "Moderate speed • Acceptable emission",
      color:   "#3b82f6",
      bg:      "rgba(59,130,246,0.10)",
      border:  "rgba(59,130,246,0.20)",
      icon:    "ti-car",
      type:    "neutral",
      pulse:   false
    },

    "HIGH_SPEED": {
      label:   "High Speed",
      sub:     "Over 90 km/h • Reduce speed",
      color:   "#f59e0b",
      bg:      "rgba(245,158,11,0.10)",
      border:  "rgba(245,158,11,0.22)",
      icon:    "ti-gauge",
      type:    "warning",
      pulse:   true
    },

    "AGGRESSIVE_ACCELERATION": {
      label:   "Aggressive Driving",
      sub:     "High throttle delta detected",
      color:   "#ef4444",
      bg:      "rgba(239,68,68,0.10)",
      border:  "rgba(239,68,68,0.25)",
      icon:    "ti-bolt",
      type:    "danger",
      pulse:   true
    },

    "HIGH_EMISSION": {
      label:   "High Emission",
      sub:     "CO₂ above safe threshold",
      color:   "#ef4444",
      bg:      "rgba(239,68,68,0.10)",
      border:  "rgba(239,68,68,0.25)",
      icon:    "ti-cloud",
      type:    "danger",
      pulse:   true
    },
  }

  return map[status] || {
    label:   "—",
    sub:     "Waiting for data",
    color:   "#3a3a45",
    bg:      "rgba(58,58,69,0.08)",
    border:  "rgba(58,58,69,0.12)",
    icon:    "ti-car",
    type:    "idle",
    pulse:   false
  }
}

// ── VALUE FORMATTER ──
export const val = (v, decimals=null, suffix="") => {
  if (v === null || v === undefined) return "—"
  if (typeof v === "string" && v.trim() === "") return "—"
  const num = Number(v)
  if (isNaN(num)) return "—"
  return (decimals !== null
    ? num.toFixed(decimals)
    : String(num)
  ) + suffix
}

// ── SPEED COLOR ──
export const speedColor = (speed) => {
  if (speed === null || speed === undefined) return "#3a3a45"
  const s = Number(speed)
  if (s < 40)  return "#22c55e"
  if (s <= 90) return "#3b82f6"
  return "#ef4444"
}

// ── CO2 COLOR ──
export const co2Color = (co2) => {
  if (co2 === null || co2 === undefined) return "#3a3a45"
  const c = Number(co2)
  if (c <= 0.6) return "#22c55e"
  if (c <= 1.0) return "#f59e0b"
  return "#ef4444"
}

// ── ECO SCORE COLOR ──
export const ecoColor = (score) => {
  if (score === null || score === undefined) return "#3a3a45"
  const s = Number(score)
  if (s >= 80) return "#22c55e"
  if (s >= 50) return "#f59e0b"
  return "#ef4444"
}

// ── PROGRESS BAR PERCENT ──
export const pct = (value, max) => {
  if (!value || !max) return 0
  return Math.min(100, Math.max(0, (value/max)*100))
}

// ── TAX STATUS CONFIG ──
export const taxConfig = (status) => {
  if (status === "eligible") return {
    label: "✓ Eligible — Green Driver",
    color: "#22c55e", bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)"
  }
  if (status === "partial") return {
    label: "⚡ Partially Eligible",
    color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)"
  }
  return {
    label: "✗ Not Yet Eligible",
    color: "#ef4444", bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)"
  }
}
