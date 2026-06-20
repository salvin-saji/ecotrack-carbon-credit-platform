import time
import serial
import threading
import datetime
import random
import os

class ESP32SerialReader:
    def __init__(self, port="COM3", baud=115200, callback=None):
        self.port = port
        self.baud = baud
        self.callback = callback
        self.running = False
        self.thread = None
        self.serial_conn = None
        self.is_connected = False
        self.mock_mode = False
        
        # Telemetry State
        self.latest_data = {
            "speed": 0.0,
            "credits": 0.0,
            "engine": 0,
            "throttle_delta": 0.0,
            "co2_g_s": 0.0,
            "status": "LOW",
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        
    def stop(self):
        self.running = False
        self.is_connected = False
        if self.serial_conn and self.serial_conn.is_open:
            try:
                self.serial_conn.close()
            except Exception as e:
                print(f"[Serial] Error closing connection: {e}")
        if self.thread:
            self.thread.join(timeout=1)
            
    def update_config(self, port, baud):
        print(f"[Serial] Reconfiguring reader to port: {port}, baud: {baud}")
        self.stop()
        self.port = port
        self.baud = baud
        self.start()

    def _parse_value(self, line, key):
        if key in line:
            try:
                parts = line.split(key)
                if len(parts) > 1:
                    val_part = parts[1].split(",")[0].strip()
                    return val_part
            except Exception:
                pass
        return None

    def _run(self):
        print(f"[Serial] Checking serial connection on port {self.port}...")
        
        # Check if port is specified as MOCK
        if self.port.upper() == "MOCK":
            self.mock_mode = True
            self.is_connected = True
            print("[Serial] Port is configured as MOCK. Initializing simulated serial inputs.")
            self._run_mock_loop()
            return

        try:
            self.serial_conn = serial.Serial(self.port, self.baud, timeout=1)
            self.is_connected = True
            self.mock_mode = False
            print(f"[Serial] Connected to ESP32 on port {self.port} at {self.baud} baud.")
        except Exception as e:
            print(f"[Serial] Failed to connect to physical port {self.port}: {e}")
            print("[Serial] Entering mock simulation fallback mode.")
            self.mock_mode = True
            self.is_connected = True # Set to True for visual indicator as 'Simulated'
            self._run_mock_loop()
            return

        # Physical serial loop
        buffer = ""
        while self.running:
            try:
                if self.serial_conn.in_waiting > 0:
                    data = self.serial_conn.read(self.serial_conn.in_waiting).decode('utf-8', errors='ignore')
                    buffer += data
                    
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if line:
                            self._parse_and_dispatch(line)
                time.sleep(0.05)
            except Exception as e:
                print(f"[Serial] Connection error during read: {e}. Switching to mock fallback.")
                self.is_connected = False
                break
                
        # If we broke out of loop due to error and still running, go to mock
        if self.running:
            self.mock_mode = True
            self.is_connected = True
            self._run_mock_loop()

    def _parse_and_dispatch(self, line):
        # Raw console trace log
        # print(f"[ESP32 RAW]: {line}")
        
        updated = False
        
        # Check Line Type 1: SPEED,Credits:85.30
        credits_val = self._parse_value(line, "Credits:")
        if credits_val is not None:
            try:
                self.latest_data["credits"] = round(float(credits_val), 2)
                updated = True
            except ValueError:
                pass
                
        # Check Line Type 2: Engine:1,Speed:120.0,ThrottleDelta:0.0,CO2_g_s:1.382,Status:HIGH
        speed_val = self._parse_value(line, "Speed:")
        if speed_val is not None:
            try:
                self.latest_data["speed"] = round(float(speed_val), 1)
                updated = True
            except ValueError:
                pass
                
        engine_val = self._parse_value(line, "Engine:")
        if engine_val is not None:
            try:
                self.latest_data["engine"] = int(engine_val)
                updated = True
            except ValueError:
                pass
                
        throttle_val = self._parse_value(line, "ThrottleDelta:")
        if throttle_val is not None:
            try:
                self.latest_data["throttle_delta"] = round(float(throttle_val), 2)
                updated = True
            except ValueError:
                pass
                
        co2_val = self._parse_value(line, "CO2_g_s:")
        if co2_val is not None:
            try:
                self.latest_data["co2_g_s"] = round(float(co2_val), 3)
                updated = True
            except ValueError:
                pass
                
        status_val = self._parse_value(line, "Status:")
        if status_val is not None:
            self.latest_data["status"] = status_val.strip()
            updated = True
            
        if updated:
            self.latest_data["timestamp"] = datetime.datetime.now().isoformat()
            if self.callback:
                self.callback(self.latest_data.copy())

    def _run_mock_loop(self):
        # Local mock physics parameters
        mock_speed = 50.0
        mock_credits = 85.30
        mock_engine = 1
        
        while self.running:
            # Every 1 second, simulate sending both types of lines
            time.sleep(1.0)
            
            if not self.running:
                break
                
            # Engine on/off fluctuation
            if random.random() < 0.02:
                mock_engine = 1 if mock_engine == 0 else 0
                
            if mock_engine == 1:
                # Dynamic speed changes (acceleration/deceleration)
                throttle_delta = round(random.uniform(-0.8, 1.2), 2)
                if random.random() < 0.15: # occasional harsh speed changes
                    throttle_delta = round(random.choice([-1.5, 2.0]), 2)
                
                # Speed updates
                mock_speed += throttle_delta * 4.5
                if mock_speed < 0: mock_speed = 0.0
                if mock_speed > 120: mock_speed = 120.0 # clamp to spec max
                
                # Credits increase/decrease: 
                # ECO mode adds credits, AGGRESSIVE mode deducts credits
                if mock_speed < 60:
                    status = "ECO-DRIVE"
                    credit_diff = 0.12
                elif mock_speed <= 90:
                    status = "LOW"
                    credit_diff = 0.04
                else:
                    status = "HIGH"
                    credit_diff = -0.25 # heavy penalty
                
                mock_credits += credit_diff
                if mock_credits < 0: mock_credits = 0.0
                
                # CO2 grams per second calculation
                # CO2 output is proportional to speed and throttle changes
                co2 = (mock_speed / 120.0) * 1.2 + max(0, throttle_delta) * 0.4 + 0.1
                co2 = round(max(0.05, co2), 3)
            else:
                mock_speed = 0.0
                throttle_delta = 0.0
                co2 = 0.0
                status = "LOW"
                credit_diff = 0.0
                
            mock_credits = round(mock_credits, 2)
            mock_speed = round(mock_speed, 1)
            
            # Send Line Type 1: SPEED,Credits:XX.XX
            line1 = f"SPEED,Credits:{mock_credits:.2f}"
            self._parse_and_dispatch(line1)
            
            # Tiny offset sleep to simulate serial packets arrival delay
            time.sleep(0.1)
            
            # Send Line Type 2: Engine:X,Speed:X,ThrottleDelta:X,CO2_g_s:X,Status:X
            line2 = f"Engine:{mock_engine},Speed:{mock_speed:.1f},ThrottleDelta:{throttle_delta:.2f},CO2_g_s:{co2:.3f},Status:{status}"
            self._parse_and_dispatch(line2)
