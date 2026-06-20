import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, date, timedelta
import os
import json

class FirebaseClient:
  def __init__(self):
    self.use_mock = True
    self.db = None
    key_path = os.getenv('FIREBASE_KEY', 'backend/serviceAccountKey.json')
    if key_path and os.path.exists(key_path):
      try:
        cred = credentials.Certificate(key_path)
        if not firebase_admin._apps:
          firebase_admin.initialize_app(cred)
        self.db = firestore.client()
        self.use_mock = False
        print("[Firebase SDK] Initialized Firebase Admin SDK successfully.")
      except Exception as e:
        print(f"[Firebase SDK] Error initializing SDK, using mock fallback: {e}")
    else:
      print(f"[Firebase SDK] Firebase key not found at {key_path}, using mock fallback.")
      
    self.mock_db_file = os.path.join(os.path.dirname(__file__), "mock_db.json")
    if self.use_mock:
      self._init_mock_db()

  def _init_mock_db(self):
    if not os.path.exists(self.mock_db_file) or os.path.getsize(self.mock_db_file) == 0:
      data = {
        "users": {
          "global": {
            "name": "Global Driver",
            "email": "driver@ecotrack.com",
            "role": "driver",
            "trips": {},
            "eco_score_avg": 85.0,
            "lifetime_co2_g": 12540.0,
            "lifetime_trips": 12,
            "lifetime_distance_km": 145.0,
            "tax_status": "eligible",
            "rank": "Gold"
          }
        },
        "telemetry": {},
        "daily_summaries": {},
        "emission_graph": {}
      }
      try:
        with open(self.mock_db_file, "w") as f:
          json.dump(data, f, indent=2)
      except Exception as e:
        print(f"[Mock DB] Error: {e}")

  def _load_mock_db(self):
    try:
      with open(self.mock_db_file, "r") as f:
        data = json.load(f)
        if not isinstance(data, dict):
          data = {}
        for key in ["users", "telemetry", "daily_summaries", "emission_graph"]:
          if key not in data:
            data[key] = {}
        return data
    except Exception:
      return {"users": {}, "telemetry": {}, "daily_summaries": {}, "emission_graph": {}}

  def _save_mock_db(self, data):
    try:
      with open(self.mock_db_file, "w") as f:
        json.dump(data, f, indent=2)
    except Exception as e:
      print(f"[Mock DB] Save error: {e}")

  def save_telemetry(self, data, user_id='global'):
    try:
      today = date.today().isoformat()
      if not self.use_mock and self.db:
        try:
          # Save raw telemetry point
          self.db.collection('telemetry')\
            .document(today)\
            .collection('points').add({
              **data,
              'user_id':   user_id,
              'saved_at':  datetime.utcnow().isoformat()
            })

          # Update daily emission graph aggregation
          self._update_emission_graph(data, today)
        except Exception as e:
          print(f"[Firebase Client] Error saving telemetry: {e}")
      else:
        try:
          db_data = self._load_mock_db()
          if today not in db_data["telemetry"]:
            db_data["telemetry"][today] = []
          db_data["telemetry"][today].append({**data, 'user_id': user_id, 'saved_at': datetime.utcnow().isoformat()})
          db_data["telemetry"][today] = db_data["telemetry"][today][-100:]

          # Update mock emission graph
          if "emission_graph" not in db_data:
            db_data["emission_graph"] = {}
          
          existing = db_data["emission_graph"].get(today, {
            'date': today,
            'total_co2_g': 0.0,
            'point_count': 0,
            'avg_co2_per_trip': 0.0
          })
          
          co2_val = float(data.get('co2_g_s', data.get('co2', 0.0)))
          new_total = existing.get('total_co2_g', 0.0) + (co2_val * 7.5)
          new_count = existing.get('point_count', 0) + 1
          existing['total_co2_g'] = round(new_total, 2)
          existing['point_count'] = new_count
          existing['avg_co2_per_trip'] = round(new_total / new_count, 4)
          existing['updated_at'] = datetime.utcnow().isoformat()
          db_data["emission_graph"][today] = existing

          self._save_mock_db(db_data)
        except Exception as e:
          print(f"[Mock DB] Error in save_telemetry: {e}")
    except Exception as outer_err:
      print(f"[Firebase Client] Outer error in save_telemetry: {outer_err}")

  def _update_emission_graph(self, data, today):
    try:
      graph_ref = self.db.collection('emission_graph').document(today)
      graph_doc = graph_ref.get()

      co2_val = float(data.get('co2_g_s', data.get('co2', 0.0)))
      co2_this_point = co2_val * 7.5

      if graph_doc.exists:
        existing = graph_doc.to_dict()
        new_total  = float(existing.get('total_co2_g', 0.0)) + co2_this_point
        new_count  = int(existing.get('point_count', 0)) + 1
        new_avg    = new_total / new_count
        graph_ref.update({
          'total_co2_g':       round(new_total, 2),
          'point_count':       new_count,
          'avg_co2_per_trip':  round(new_avg, 4),
          'updated_at':        datetime.utcnow().isoformat()
        })
      else:
        graph_ref.set({
          'date':              today,
          'total_co2_g':       round(co2_this_point, 2),
          'point_count':       1,
          'avg_co2_per_trip':  round(co2_val, 4),
          'created_at':        datetime.utcnow().isoformat(),
          'updated_at':        datetime.utcnow().isoformat()
        })
    except Exception as e:
      print(f"[Firebase Client] emission_graph update failed: {e}")

  def save_trip(self, trip, user_id='global'):
    today = date.today().isoformat()
    if not self.use_mock and self.db:
      try:
        # Save trip
        self.db.collection('users')\
          .document(user_id)\
          .collection('trips').add({
            **trip,
            'user_id': user_id
          })

        # Update user stats
        user_ref = self.db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
          u = user_doc.to_dict()
          prev_trips = u.get('lifetime_trips', 0)
          prev_co2   = u.get('lifetime_co2_g', 0.0)
          prev_dist  = u.get('lifetime_distance_km', 0.0)
          prev_score = u.get('eco_score_avg', 0.0)
          new_score  = ((prev_score * prev_trips) + trip['eco_score']) / (prev_trips + 1)
          user_ref.update({
            'lifetime_trips':       prev_trips + 1,
            'lifetime_co2_g':       round(prev_co2 + trip['total_co2_g'], 2),
            'lifetime_distance_km': round(prev_dist + trip['distance_km'], 2),
            'eco_score_avg':        round(new_score, 1),
            'tax_status':           trip['tax_status'],
            'rank':                 trip['rank'],
            'updated_at':           datetime.utcnow().isoformat()
          })

        # Update summary
        summary_ref = self.db.collection('daily_summaries').document(today)
        summary_doc = summary_ref.get()
        if summary_doc.exists:
          s = summary_doc.to_dict()
          new_trips = s.get('total_trips', 0) + 1
          new_co2   = s.get('total_co2_g', 0) + trip['total_co2_g']
          new_dist  = s.get('total_distance_km', 0) + trip['distance_km']
          new_harsh = s.get('harsh_event_count', 0) + trip['harsh_count']
          prev_score_sum = s.get('avg_eco_score', 0) * s.get('total_trips', 1)
          summary_ref.update({
            'total_trips':        new_trips,
            'total_co2_g':        round(new_co2, 2),
            'total_distance_km':  round(new_dist, 2),
            'harsh_event_count':  new_harsh,
            'avg_eco_score':      round((prev_score_sum + trip['eco_score']) / new_trips, 1),
            'updated_at':         datetime.utcnow().isoformat()
          })
        else:
          summary_ref.set({
            'date':               today,
            'total_trips':        1,
            'total_co2_g':        round(trip['total_co2_g'], 2),
            'total_distance_km':  round(trip['distance_km'], 2),
            'harsh_event_count':  trip['harsh_count'],
            'avg_eco_score':      trip['eco_score'],
            'active_users':       1,
            'created_at':         datetime.utcnow().isoformat(),
            'updated_at':         datetime.utcnow().isoformat()
          })
      except Exception as e:
        print(f"[Firebase Client] Error saving trip: {e}")
    else:
      db_data = self._load_mock_db()
      if user_id not in db_data["users"]:
        db_data["users"][user_id] = {
          "name": "Global Driver",
          "email": "driver@ecotrack.com",
          "role": "driver",
          "trips": {},
          "eco_score_avg": 80.0,
          "lifetime_co2_g": 0.0,
          "lifetime_trips": 0,
          "lifetime_distance_km": 0.0,
          "tax_status": "ineligible",
          "rank": "Bronze"
        }
      if "trips" not in db_data["users"][user_id]:
        db_data["users"][user_id]["trips"] = {}
      
      trip_id = trip.get("trip_id", "T-default")
      db_data["users"][user_id]["trips"][trip_id] = trip

      # Update user stats mock
      u = db_data["users"][user_id]
      prev_trips = u.get('lifetime_trips', 0)
      prev_co2   = u.get('lifetime_co2_g', 0.0)
      prev_dist  = u.get('lifetime_distance_km', 0.0)
      prev_score = u.get('eco_score_avg', 80.0)
      new_score  = ((prev_score * prev_trips) + trip['eco_score']) / (prev_trips + 1)
      u['lifetime_trips'] = prev_trips + 1
      u['lifetime_co2_g'] = round(prev_co2 + trip['total_co2_g'], 2)
      u['lifetime_distance_km'] = round(prev_dist + trip['distance_km'], 2)
      u['eco_score_avg'] = round(new_score, 1)
      u['tax_status'] = trip['tax_status']
      u['rank'] = trip['rank']

      # Update daily summary mock
      if "daily_summaries" not in db_data:
        db_data["daily_summaries"] = {}
      
      s = db_data["daily_summaries"].get(today, {
        'date': today,
        'total_trips': 0,
        'total_co2_g': 0.0,
        'total_distance_km': 0.0,
        'harsh_event_count': 0,
        'avg_eco_score': 0.0,
        'active_users': 1
      })
      new_trips = s.get('total_trips', 0) + 1
      s['total_trips'] = new_trips
      s['total_co2_g'] = round(s['total_co2_g'] + trip['total_co2_g'], 2)
      s['total_distance_km'] = round(s['total_distance_km'] + trip['distance_km'], 2)
      s['harsh_event_count'] = s['harsh_event_count'] + trip['harsh_count']
      s['avg_eco_score'] = round((s['avg_eco_score'] * (new_trips - 1) + trip['eco_score']) / new_trips, 1)
      s['updated_at'] = datetime.utcnow().isoformat()
      db_data["daily_summaries"][today] = s

      self._save_mock_db(db_data)

  def get_emission_graph_data(self, days=30):
    if not self.use_mock and self.db:
      try:
        graph_data = []
        for i in range(days - 1, -1, -1):
          d = (date.today() - timedelta(days=i)).isoformat()
          doc = self.db.collection('emission_graph').document(d).get()
          if doc.exists:
            graph_data.append(doc.to_dict())
          else:
            graph_data.append({
              'date':             d,
              'total_co2_g':      0,
              'avg_co2_per_trip': 0,
              'point_count':      0
            })
        return graph_data
      except Exception as e:
        print(f"[Firebase Client] Error getting emission graph: {e}")
        return []
    else:
      db_data = self._load_mock_db()
      graph_data = []
      for i in range(days - 1, -1, -1):
        d = (date.today() - timedelta(days=i)).isoformat()
        if d in db_data.get("emission_graph", {}):
          graph_data.append(db_data["emission_graph"][d])
        else:
          graph_data.append({
            'date':             d,
            'total_co2_g':      0,
            'avg_co2_per_trip': 0,
            'point_count':      0
          })
      return graph_data

  def get_today_telemetry(self, limit=100):
    today = date.today().isoformat()
    if not self.use_mock and self.db:
      try:
        docs = self.db.collection('telemetry')\
          .document(today)\
          .collection('points')\
          .order_by('timestamp')\
          .limit(limit).get()
        return [d.to_dict() for d in docs]
      except Exception as e:
        print(f"[Firebase Client] Error getting today telemetry: {e}")
        return []
    else:
      db_data = self._load_mock_db()
      return db_data.get("telemetry", {}).get(today, [])[:limit]

  def get_trips(self, user_id='global', limit=20):
    if not self.use_mock and self.db:
      try:
        docs = self.db.collection('users')\
          .document(user_id)\
          .collection('trips')\
          .order_by('created_at', direction=firestore.Query.DESCENDING)\
          .limit(limit).get()
        return [{'id': d.id, **d.to_dict()} for d in docs]
      except Exception as e:
        print(f"[Firebase Client] Error getting trips: {e}")
        return []
    else:
      db_data = self._load_mock_db()
      user = db_data["users"].get(user_id, {})
      trips_dict = user.get("trips", {})
      trips_list = [{'id': k, **v} for k, v in trips_dict.items()]
      trips_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
      return trips_list[:limit]

  def get_daily_summaries(self, days=7):
    if not self.use_mock and self.db:
      try:
        summaries = []
        for i in range(days - 1, -1, -1):
          d = (date.today() - timedelta(days=i)).isoformat()
          doc = self.db.collection('daily_summaries').document(d).get()
          if doc.exists:
            summaries.append(doc.to_dict())
          else:
            summaries.append({
              'date': d, 'total_co2_g': 0,
              'avg_eco_score': 0, 'total_trips': 0
            })
        return summaries
      except Exception as e:
        print(f"[Firebase Client] Error getting summaries: {e}")
        return []
    else:
      db_data = self._load_mock_db()
      summaries = []
      for i in range(days - 1, -1, -1):
        d = (date.today() - timedelta(days=i)).isoformat()
        if d in db_data.get("daily_summaries", {}):
          summaries.append(db_data["daily_summaries"][d])
        else:
          summaries.append({
            'date': d, 'total_co2_g': 0,
            'avg_eco_score': 0, 'total_trips': 0
          })
      return summaries

  def get_all_users(self):
    if not self.use_mock and self.db:
      try:
        docs = self.db.collection('users').get()
        return [{'id': d.id, **d.to_dict()} for d in docs]
      except Exception as e:
        print(f"[Firebase Client] Error getting all users: {e}")
        return []
    else:
      db_data = self._load_mock_db()
      users = db_data.get("users", {})
      return [{'id': k, **v} for k, v in users.items()]

  def update_user_stats(self, user_id, stats):
    if not self.use_mock and self.db:
      try:
        self.db.collection('users')\
          .document(user_id)\
          .set(stats, merge=True)
      except Exception as e:
        print(f"[Firebase Client] Error updating stats: {e}")
    else:
      db_data = self._load_mock_db()
      if user_id not in db_data["users"]:
        db_data["users"][user_id] = {}
      db_data["users"][user_id].update(stats)
      self._save_mock_db(db_data)
