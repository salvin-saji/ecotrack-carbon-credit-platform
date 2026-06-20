import serial
import serial.tools.list_ports
import threading
import time
import json
from datetime import datetime

def calculate_driving_status(engine, speed, co2, throttle_delta):
  """
  Returns clean status string based on actual telemetry.
  Called after every complete data point is assembled.
  """

  # Engine is OFF — no driving status needed
  if not engine:
    return "ENGINE_OFF"

  # Engine is ON but vehicle is stationary — Engine Idle status
  if speed == 0:
    return "ENGINE_IDLE"

  # Aggressive acceleration (check first — highest priority)
  if throttle_delta > 0.6:
    return "AGGRESSIVE_ACCELERATION"

  # High CO2 emission
  if co2 > 1.2:
    return "HIGH_EMISSION"

  # High speed
  if speed > 90:
    return "HIGH_SPEED"

  # Normal driving range
  if 40 <= speed <= 90 and co2 <= 1.0:
    return "NORMAL_DRIVING"

  # Eco driving — slow + low emission
  if speed < 40 and co2 <= 0.6:
    return "ECO_DRIVING"

  # Smooth driving — moderate speed + low emission
  if speed < 40 and co2 <= 1.0:
    return "SMOOTH_DRIVING"

  # Default fallback
  return "NORMAL_DRIVING"


