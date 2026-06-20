import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PremiumButton({
  children, onClick, loading, success, error, type='button'
}) {
  const [ripples, setRipples]     = useState([])
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const btnRef = useRef(null)

  // Determine current glow shadow based on state
  const getBoxShadow = () => {
    if (success) return `
      0 0 32px rgba(34,197,94,0.60),
      0 0 80px rgba(34,197,94,0.25),
      0 0 0 2px rgba(34,197,94,0.40)
    `
    if (isPressed) return `
      0 0 0 3px rgba(34,197,94,0.25),
      0 0 24px rgba(34,197,94,0.50),
      0 0 64px rgba(34,197,94,0.20),
      0 0 96px rgba(34,197,94,0.08),
      0 2px 8px rgba(0,0,0,0.4) inset
    `
    if (isHovered) return `
      0 8px 32px rgba(34,197,94,0.35),
      0 0 48px rgba(34,197,94,0.15),
      0 1px 0 rgba(255,255,255,0.12) inset
    `
    return `
      0 4px 20px rgba(34,197,94,0.20),
      0 1px 0 rgba(255,255,255,0.08) inset
    `
  }

  // Ripple on click
  const addRipple = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() =>
      setRipples(prev => prev.filter(r => r.id !== id)), 900)
  }

  const handlePointerDown = (e) => {
    setIsPressed(true)
    addRipple(e)
  }

  const handlePointerUp = () => {
    setIsPressed(false)
  }

  const handlePointerLeave = () => {
    setIsPressed(false)
    setIsHovered(false)
  }

  const handleClick = (e) => {
    if (onClick) onClick(e)
  }

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}

      // Touch support (mobile)
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}

      disabled={loading || success}

      // Scale animation
      animate={{
        scale: isPressed ? 0.97 : isHovered ? 1.02 : 1,
        y:     isPressed ? 0    : isHovered ? -2   : 0,
        ...(error ? { x: [0,-8,8,-6,6,-4,4,0] } : {})
      }}
      transition={{
        scale:    { duration: 0.15, ease: [0.4,0,0.2,1] },
        y:        { duration: 0.25, ease: [0.4,0,0.2,1] },
        boxShadow:{ duration: 0.25, ease: [0.4,0,0.2,1] },
        x:        { duration: 0.4 }
      }}

      style={{
        width:        '100%',
        height:       '52px',
        background:   success
          ? '#22c55e'
          : isPressed
          ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          : isHovered
          ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)'
          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        borderRadius: '14px',
        border:       isPressed
          ? '1px solid rgba(34,197,94,0.5)'
          : '1px solid rgba(34,197,94,0.0)',
        color:        '#000',
        fontSize:     '14px',
        fontWeight:   '500',
        cursor:       loading||success ? 'not-allowed' : 'pointer',
        position:     'relative',
        overflow:     'hidden',
        marginTop:    '24px',
        boxShadow:    getBoxShadow(),
        transition:   'box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s ease, border-color 0.25s ease',
        userSelect:   'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction:  'manipulation',
      }}>

      {/* ── OUTER GLOW RING (touch/active only) ── */}
      <motion.div
        animate={{
          opacity: isPressed ? 1 : 0,
          scale:   isPressed ? 1 : 0.85
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position:     'absolute',
          inset:        '-4px',
          borderRadius: '18px',
          border:       '1px solid rgba(34,197,94,0.35)',
          boxShadow:    '0 0 20px rgba(34,197,94,0.3)',
          pointerEvents:'none',
          zIndex:       0
        }}
      />

      {/* ── SECOND OUTER RING (wider glow) ── */}
      <motion.div
        animate={{
          opacity: isPressed ? 0.5 : 0,
          scale:   isPressed ? 1 : 0.7
        }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        style={{
          position:     'absolute',
          inset:        '-10px',
          borderRadius: '24px',
          border:       '1px solid rgba(34,197,94,0.15)',
          pointerEvents:'none',
          zIndex:       0
        }}
      />

      {/* ── SHIMMER SWEEP on hover ── */}
      <motion.div
        style={{
          position:   'absolute', top:0, left:0,
          width:      '100%', height:'100%',
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
          pointerEvents: 'none', zIndex: 1
        }}
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* ── PRESS DARKENING OVERLAY ── */}
      <motion.div
        animate={{ opacity: isPressed ? 0.12 : 0 }}
        transition={{ duration: 0.1 }}
        style={{
          position:   'absolute', inset: 0,
          background: '#000',
          borderRadius:'14px',
          pointerEvents:'none', zIndex: 1
        }}
      />

      {/* ── RIPPLE EFFECTS ── */}
      {ripples.map(r => (
        <motion.span key={r.id}
          style={{
            position:     'absolute',
            left:         r.x, top: r.y,
            width:        0, height: 0,
            borderRadius: '50%',
            background:   'rgba(255,255,255,0.18)',
            transform:    'translate(-50%,-50%)',
            pointerEvents:'none', zIndex: 2
          }}
          animate={{
            width:   [0, 220],
            height:  [0, 220],
            opacity: [0.6, 0]
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}

      {/* ── BUTTON CONTENT ── */}
      <div style={{ position:'relative', zIndex: 3 }}>
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="loading"
              initial={{ opacity:0, scale:0.7 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.7 }}
              transition={{ duration:0.15 }}
              style={{
                display:'flex', alignItems:'center',
                justifyContent:'center', gap:'8px'
              }}>
              <motion.div
                style={{
                  width:18, height:18, borderRadius:'50%',
                  border:'2px solid rgba(0,0,0,0.25)',
                  borderTopColor:'#000'
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration:0.7, repeat:Infinity,
                  ease:'linear'
                }} />
              <span style={{fontSize:'13px',opacity:0.8}}>
                Signing in...
              </span>
            </motion.div>
          )}

          {success && !loading && (
            <motion.div key="success"
              initial={{ opacity:0, scale:0.4 }}
              animate={{ opacity:1, scale:1 }}
              transition={{
                type:'spring', stiffness:500, damping:18
              }}
              style={{
                display:'flex', alignItems:'center',
                justifyContent:'center'
              }}>
              <svg width="24" height="24"
                   viewBox="0 0 24 24" fill="none">
                <motion.circle
                  cx="12" cy="12" r="9"
                  stroke="#000" strokeWidth="1.5"
                  initial={{ pathLength:0 }}
                  animate={{ pathLength:1 }}
                  transition={{ duration:0.35 }} />
                <motion.path
                  d="M8 12l3 3 5-5"
                  stroke="#000" strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength:0 }}
                  animate={{ pathLength:1 }}
                  transition={{ duration:0.3, delay:0.25 }} />
              </svg>
            </motion.div>
          )}

          {!loading && !success && (
            <motion.span key="text"
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.15 }}>
              {children}
            </motion.span>
          )}

        </AnimatePresence>
      </div>
    </motion.button>
  )
}
