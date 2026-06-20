import { useState, useEffect, useRef, useCallback } from 'react';

// Gear ratios for a 6-speed transmission (RPM per km/h)
const GEAR_RATIOS = [65, 45, 30, 20, 15, 11];
const IDLE_RPM = 800;
const MAX_RPM = 8000;
const REDLINE_RPM = 6200;

export const useTelemetry = () => {
  // Simulator Controls
  const [throttle, setThrottle] = useState(0); // 0 to 100
  const [brake, setBrake] = useState(0); // 0 to 100
  const [driveMode, setDriveMode] = useState('comfort'); // eco, comfort, sport, track
  const [regenLevel, setRegenLevel] = useState('high'); // off, low, high
  const [isAutopilot, setIsAutopilot] = useState(true); // Default to true for dynamic viewing

  // Vehicle Telemetry States
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(IDLE_RPM);
  const [gear, setGear] = useState('P'); // P, R, N, D1-D6, S1-S6
  const [battery, setBattery] = useState(85.0); // 0 to 100
  const [temp, setTemp] = useState(72.0); // Coolant temp °C
  const [co2, setCo2] = useState(0); // Realtime CO2 emissions (g/km)
  const [carbonCredits, setCarbonCredits] = useState(1248.50); // Wallet balance
  const [ecoScore, setEcoScore] = useState(90);
  
  // Trip Stats
  const [tripDistance, setTripDistance] = useState(12.4); // km
  const [tripTime, setTripTime] = useState(384); // seconds
  const [avgSpeed, setAvgSpeed] = useState(58.2); // km/h
  const [totalCo2Saved, setTotalCo2Saved] = useState(2.35); // kg CO2
  const [avgCo2, setAvgCo2] = useState(94.5); // g/km
  const [energyConsumption, setEnergyConsumption] = useState(148); // Wh/km equivalent

  // Physical HUD metrics
  const [tirePressures, setTirePressures] = useState([32.4, 32.1, 32.2, 32.5]); // FL, FR, RL, RR
  const [gForce, setGForce] = useState({ x: 0, y: 0 });
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', text: 'SYSTEMS INITIALIZED - NOMINAL', timestamp: '10:46:53' }
  ]);
  const [walletLogs, setWalletLogs] = useState([
    { id: 1, type: 'eco', text: 'Steady Cruising Credit Earned', reward: '+0.15 CCR', timestamp: '10:44:12' },
    { id: 2, type: 'regen', text: 'Regen Braking Harvest Bonus', reward: '+0.42 CCR', timestamp: '10:45:30' }
  ]);

  // Graphs Histories (30 elements)
  const [speedHistory, setSpeedHistory] = useState(Array(30).fill(0));
  const [co2History, setCo2History] = useState(Array(30).fill(0));

  // Refs for tracking values inside interval
  const currentGearRef = useRef(1);
  const totalSpeedSum = useRef(58.2 * 384);
  const totalCo2Sum = useRef(94.5 * 384);
  const totalCo2SavedRef = useRef(2.35);
  const alertIdCounter = useRef(2);
  const logIdCounter = useRef(3);

  // Helper to add live alert
  const addAlert = useCallback((type, text) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setAlerts(prev => [
      { id: alertIdCounter.current++, type, text, timestamp: timeString },
      ...prev.slice(0, 19) // Limit to 20 alerts
    ]);
  }, []);

  // Helper to add wallet log
  const addWalletLog = useCallback((type, text, reward) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setWalletLogs(prev => [
      { id: logIdCounter.current++, type, text, reward, timestamp: timeString },
      ...prev.slice(0, 9) // Limit to 10 logs
    ]);
  }, []);

  // Keyboard controls listener (W for throttle, S for brake)
  useEffect(() => {
    if (isAutopilot) return;

    const activeKeys = { w: false, s: false };
    let controlInterval;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 's') {
        activeKeys[key] = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 's') {
        activeKeys[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Smoothly interpolate throttle and brake inputs
    controlInterval = setInterval(() => {
      setThrottle(prev => {
        if (activeKeys.w) return Math.min(100, prev + 8);
        return Math.max(0, prev - 12);
      });
      setBrake(prev => {
        if (activeKeys.s) return Math.min(100, prev + 15);
        return Math.max(0, prev - 20);
      });
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(controlInterval);
    };
  }, [isAutopilot]);

  // Main physics loop (runs at 10Hz - every 100ms)
  useEffect(() => {
    const dt = 0.1; // seconds

    const physicsInterval = setInterval(() => {
      setTripTime(prev => prev + 1);

      // 1. Autopilot Predefined Driving Profiles
      let targetThrottle = throttle;
      let targetBrake = brake;
      let activeMode = driveMode;

      if (isAutopilot) {
        const timeCycle = tripTime % 60; // 60s cycle

        if (timeCycle < 8) {
          // Eco cruise startup
          activeMode = 'eco';
          targetThrottle = 25;
          targetBrake = 0;
        } else if (timeCycle < 18) {
          // Eco cruising
          activeMode = 'eco';
          targetThrottle = 12;
          targetBrake = 0;
        } else if (timeCycle < 24) {
          // Decelerate / Regen Braking
          activeMode = 'comfort';
          targetThrottle = 0;
          targetBrake = 35;
        } else if (timeCycle < 36) {
          // Sport high throttle blast
          activeMode = 'sport';
          targetThrottle = 85;
          targetBrake = 0;
        } else if (timeCycle < 48) {
          // Track speed cruising
          activeMode = 'track';
          targetThrottle = 45;
          targetBrake = 0;
        } else {
          // Hard brake to dynamic stop
          activeMode = 'comfort';
          targetThrottle = 0;
          targetBrake = 75;
        }

        setThrottle(targetThrottle);
        setBrake(targetBrake);
        setDriveMode(activeMode);
      }

      // 2. Physics Equations
      // Base constants dependent on drive mode
      let modePowerFactor = 1.0;
      let modeFuelConsumption = 1.0;
      if (driveMode === 'eco') { modePowerFactor = 0.7; modeFuelConsumption = 0.65; }
      else if (driveMode === 'sport') { modePowerFactor = 1.6; modeFuelConsumption = 1.5; }
      else if (driveMode === 'track') { modePowerFactor = 2.4; modeFuelConsumption = 2.2; }

      // Acceleration components
      const forceEngine = (targetThrottle / 100) * 15.0 * modePowerFactor;
      const forceBrakes = (targetBrake / 100) * 38.0;
      const forceDrag = speed * 0.045 + (speed * speed * 0.0003); // quadratic aerodynamic drag

      const netForce = forceEngine - forceBrakes - (speed > 0.1 ? forceDrag : 0);
      
      // Update Speed (limit 0 to 240)
      let nextSpeed = speed + netForce * dt * 7.2; // scaling factor for responsive speedometer
      if (nextSpeed < 0.1) nextSpeed = 0;
      if (nextSpeed > 240) nextSpeed = 240;
      setSpeed(nextSpeed);

      // 3. Transmission & Gear shifting simulator
      let nextGearLabel = 'P';
      let nextRpm = IDLE_RPM;
      let currentGear = currentGearRef.current;

      if (nextSpeed < 0.5 && targetThrottle === 0) {
        nextGearLabel = 'P';
        nextRpm = IDLE_RPM;
      } else {
        // Gear selection logic based on speed limits
        if (driveMode === 'track' || driveMode === 'sport') {
          // Sport shift points (rev high)
          if (nextSpeed < 25) currentGear = 1;
          else if (nextSpeed < 50) currentGear = 2;
          else if (nextSpeed < 85) currentGear = 3;
          else if (nextSpeed < 125) currentGear = 4;
          else if (nextSpeed < 170) currentGear = 5;
          else currentGear = 6;
        } else {
          // Comfort/Eco shift points (shift early)
          if (nextSpeed < 18) currentGear = 1;
          else if (nextSpeed < 38) currentGear = 2;
          else if (nextSpeed < 62) currentGear = 3;
          else if (nextSpeed < 88) currentGear = 4;
          else if (nextSpeed < 115) currentGear = 5;
          else currentGear = 6;
        }
        currentGearRef.current = currentGear;

        // RPM is proportional to speed and current gear ratio + throttle flare
        const gearRatio = GEAR_RATIOS[currentGear - 1];
        const throttleFlare = (targetThrottle / 100) * 1500;
        nextRpm = Math.round(nextSpeed * gearRatio + IDLE_RPM + throttleFlare);
        
        // Cap RPM
        if (nextRpm > MAX_RPM) nextRpm = MAX_RPM;

        const gearPrefix = driveMode === 'track' || driveMode === 'sport' ? 'S' : 'D';
        nextGearLabel = `${gearPrefix}${currentGear}`;
      }
      setGear(nextGearLabel);
      setRpm(nextRpm);

      // 4. Coolant temperature simulations
      // High speed cools engine, high RPM heats it
      const coolingFactor = nextSpeed * 0.05;
      const heatFactor = (nextRpm / MAX_RPM) * 0.25;
      const targetTemp = 90.0 + (driveMode === 'track' ? 8.0 : 0);
      setTemp(prev => {
        let diff = targetTemp - prev;
        let delta = (heatFactor - coolingFactor + diff * 0.01) * dt * 5;
        let finalTemp = prev + delta;
        return parseFloat(Math.max(50, Math.min(130, finalTemp)).toFixed(1));
      });

      // 5. Tire Pressures fluctuations
      setTirePressures(() => {
        const speedRatio = nextSpeed / 240;
        return [
          parseFloat((32.0 + speedRatio * 1.5 + Math.sin(tripTime * 0.02) * 0.1).toFixed(1)),
          parseFloat((32.0 + speedRatio * 1.5 + Math.cos(tripTime * 0.02) * 0.15).toFixed(1)),
          parseFloat((31.8 + speedRatio * 1.8 + Math.cos(tripTime * 0.01) * 0.1).toFixed(1)),
          parseFloat((31.9 + speedRatio * 1.8 + Math.sin(tripTime * 0.01) * 0.12).toFixed(1)),
        ];
      });

      // 6. G-Force Coordinates (X = lateral force from turns, Y = acceleration/deceleration)
      const gY = (netForce * 0.15); // deceleration/acceleration
      const gX = Math.sin(tripTime * 0.15) * (nextSpeed / 120); // lateral wiggle
      setGForce({
        x: parseFloat(Math.min(1.5, Math.max(-1.5, gX)).toFixed(2)),
        y: parseFloat(Math.min(1.5, Math.max(-1.5, gY)).toFixed(2))
      });

      // 7. Battery State of charge (EV side of hybrid powertrain)
      let currentRegenPercent = 0;
      if (regenLevel === 'low') currentRegenPercent = 0.3;
      if (regenLevel === 'high') currentRegenPercent = 0.8;
      
      setBattery(prev => {
        let drain = (targetThrottle / 100) * 0.012 * modePowerFactor;
        let charge = (targetBrake / 100) * 0.035 * currentRegenPercent;
        let nextBattery = prev - drain + charge;
        return parseFloat(Math.min(100, Math.max(0, nextBattery)).toFixed(2));
      });

      // 8. CO2 Emissions (g/km)
      // Standard ICE emits 180 g/km.
      // Our hybrid vehicle emission shifts dynamically. Under regen braking or full electric coastal (throttle = 0), CO2 is 0.
      let currentCo2 = 0;
      if (nextSpeed > 1.0 && targetThrottle > 0) {
        // Base combustion CO2
        currentCo2 = (nextRpm / MAX_RPM) * 140 + (targetThrottle / 100) * 60 + 50;
        currentCo2 *= modeFuelConsumption;
        
        // If battery has good charge (>20%), hybrid motor offsets 30% emissions
        if (battery > 20) {
          currentCo2 *= 0.70;
        }
      } else {
        currentCo2 = 0;
      }
      setCo2(Math.round(currentCo2));

      // 9. Eco Score (0 - 100)
      setEcoScore(prev => {
        // Penalty for high throttle
        const throttlePenalty = (targetThrottle > 50) ? (targetThrottle - 50) * 0.3 : 0;
        // Penalty for speed redlining or very high speeds
        const speedPenalty = (nextSpeed > 120) ? (nextSpeed - 120) * 0.15 : 0;
        // Penalty for high RPM
        const rpmPenalty = (nextRpm > REDLINE_RPM) ? (nextRpm - REDLINE_RPM) * 0.015 : 0;
        // Bonus for regen braking
        const regenBonus = (targetBrake > 10 && battery < 99) ? 2 : 0;

        const currentScore = Math.max(10, Math.min(100, 100 - throttlePenalty - speedPenalty - rpmPenalty + regenBonus));
        // Exponential moving average for smooth transitions
        return Math.round(prev * 0.95 + currentScore * 0.05);
      });

      // 10. Carbon Credits (CCR) and Offsets
      // Baseline emissions is 180 g/km. If we emit less than 180, we offset carbon.
      const baselineCo2Km = 180;
      const co2Diff = baselineCo2Km - currentCo2; // can be positive (offsets) or negative (heavy emission)
      
      // Calculate distance traveled in this 0.1s step (speed km/h * dt hr)
      const distanceStep = nextSpeed * (dt / 3600);
      setTripDistance(prev => parseFloat((prev + distanceStep).toFixed(3)));

      if (nextSpeed > 2) {
        // Offset in grams = diff (g/km) * distance (km)
        const offsetGrams = co2Diff * distanceStep;
        const offsetKg = offsetGrams / 1000;
        
        if (offsetKg > 0) {
          totalCo2SavedRef.current += offsetKg;
          setTotalCo2Saved(parseFloat(totalCo2SavedRef.current.toFixed(4)));

          // Earn carbon credits: 1 CCR per 0.01kg (10g) of CO2 saved
          const ccrEarned = offsetKg * 100.0;
          setCarbonCredits(prev => parseFloat((prev + ccrEarned).toFixed(4)));

          // Randomly trigger eco wallet logs for fun feedback
          if (Math.random() < 0.08 && targetThrottle < 30) {
            addWalletLog('eco', 'Steady Speed Emission Credit', `+${(ccrEarned * 10).toFixed(2)} CCR`);
          }
        }
      }

      // Regen reward credit trigger
      if (targetBrake > 25 && nextSpeed > 20 && Math.random() < 0.12) {
        const regenCcr = (targetBrake / 100) * 0.05 * currentRegenPercent;
        setCarbonCredits(prev => parseFloat((prev + regenCcr).toFixed(4)));
        addWalletLog('regen', 'Regenerative Braking Reward', `+${regenCcr.toFixed(2)} CCR`);
      }

      // 11. Average updates
      totalSpeedSum.current += nextSpeed;
      totalCo2Sum.current += currentCo2;
      setAvgSpeed(parseFloat((totalSpeedSum.current / (tripTime + 1)).toFixed(1)));
      setAvgCo2(parseFloat((totalCo2Sum.current / (tripTime + 1)).toFixed(1)));

      // Energy consumption equivalent calculation
      // Sport mode uses more energy, eco mode less
      const energyCalc = 100 + (nextSpeed * 0.8) + (targetThrottle * 0.6) + (driveMode === 'track' ? 90 : driveMode === 'sport' ? 40 : -20);
      setEnergyConsumption(Math.round(Math.max(30, energyCalc)));

      // 12. Warnings and Alert Flags
      // Check Speed alerts
      if (nextSpeed > 130) {
        addAlert('critical', `HIGH SPEED ALERT: VEHICLE RUNNING AT ${Math.round(nextSpeed)} km/h`);
      }
      // Check redline alert
      if (nextRpm > REDLINE_RPM) {
        addAlert('warning', `ENGINE REDLINE EXCEEDED: ${nextRpm} RPM`);
      }
      // Check high temperature alert
      if (temp > 108.0) {
        addAlert('critical', `CRITICAL ENGINE TEMP: COOLANT AT ${temp}°C`);
      }
      // Trigger regen info alert
      if (targetBrake > 30 && battery < 99 && Math.random() < 0.05) {
        addAlert('info', 'ENERGY HARVESTING ACTIVE - BATTERY RECHARGING');
      }

      // 13. Update graph histories (push to back, remove from front)
      setSpeedHistory(prev => [...prev.slice(1), Math.round(nextSpeed)]);
      setCo2History(prev => [...prev.slice(1), Math.round(currentCo2)]);

    }, 100);

    return () => clearInterval(physicsInterval);
  }, [speed, throttle, brake, driveMode, regenLevel, isAutopilot, tripTime, temp, battery, addAlert, addWalletLog]);

  return {
    // Simulator controls
    throttle, setThrottle,
    brake, setBrake,
    driveMode, setDriveMode,
    regenLevel, setRegenLevel,
    isAutopilot, setIsAutopilot,

    // Live telemetry values
    speed,
    rpm,
    gear,
    battery,
    temp,
    co2,
    carbonCredits,
    ecoScore,
    
    // Trip stats
    tripDistance,
    tripTime,
    avgSpeed,
    totalCo2Saved,
    avgCo2,
    energyConsumption,

    // HUD attributes
    tirePressures,
    gForce,
    alerts,
    walletLogs,

    // Histograms
    speedHistory,
    co2History
  };
};
