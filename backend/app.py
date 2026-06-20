import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from serial_manager import SerialManager
from firebase_client import FirebaseClient
import os

app = Flask(__name__)
app.debug = True
app.config["SECRET_KEY"] = "ecotrack_secret_2024"

CORS(app, resources={
  r"/*": {
    "origins": "*",
    "allow_headers": ["Content-Type"],
    "methods": ["GET","POST","OPTIONS"]
  }
})

# ── CRITICAL: async_mode MUST match your server ──
socketio = SocketIO(
  app,
  cors_allowed_origins="*",
  async_mode="eventlet",
  logger=False,
  engineio_logger=False,
  ping_timeout=60,
  ping_interval=25,
  max_http_buffer_size=1e6,
)

firebase = FirebaseClient()
# Pass socketio and firebase INTO serial_manager
serial = SerialManager(socketio, firebase)

if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
    print("[SERVER] Starting serial manager in main Werkzeug process")
    serial.start()
else:
    print("[SERVER] Delaying serial manager start for reloader process")

@socketio.on("connect")
def on_connect():
  print(f"[SOCKET] ✅ Client connected: {request.sid}")
  # Send current status immediately on connect
  emit("esp32_status", {
    "connected": serial.connected,
    "port":      serial.port
  })
  # Send last known data immediately if available
  if serial.latest_data:
    print(f"[SOCKET] Sending cached telemetry to new client")
    emit("telemetry", serial.latest_data)

@socketio.on("disconnect")
def on_disconnect():
  print(f"[SOCKET] ❌ Client disconnected: {request.sid}")

@socketio.on("ping_status")
def on_ping():
  emit("esp32_status", {
    "connected": serial.connected,
    "port":      serial.port
  })

@app.route("/api/status")
def status():
  return jsonify({
    "esp32_connected": serial.connected,
    "port":            serial.port
  })

@app.route("/api/latest")
def latest():
  if not serial.latest_data:
    return jsonify({"connected": False})
  return jsonify(serial.latest_data)

@app.route('/api/history')
def live_history():
  return jsonify(serial.history)

# ── GRAPH DATA ─────────────────

@app.route('/api/graph/emissions')
def emission_graph():
  days = int(request.args.get('days', 30))
  data = firebase.get_emission_graph_data(days)
  return jsonify(data)

@app.route('/api/graph/today')
def today_graph():
  limit = int(request.args.get('limit', 100))
  data  = firebase.get_today_telemetry(limit)
  return jsonify(data)

@app.route('/api/graph/weekly')
def weekly_graph():
  data = firebase.get_daily_summaries(7)
  return jsonify(data)

# ── TRIPS ──────────────────────────────────────────────────

@app.route('/api/trips/<user_id>')
def trips(user_id):
  limit = int(request.args.get('limit', 20))
  return jsonify(firebase.get_trips(user_id, limit))

# ── ADMIN ──────────────────────────────────────────────────

@app.route('/api/admin/users')
def admin_users():
  return jsonify(firebase.get_all_users())

@app.route('/api/admin/summary')
def admin_summary():
  days = int(request.args.get('days', 7))
  return jsonify(firebase.get_daily_summaries(days))

@app.route('/api/admin/emission-graph')
def admin_emission_graph():
  days = int(request.args.get('days', 30))
  return jsonify(firebase.get_emission_graph_data(days))

@app.route('/api/session', methods=['POST'])
def register_session():
  data = request.json or {}
  uid = data.get("user_id")
  if uid:
    serial.active_user_id = uid
  return jsonify({"status": "success", "active_user_id": serial.active_user_id})

if __name__ == "__main__":
  print("[SERVER] Starting EcoTrack backend...")
  socketio.run(
    app,
    host="0.0.0.0",
    port=int(os.getenv('FLASK_PORT', 5000)),
    debug=True
  )
