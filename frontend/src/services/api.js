const BASE = process.env.REACT_APP_BACKEND_URL
  || "https://ecotrack-carbon-credit-platform.onrender.com"

export const api = {
  getStatus: () =>
    fetch(`${BASE}/api/status`).then(r=>r.json()),

  getLatest: () =>
    fetch(`${BASE}/api/latest`).then(r=>r.json()),

  getHistory: () =>
    fetch(`${BASE}/api/history`).then(r=>r.json()),

  getTrips: (uid, limit=20) =>
    fetch(`${BASE}/api/trips/${uid}?limit=${limit}`)
      .then(r=>r.json()),

  registerSession: (userId) =>
    fetch(`${BASE}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).then(r=>r.json()),

  // Graph endpoints using stored Firebase data
  getEmissionGraph: (days=30) =>
    fetch(`${BASE}/api/graph/emissions?days=${days}`)
      .then(r=>r.json()),

  getTodayGraph: () =>
    fetch(`${BASE}/api/graph/today`).then(r=>r.json()),

  getWeeklyGraph: () =>
    fetch(`${BASE}/api/graph/weekly`).then(r=>r.json()),

  // Admin
  getAdminUsers: () =>
    fetch(`${BASE}/api/admin/users`).then(r=>r.json()),

  getAdminSummary: (days=7) =>
    fetch(`${BASE}/api/admin/summary?days=${days}`)
      .then(r=>r.json()),

  getAdminEmissionGraph: (days=30) =>
    fetch(`${BASE}/api/admin/emission-graph?days=${days}`)
      .then(r=>r.json()),
};
