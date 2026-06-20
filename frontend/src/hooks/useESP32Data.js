import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const SOCKET_URL = 'http://localhost:5000';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const random = (min, max) => Math.random() * (max - min) + min;

export const useESP32Data = () => {
  const [latestData, setLatestData] = useState({
    speed: 0.0,
    credits: 85.30,
    engine: 1,
    throttle_delta: 0.0,
    co2_g_s: 0.0,
    status: 'LOW',
    timestamp: new Date().toISOString()
  });
  
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    mock_mode: true,
    port: 'MOCK',
    baud_rate: 115200
  });

  const socketRef = useRef(null);
  const latestDataRef = useRef(latestData);
  latestDataRef.current = latestData;

  useEffect(() => {
    // Initialize history with 20 dummy data points to start the chart nicely
    const initialHistory = [];
    let tempSpeed = 45;
    let tempCredits = 85.30;
    for (let i = 0; i < 20; i++) {
      tempSpeed = clamp(tempSpeed + random(-4, 4), 0, 120);
      tempCredits += random(-0.04, 0.06);
      const tempCo2 = 0.3 + (tempSpeed / 120 * 1.2) + random(-0.1, 0.1);
      initialHistory.push({
        speed: tempSpeed,
        credits: tempCredits,
        engine: 1,
        throttle_delta: parseFloat(random(-0.5, 0.5).toFixed(2)),
        co2_g_s: parseFloat(tempCo2.toFixed(3)),
        status: tempCo2 > 1.0 ? 'HIGH' : tempCo2 > 0.5 ? 'LOW' : 'ECO-DRIVE',
        timestamp: new Date(Date.now() - (20 - i) * 1500).toISOString()
      });
    }
    setHistory(initialHistory);
    setLatestData(initialHistory[initialHistory.length - 1]);
  }, []);

  useEffect(() => {
    // 1. Fetch initial statistics from backend
    const loadInitialData = async () => {
      try {
        const hist = await api.getHistory();
        if (hist && hist.length > 0) {
          setHistory(hist);
          setLatestData(hist[hist.length - 1]);
        }
        
        const status = await api.getStatus();
        if (status) {
          setServerStatus(status);
        }
      } catch (e) {
        console.log('[useESP32Data] API fetch omitted (mock mode active)');
      }
    };
    
    loadInitialData();

    // 2. Setup Socket.IO client connection
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      timeout: 3000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SocketIO] Connected to Flask telemetry stream.');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[SocketIO] Disconnected from stream.');
      setConnected(false);
    });

    socket.on('telemetry_update', (data) => {
      if (data) {
        setLatestData(data);
        setHistory((prev) => {
          const nextHist = [...prev, data];
          if (nextHist.length > 20) {
            nextHist.shift();
          }
          return nextHist;
        });
      }
    });

    // 3. Fallback / Simulation interval (every 1500ms)
    const interval = setInterval(async () => {
      let backendStatus = null;
      try {
        backendStatus = await api.getStatus();
        if (backendStatus) {
          setServerStatus(backendStatus);
        }
      } catch (err) {
        // Backend not running/reachable, keep mock status
      }

      // If we are not connected to backend websocket, simulate locally
      if (!socket.connected && (!backendStatus || !backendStatus.connected)) {
        const prev = latestDataRef.current;
        const newSpeed = clamp(prev.speed + random(-4, 4), 0, 120);
        const newCredits = prev.credits + random(-0.04, 0.06);
        const newCo2 = 0.3 + (newSpeed / 120 * 1.2) + random(-0.1, 0.1);
        const newThrottleDelta = parseFloat(random(-0.8, 0.8).toFixed(2));
        
        let newStatus = 'LOW';
        if (newCo2 > 1.0) newStatus = 'HIGH';
        else if (newCo2 < 0.5) newStatus = 'ECO-DRIVE';

        const newData = {
          speed: parseFloat(newSpeed.toFixed(1)),
          credits: parseFloat(newCredits.toFixed(2)),
          engine: 1,
          throttle_delta: newThrottleDelta,
          co2_g_s: parseFloat(newCo2.toFixed(3)),
          status: newStatus,
          timestamp: new Date().toISOString()
        };

        setLatestData(newData);
        setHistory((prevHist) => {
          const nextHist = [...prevHist, newData];
          if (nextHist.length > 20) {
            nextHist.shift();
          }
          return nextHist;
        });
      } else if (!socket.connected) {
        // Poll backend REST endpoints
        try {
          const latest = await api.getLatest();
          if (latest) {
            setLatestData(latest);
          }
          const hist = await api.getHistory();
          if (hist && hist.length > 0) {
            setHistory(hist.slice(-20));
          }
        } catch (e) {}
      }
    }, 1500);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  return {
    latestData,
    history,
    connected: connected || serverStatus.connected,
    serverStatus
  };
};
