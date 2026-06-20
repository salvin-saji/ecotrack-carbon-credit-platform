import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ECO_TIPS = [
  { icon: 'ti-bolt-off',    label: 'Smooth Acceleration', tip: 'Reduce sudden acceleration to save fuel and earn more carbon credits.' },
  { icon: 'ti-gauge',       label: 'Steady Speed',        tip: 'Maintain steady speed for better fuel efficiency and lower CO₂ output.' },
  { icon: 'ti-brake',       label: 'Easy Braking',        tip: 'Avoid harsh braking — anticipate stops early to reduce energy waste.' },
  { icon: 'ti-engine-off',  label: 'No Idle Engine',      tip: 'Engine idle time increases emissions. Switch off when parked.' },
  { icon: 'ti-cloud',       label: 'Lower Emissions',     tip: 'Driving below 80 km/h significantly reduces your CO₂ rate.' },
  { icon: 'ti-leaf',        label: 'Eco Mode',            tip: 'Smooth, consistent driving can improve fuel efficiency by up to 15%.' },
  { icon: 'ti-map-route',   label: 'Plan Ahead',          tip: 'Plan your route to avoid stop-and-go traffic for fewer harsh events.' },
  { icon: 'ti-bolt',        label: 'Anticipate Traffic',  tip: 'Coast before stopping — it saves fuel and reduces brake wear.' },
  { icon: 'ti-sun',         label: 'Use AC Wisely',       tip: 'Moderate AC usage reduces CO₂ output on short urban trips.' },
  { icon: 'ti-award',       label: 'Earn Credits',        tip: 'Every eco trip earns carbon credits tradeable on the marketplace.' },
]

const TIP_INTERVAL_MS = 5000

export default function EcoAIAssistant() {
  const [tipIndex, setTipIndex] = useState(0)
  const [pulsing, setPulsing]   = useState(true)
  const intervalRef              = useRef(null)
  const pulseRef                 = useRef(null)
  const mountedRef               = useRef(true)

  // Rotate tips — stop cleanly on unmount
  useEffect(() => {
    mountedRef.current = true
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return
      setTipIndex(i => (i + 1) % ECO_TIPS.length)
    }, TIP_INTERVAL_MS)

    pulseRef.current = setInterval(() => {
      if (!mountedRef.current) return
      setPulsing(p => !p)
    }, 1200)

    return () => {
      mountedRef.current = false
      clearInterval(intervalRef.current)
      clearInterval(pulseRef.current)
    }
  }, [])

  const tip = ECO_TIPS[tipIndex]

  return (
    <div style={{
      background:   '#111',
      border:       '1px solid rgba(34,197,94,0.15)',
      borderRadius: '14px',
      padding:      '20px 22px',
      height:       '340px',
      display:      'flex',
      flexDirection:'column',
      boxShadow:    '0 0 0 1px rgba(34,197,94,0.04), 0 4px 24px rgba(0,0,0,0.3)',
      position:     'relative',
      overflow:     'hidden',
    }}>

      {/* Subtle glow top-left accent */}
      <div style={{
        position:       'absolute',
        top:            '-30px',
        left:           '-30px',
        width:          '120px',
        height:         '120px',
        borderRadius:   '50%',
        background:     'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        pointerEvents:  'none',
      }} />

      {/* ── HEADER ── */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   '16px',
        borderBottom:   '1px solid rgba(255,255,255,0.04)',
        paddingBottom:  '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Animated AI pulse dot */}
          <div style={{
            width:      '8px',
            height:     '8px',
            borderRadius:'50%',
            background: '#22c55e',
            flexShrink: 0,
            boxShadow: pulsing
              ? '0 0 12px rgba(34,197,94,0.9), 0 0 24px rgba(34,197,94,0.35)'
              : '0 0 4px rgba(34,197,94,0.4)',
            transition: 'box-shadow 0.7s ease',
          }} />
          <span style={{
            fontSize:      '11px',
            fontWeight:    500,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color:         '#3a3a45',
          }}>
            Eco AI Assistant
          </span>
        </div>

        {/* Active badge */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '5px',
          background:   'rgba(34,197,94,0.07)',
          border:       '1px solid rgba(34,197,94,0.15)',
          borderRadius: '20px',
          padding:      '3px 8px',
        }}>
          <span style={{
            width:      '5px',
            height:     '5px',
            borderRadius:'50%',
            background: '#22c55e',
            display:    'inline-block',
            animation:  'aiPulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>
            Active
          </span>
        </div>
      </div>

      {/* ── TIP CARD ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {/* Tip number indicator */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          marginBottom:  '14px',
        }}>
          <span style={{ fontSize: '10px', color: '#3a3a45', fontFamily: 'monospace' }}>
            Tip {tipIndex + 1} / {ECO_TIPS.length}
          </span>
          {/* Dot progress pills */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {ECO_TIPS.map((_, i) => (
              <div key={i} style={{
                width:        i === tipIndex ? '16px' : '4px',
                height:       '4px',
                borderRadius: '2px',
                background:   i === tipIndex ? '#22c55e' : 'rgba(255,255,255,0.08)',
                transition:   'all 0.35s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Animated tip swap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Icon row */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              padding:      '12px 14px',
              background:   'rgba(34,197,94,0.04)',
              border:       '1px solid rgba(34,197,94,0.10)',
              borderRadius: '10px',
              marginBottom: '10px',
            }}>
              <div style={{
                width:         '34px',
                height:        '34px',
                borderRadius:  '8px',
                background:    'rgba(34,197,94,0.10)',
                border:        '1px solid rgba(34,197,94,0.15)',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                flexShrink:    0,
              }}>
                <i className={`ti ${tip.icon}`} style={{ color: '#22c55e', fontSize: '15px' }} />
              </div>
              <div>
                <p style={{
                  fontSize:    '11px',
                  fontWeight:  600,
                  color:       '#22c55e',
                  marginBottom:'3px',
                }}>
                  {tip.label}
                </p>
                <p style={{
                  fontSize:   '12px',
                  color:      '#8a8a9a',
                  lineHeight: 1.55,
                  margin:     0,
                }}>
                  {tip.tip}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div style={{
          height:      '2px',
          background:  'rgba(255,255,255,0.05)',
          borderRadius:'2px',
          overflow:    'hidden',
          marginTop:   '6px',
        }}>
          <motion.div
            key={`prog-${tipIndex}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: TIP_INTERVAL_MS / 1000, ease: 'linear' }}
            style={{
              height:     '100%',
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              borderRadius:'2px',
            }}
          />
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