class SerialManager:

  def __init__(self, socketio, firebase=None):
    # Store the socketio instance passed from app.py
    self.socketio      = socketio
    self.firebase      = firebase
    self.ser           = None
    self.port          = None
    self.connected     = False
    self.latest_data   = {}
    self.history       = []
    self.partial       = {}
    self.harsh_count   = 0
    self.session_co2   = 0.0
    self.was_engine_on = False
    self.active_user_id = 'global'
    self.prev_speed    = 0.0

  def start(self):
    self.socketio.start_background_task(target=self._scan_loop)
    print("[SERIAL] Auto-detect background task started")

  def _scan_loop(self):
    print("[SERIAL] Scanning for ESP32...")
    while not self.connected:
      ports = serial.tools.list_ports.comports()
      for p in ports:
        try:
          s = serial.Serial(p.device, 115200, timeout=0.1)
          time.sleep(0.5)  # wait for port to stabilize
          line = s.readline().decode("utf-8", errors="ignore").strip()
          print(f"[SERIAL] Testing port {p.device}: {line[:50]}")

          if "Speed" in line or "Credits" in line or "Engine" in line:
            self.ser       = s
            self.port      = p.device
            self.connected = True
            print(f"[SERIAL] ✅ ESP32 found on {self.port}")

            # Emit connection status
            self.socketio.emit("esp32_status", {
              "connected": True,
              "port":      self.port
            })

            self._read_loop()
            return
          else:
            s.close()

        except Exception as e:
          print(f"[SERIAL] Port {p.device} failed: {e}")

      print("[SERIAL] No ESP32 found, retrying in 3s...")
      time.sleep(3)

  def _read_loop(self):
    print(f"[SERIAL] Starting read loop on {self.port}")
    while self.connected:
      try:
        # Yield control to allow eventlet to process other tasks / connections
        self.socketio.sleep(0.01)

        if not self.ser:
          break

        raw = self.ser.readline()\
                .decode("utf-8", errors="ignore").strip()

        if not raw:
          continue

        print(f"[RAW SERIAL]: {raw}")

        # Parse all key-value pairs from raw line
        parts = {}
        for item in raw.split(","):
          item = item.strip()
          if ":" in item:
            k, v = item.split(":", 1)
            parts[k.strip().lower()] = v.strip()

        # Update partial data with parsed keys
        if "credits" in parts:
          try:
            self.partial["credits"] = max(0.0, float(parts["credits"]))
            print(f"[PARSE] Credits: {self.partial['credits']}")
          except Exception as e:
            print(f"[PARSE ERROR] Credits: {e}")
        if "engine" in parts:
          self.partial["engine_raw"] = parts["engine"].strip()
          # Explicit conversion — never rely on Python truthiness
          raw_engine = self.partial["engine_raw"]
          engine_int = 1 if raw_engine == "1" else 0
          engine_on = engine_int == 1
          print(f"[PARSE] Engine raw='{raw_engine}' → int={engine_int} bool={engine_on}")
        if "speed" in parts:
          try:
            self.partial["speed"] = float(parts["speed"])
          except Exception:
            pass
        if "throttledelta" in parts:
          try:
            self.partial["throttle_delta"] = float(parts["throttledelta"])
          except Exception:
            pass
        if "co2_g_s" in parts:
          try:
            self.partial["co2_g_s"] = float(parts["co2_g_s"])
          except Exception:
            pass
        if "status" in parts:
          self.partial["status"] = parts["status"].strip()

        # ── ASSEMBLE + EMIT when both formats received ──
        required = ["credits","engine_raw","speed",
                    "throttle_delta","co2_g_s","status"]

        if all(k in self.partial for k in required):
          self._assemble_and_emit()

      except serial.SerialException as e:
        print(f"[SERIAL] ❌ Serial error: {e}")
        self._handle_disconnect()
        return

      except Exception as e:
        print(f"[SERIAL] ❌ Read error: {e}")
        time.sleep(0.1)

  def _assemble_and_emit(self):
    try:
      p = self.partial.copy()
      self.partial = {}

      # ── ENGINE ── explicit parse
      raw_engine   = str(p.get("engine_raw", "0")).strip()
      engine_int   = 1 if raw_engine == "1" else 0
      engine_bool  = engine_int == 1

      speed         = float(p.get("speed", 0))
      throttle_delta= float(p.get("throttle_delta", 0))
      co2           = float(p.get("co2_g_s", 0))
      credits       = float(p.get("credits", 0))
      esp32_status  = str(p.get("status", "")).strip()

      print(f"[ASSEMBLE] engine={engine_int} speed={speed} "
            f"co2={co2} throttle={throttle_delta}")

      # ── DRIVING STATUS ──
      driving_status = calculate_driving_status(
        engine_bool, speed, co2, throttle_delta
      )

      # ── HARSH EVENTS (only when engine ON) ──
      if engine_bool:
        if throttle_delta > 0.6:
          self.harsh_count += 1
        if speed > 100:
          self.harsh_count += 1
      # Reset harsh count when engine off
      if not engine_bool:
        self.harsh_count = 0

      # ── ECO SCORE (only meaningful when engine ON) ──
      if engine_bool and self.history:
        avg_co2 = sum(
          h["co2"] for h in self.history[-10:]
        ) / len(self.history[-10:])
      else:
        avg_co2 = co2

      if engine_bool:
        eco_score = max(0, min(100,
          round(100
            - (self.harsh_count * 3)
            - (avg_co2 * 15))
        ))
      else:
        eco_score = 0   # no score when engine off

      # ── IMPACT SCORE ──
      impact_score = max(0, min(100,
        round(100 - (co2 * 30) - (self.harsh_count * 2))
      )) if engine_bool else 0

      # ── SESSION CO2 (only accumulate when engine ON) ──
      if engine_bool:
        self.session_co2 += co2 * 1.5

      # ── TAX STATUS ──
      if eco_score >= 80:
        tax_status = "eligible"
        rank = "Gold"
      elif eco_score >= 60:
        tax_status = "partial"
        rank = "Silver"
      else:
        tax_status = "ineligible"
        rank = "Bronze"

      # ── AI SUGGESTION (context-aware) ──
      if not engine_bool:
        suggestion = "Engine is off. Ready to drive."
      elif driving_status == "AGGRESSIVE_ACCELERATION":
        suggestion = "Ease off throttle — smooth acceleration saves up to 15% fuel."
      elif driving_status == "HIGH_EMISSION":
        suggestion = "High CO₂ detected — reduce speed to lower emissions."
      elif driving_status == "HIGH_SPEED":
        suggestion = "Driving below 80 km/h improves fuel efficiency by 20%."
      elif driving_status == "ECO_DRIVING":
        suggestion = "Excellent eco driving! Maintain this for tax benefits."
      elif driving_status == "SMOOTH_DRIVING":
        suggestion = "Great smooth driving. Slightly lower speed earns eco status."
      else:
        suggestion = "Good driving. Maintain steady throttle for better eco score."

      # ── CLEAN PAYLOAD ──
      payload = {
        # ESP32 raw values
        "engine":        engine_int,       # 1 or 0 (integer)
        "engineBool":    engine_bool,      # True or False
        "speed":         speed,
        "throttleDelta": throttle_delta,
        "co2":           co2,
        "credits":       credits,
        "esp32Status":   esp32_status,     # raw ESP32 status

        # Calculated
        "drivingStatus": driving_status,   # our clean status
        "rpm":           round(speed * 36) if engine_bool else 0,
        "ecoScore":      eco_score,
        "impactScore":   impact_score,
        "harshCount":    self.harsh_count,
        "sessionCO2":    round(self.session_co2, 2),
        "taxStatus":     tax_status,
        "rank":          rank,
        "suggestion":    suggestion,
        "timestamp":     datetime.utcnow().isoformat() + "Z"
      }

      # Update prev speed for next cycle
      self.prev_speed = speed

      # ── STORE ──
      self.latest_data = payload
      self.history.append(payload)
      if len(self.history) > 100:
        self.history.pop(0)

      # ── EMIT ──
      print(f"[SOCKET EMIT] Event='telemetry' keys={list(payload.keys())}")
      print(f"[SOCKET EMIT] engine={payload['engine']} "
            f"speed={payload['speed']} "
            f"co2={payload['co2']} "
            f"status={payload['drivingStatus']}")

      self.socketio.emit("telemetry", payload)

      try:
        print(f"[SOCKET EMIT] Done. Rooms: {list(self.socketio.server.manager.rooms.get('/', {}).keys())[:5]}")
      except Exception:
        pass

      # Save to Firebase every 5 points
      if self.firebase and len(self.history) % 5 == 0:
        try:
          fb_data = {
            "engine":             payload["engine"],
            "speed":              payload["speed"],
            "throttle_delta":     payload["throttleDelta"],
            "co2_g_s":            payload["co2"],
            "status":             payload["drivingStatus"],
            "credits":            payload["credits"],
            "rpm":                payload["rpm"],
            "eco_score":          payload["ecoScore"],
            "impact_score":       payload["impactScore"],
            "harsh_count":        payload["harshCount"],
            "session_co2_total":  payload["sessionCO2"],
            "tax_status":         payload["taxStatus"],
            "rank":               payload["rank"],
            "suggestion":         payload["suggestion"],
            "timestamp":          payload["timestamp"]
          }
          self.firebase.save_telemetry(fb_data, user_id=self.active_user_id)
        except Exception as e:
          print("[FIREBASE ERROR]", e)

      # Trip end
      if not engine_bool and self.was_engine_on:
        self._save_trip_end()
      self.was_engine_on = engine_bool

    except Exception as e:
      print(f"[ASSEMBLE ERROR]: {e}")
      import traceback
      traceback.print_exc()

  def _handle_disconnect(self):
    self.connected    = False
    self.ser          = None
    self.port         = None
    self.latest_data  = {}
    self.history      = []
    self.partial      = {}
    self.session_co2  = 0.0
    self.harsh_count  = 0
    self.was_engine_on = False
    self.prev_speed    = 0.0

    print("[SERIAL] ESP32 disconnected — restarting scan")
    self.socketio.emit("esp32_status", {
      "connected": False,
      "port":      None
    })
    self.start()   # restart scan loop

  def _save_trip_end(self):
    if len(self.history) < 3:
      return
    h = self.history
    trip = {
      "trip_id":     "T-" + str(int(time.time()))[-5:],
      "distance_km": round(
        sum(p["speed"] for p in h) * 1.5 / 3600, 2),
      "total_co2_g": round(self.session_co2, 2),
      "avg_speed":   round(
        sum(p["speed"] for p in h) / len(h), 1),
      "eco_score":   h[-1]["ecoScore"],
      "harsh_count": self.harsh_count,
      "status":      "ECO" if "ECO" in h[-1]["drivingStatus"].upper()
                     else "HIGH",
      "created_at":  datetime.utcnow().isoformat()
    }
    print(f"[TRIP] Saved: {trip['trip_id']}")
    self.socketio.emit("trip_saved", trip)
    
    if self.firebase:
      try:
        # Save matching firebase database schema
        fb_trip = {
          "trip_id":      trip["trip_id"],
          "distance_km":  trip["distance_km"],
          "duration_min": round(len(h) * 1.5 / 60, 1),
          "avg_speed":    trip["avg_speed"],
          "total_co2_g":  trip["total_co2_g"],
          "eco_score":    trip["eco_score"],
          "harsh_count":  trip["harsh_count"],
          "impact_score": h[-1]["impactScore"],
          "tax_status":   h[-1]["taxStatus"],
          "rank":         h[-1]["rank"],
          "status":       trip["status"],
          "created_at":   trip["created_at"]
        }
        self.firebase.save_trip(fb_trip, user_id=self.active_user_id)
      except Exception as fe:
        print(f"[FIREBASE ERROR] Trip: {fe}")
        
    # Reset session
    self.history      = []
    self.session_co2  = 0.0
    self.harsh_count  = 0
