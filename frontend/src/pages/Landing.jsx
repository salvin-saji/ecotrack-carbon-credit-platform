import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmissionPieChart from '../components/landing/EmissionPieChart';
import BackgroundEffects from '../components/landing/BackgroundEffects';
import AuthCard from '../components/auth/AuthCard';

function AnimatedCounter({ targetValue, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const end = parseInt(targetValue);
    const totalSteps = 60;
    const stepTime = duration / totalSteps;
    
    const timer = setInterval(() => {
      start += 1;
      const progress = start / totalSteps;
      // easeOutQuart calculation
      const easeVal = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeVal * end));
      
      if (start >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, targetValue, duration]);

  return (
    <span ref={elementRef} className="text-[32px] font-mono font-light text-[#f1f1f3] tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function ScrollFadeInContainer({ children, delay = 0 }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const [globalCO2, setGlobalCO2] = useState(245392.482);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalCO2(prev => prev + 0.031);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (window.scrollY > 100) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#070708] text-[#f1f1f3] font-sans selection:bg-[#22c55e] selection:text-[#070708] min-h-screen relative">
      
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-[#070708]/85 backdrop-blur-md border-[rgba(255,255,255,0.06)] py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-lg font-semibold tracking-tight text-[#f1f1f3]">EcoTrack</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] text-[#6b6b7a] font-medium">
            <button onClick={() => scrollToSection('about')} className="hover:text-[#f1f1f3] transition-colors">About</button>
            <button onClick={() => scrollToSection('stats')} className="hover:text-[#f1f1f3] transition-colors">Stats</button>
            <button onClick={() => scrollToSection('emissions-chart')} className="hover:text-[#f1f1f3] transition-colors">National Data</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#f1f1f3] transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#f1f1f3] transition-colors">Features</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('login-form-card')} 
              className="text-[13px] font-medium text-[#6b6b7a] hover:text-[#f1f1f3] transition-colors px-4 py-2"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="text-[13px] font-semibold text-[#070708] bg-[#22c55e] hover:bg-[#16a34a] transition-all px-4 py-2 rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO + LOGIN (above the fold) */}
      <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center px-6">
        <BackgroundEffects />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column (7/12) */}
          <div className="flex flex-col text-left lg:col-span-7 gap-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]"></span>
              <span className="text-2xl font-bold tracking-tight text-white font-display">EcoTrack</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)] text-[#22c55e] text-[11px] font-semibold tracking-wide uppercase self-start animate-pulse-glow">
              <span>🌿 Smart Eco-Driving Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extralight text-[#f1f1f3] tracking-tight leading-[1.1]">
              Reduce Harsh Driving.<br />
              <span className="text-[#22c55e] font-light">Reduce Carbon Emissions.</span><br />
              Earn Government Eco Benefits.
            </h1>

            <p className="text-[14px] text-[#888888] font-normal max-w-xl leading-relaxed">
              EcoTrack is a futuristic smart eco-driving platform. By streaming hardware-level telemetry from your vehicle, we measure emissions, grade efficiency, and award government benefits directly to green drivers.
            </p>

            {/* AI Explanations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="bg-[#0f172a]/60 border border-[#22c55e]/15 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <span className="text-[10px] font-semibold text-[#22c55e] font-mono tracking-wider uppercase block mb-1">
                  <i className="ti ti-cpu mr-1"></i> AI Eco-Driving Assistant
                </span>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Calculates real-time CO₂ rate fluctuations to emit active suggestions, training you to avoid throttle surges and high-RPM habits.
                </p>
              </div>

              <div className="bg-[#0f172a]/60 border border-[#22c55e]/15 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <span className="text-[10px] font-semibold text-[#22c55e] font-mono tracking-wider uppercase block mb-1">
                  <i className="ti ti-certificate mr-1"></i> Government Incentive System
                </span>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Consistent high eco ratings unlock road tax reduction tiers up to 15%, priority EV charging lanes, and digital eco certifications.
                </p>
              </div>
            </div>

            {/* Live Global Counter Widget */}
            <div className="bg-[#0f172a]/80 border border-[#22c55e]/25 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-[#22c55e]/5 my-1">
              <div>
                <span className="text-[9px] font-bold text-[#22c55e] tracking-[1.5px] uppercase font-mono">GLOBAL CARBON SAVINGS COUNTER</span>
                <span className="block text-2xl font-light font-mono text-white tracking-tight mt-1">
                  {globalCO2.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-xs text-[#6b6b7a] font-sans font-normal">kg CO₂ saved</span>
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            </div>

            {/* Row of stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-[rgba(255,255,255,0.04)] pt-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#6b6b7a] block uppercase font-sans">CO₂ SAVED TODAY</span>
                <span className="text-white font-bold text-sm">1,250 kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6b6b7a] block uppercase font-sans">ACTIVE ECO DRIVERS</span>
                <span className="text-white font-bold text-sm">2,430+</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6b6b7a] block uppercase font-sans">AVG REDUCTION</span>
                <span className="text-[#22c55e] font-bold text-sm">28% Avg</span>
              </div>
            </div>
          </div>

          {/* Right Column - Login (5/12) */}
          <div id="login-form-card" className="lg:col-span-5 flex justify-center lg:justify-end">
            <AuthCard />
          </div>
        </div>

        {/* Scroll indicator */}
        {showScrollArrow && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce cursor-pointer" onClick={() => scrollToSection('stats')}>
            <span className="text-[10px] text-[#3a3a45] font-mono tracking-wider uppercase">Scroll to explore</span>
            <i className="ti ti-chevron-down text-sm text-[#3a3a45]"></i>
          </div>
        )}
      </section>

      {/* SECTION 2: LIVE PLATFORM STATISTICS */}
      <section id="stats" className="py-20 bg-[#0e0e10] border-y border-[rgba(255,255,255,0.04)] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[28px] font-light tracking-tight text-[#f1f1f3]">Real Impact. Right Now.</h2>
            <p className="text-[13px] text-[#6b6b7a] mt-2">Live statistics from our eco-driving network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollFadeInContainer delay={0}>
              <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] border-t-2 border-t-[#22c55e] rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">TOTAL CO₂ REDUCED</span>
                  <AnimatedCounter targetValue="12540" suffix=" kg" />
                  <span className="block text-[10px] text-[#3a3a45] mt-1.5">across all registered drivers</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.05)] text-[#22c55e] flex items-center justify-center">
                  <i className="ti ti-leaf text-2xl"></i>
                </div>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={100}>
              <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] border-t-2 border-t-[#22c55e] rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">ACTIVE ECO DRIVERS</span>
                  <AnimatedCounter targetValue="2430" suffix=" drivers" />
                  <span className="block text-[10px] text-[#3a3a45] mt-1.5">currently using EcoTrack</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.05)] text-[#22c55e] flex items-center justify-center">
                  <i className="ti ti-users text-2xl"></i>
                </div>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={200}>
              <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] border-t-2 border-t-[#22c55e] rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">AVG EMISSION REDUCTION</span>
                  <AnimatedCounter targetValue="28" suffix="%" />
                  <span className="block text-[10px] text-[#3a3a45] mt-1.5">compared to national average</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.05)] text-[#22c55e] flex items-center justify-center">
                  <i className="ti ti-trending-down text-2xl"></i>
                </div>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={300}>
              <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] border-t-2 border-t-[#22c55e] rounded-xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">GREEN DRIVING SESSIONS</span>
                  <AnimatedCounter targetValue="5120" suffix=" sessions" />
                  <span className="block text-[10px] text-[#3a3a45] mt-1.5">completed this week</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.05)] text-[#22c55e] flex items-center justify-center">
                  <i className="ti ti-car text-2xl"></i>
                </div>
              </div>
            </ScrollFadeInContainer>
          </div>
        </div>
      </section>

      {/* SECTION 3: CARBON EMISSION PIE CHART */}
      <EmissionPieChart />

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#0e0e10] px-6 border-y border-[rgba(255,255,255,0.04)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[28px] font-light tracking-tight text-[#f1f1f3]">How EcoTrack Works</h2>
            <p className="text-[13px] text-[#6b6b7a] mt-2">Simple integration process from device to dashboard</p>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 max-w-5xl mx-auto">
            {/* Dashed line */}
            <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] border-t border-dashed border-[rgba(34,197,94,0.2)] z-0"></div>

            {/* Steps */}
            <ScrollFadeInContainer delay={0}>
              <div className="flex flex-col items-center text-center relative z-10 w-[200px]">
                <span className="absolute -top-6 text-[54px] font-light text-[#1b1b22] select-none font-mono">1</span>
                <div className="w-[60px] h-[60px] rounded-full bg-[#131316] border border-[#22c55e] flex items-center justify-center text-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.1)] mb-4">
                  <i className="ti ti-cpu text-2xl"></i>
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1.5">Connect ESP32</h4>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Plug your ESP32 device. System auto-detects in seconds.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={100}>
              <div className="flex flex-col items-center text-center relative z-10 w-[200px]">
                <span className="absolute -top-6 text-[54px] font-light text-[#1b1b22] select-none font-mono">2</span>
                <div className="w-[60px] h-[60px] rounded-full bg-[#131316] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-white mb-4">
                  <i className="ti ti-car text-2xl"></i>
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1.5">Drive as Usual</h4>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Speed, RPM, CO₂ captured live while you drive.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={200}>
              <div className="flex flex-col items-center text-center relative z-10 w-[200px]">
                <span className="absolute -top-6 text-[54px] font-light text-[#1b1b22] select-none font-mono">3</span>
                <div className="w-[60px] h-[60px] rounded-full bg-[#131316] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-white mb-4">
                  <i className="ti ti-chart-bar text-2xl"></i>
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1.5">Get Analyzed</h4>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Eco score, emission report, and AI suggestions generated.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={300}>
              <div className="flex flex-col items-center text-center relative z-10 w-[200px]">
                <span className="absolute -top-6 text-[54px] font-light text-[#1b1b22] select-none font-mono">4</span>
                <div className="w-[60px] h-[60px] rounded-full bg-[#131316] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-white mb-4">
                  <i className="ti ti-certificate text-2xl"></i>
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1.5">Earn Benefits</h4>
                <p className="text-[11px] text-[#6b6b7a] leading-relaxed">
                  Good eco scores qualify for government tax reduction.
                </p>
              </div>
            </ScrollFadeInContainer>
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES */}
      <section id="features" className="py-20 bg-[#070708] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[28px] font-light tracking-tight text-[#f1f1f3]">Everything You Need to Drive Green</h2>
            <p className="text-[13px] text-[#6b6b7a] mt-2">Comprehensive features for carbon emission tracking & habit building</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollFadeInContainer delay={0}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.06)] text-[#22c55e] flex items-center justify-center mb-4">
                  <i className="ti ti-gauge text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Real-Time Telemetry</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Live speed, RPM, throttle, and engine data streamed directly from your vehicle's ESP32.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={80}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.06)] text-[#22c55e] flex items-center justify-center mb-4">
                  <i className="ti ti-cloud text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Carbon Monitoring</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Accurate CO₂ calculation per drive. Track your environmental footprint in real time.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={160}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.06)] text-[#22c55e] flex items-center justify-center mb-4">
                  <i className="ti ti-star text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Eco Score System</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Get scored on every trip. Improve your habits and earn a higher sustainability rating.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={240}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.06)] text-[#f59e0b] flex items-center justify-center mb-4">
                  <i className="ti ti-alert-triangle text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Harsh Driving Alerts</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Automatic detection and alerts for harsh acceleration, braking, and engine idle events.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={320}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.06)] text-[#22c55e] flex items-center justify-center mb-4">
                  <i className="ti ti-certificate text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Tax Reduction Program</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Consistent eco-driving makes you eligible for government road tax reduction programs.
                </p>
              </div>
            </ScrollFadeInContainer>

            <ScrollFadeInContainer delay={400}>
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-[rgba(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.06)] text-[#22c55e] flex items-center justify-center mb-4">
                  <i className="ti ti-bulb text-xl"></i>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">AI Eco Suggestions</h3>
                <p className="text-[13px] text-[#6b6b7a] leading-relaxed">
                  Personalized AI-powered suggestions to help you reduce emissions and improve driving.
                </p>
              </div>
            </ScrollFadeInContainer>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-24 bg-[#0e0e10] border-t border-[rgba(255,255,255,0.04)] relative px-6 text-center" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34,197,94,0.03) 0%, transparent 60%)`
      }}>
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-[32px] font-light text-white tracking-tight">Start Your Green Driving Journey</h2>
          <p className="mt-3 text-[14px] text-[#6b6b7a] max-w-md">
            Join eco-conscious drivers reducing emissions in real time.
          </p>

          <button 
            onClick={() => navigate('/register')}
            className="mt-8 px-8 py-3 rounded-lg text-[14px] font-semibold text-[#070708] bg-[#22c55e] hover:bg-[#16a34a] transition-all shadow-[0_4px_14px_rgba(34,197,94,0.2)]"
          >
            Create Free Account
          </button>
          
          <span className="block mt-3.5 text-[11px] text-[#3a3a45]">No credit card required. Free forever.</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#070708] border-t border-[rgba(255,255,255,0.04)] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="text-[14px] font-semibold tracking-tight text-white">EcoTrack</span>
          </div>

          <div className="flex gap-8 text-[12px] text-[#6b6b7a] font-medium">
            <button onClick={() => scrollToSection('about')} className="hover:text-[#f1f1f3] transition-colors">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#f1f1f3] transition-colors">Features</button>
            <button onClick={() => scrollToSection('login-form-card')} className="hover:text-[#f1f1f3] transition-colors">Dashboard</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.04)] mt-8 pt-6 text-center md:text-left text-[11px] text-[#3a3a45]">
          © 2025 EcoTrack — Built for a Greener Future
        </div>
      </footer>

    </div>
  );
}
