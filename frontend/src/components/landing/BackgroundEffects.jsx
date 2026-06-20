import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function BackgroundEffects() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 45, stiffness: 200, mass: 1.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate coordinates relative to center of viewport
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Noise filter */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015] contrast-125 pointer-events-none">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Radical Glow Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 75%)`
        }}
      />

      {/* Interactive Orbs */}
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
        className="absolute left-[25%] top-[15%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px]"
      />
      <motion.div
        style={{
          x: useSpring(mouseX, { damping: 65, stiffness: 150 }),
          y: useSpring(mouseY, { damping: 65, stiffness: 150 }),
        }}
        className="absolute right-[20%] bottom-[20%] w-[450px] h-[450px] rounded-full bg-emerald-700/5 blur-[120px]"
      />

      {/* Ambient Grid Accent */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]"
      />
    </div>
  );
}
