/**
 * Safely convert any value to a string.
 * Returns fallback if value is null/undefined/object.
 */
export const safeString = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  // Object, array, boolean, etc → use fallback
  return fallback
}

/**
 * Generate avatar initials from a name string.
 * Always returns 1–2 uppercase characters.
 * Never throws regardless of input.
 *
 * Examples:
 *   "Salvin Kumar" → "SK"
 *   "Salvin"       → "SA"
 *   ""             → "U"
 *   null           → "U"
 *   undefined      → "U"
 *   123            → "U"
 *   {}             → "U"
 */
export const getInitials = (value, fallback = "U") => {
  // Convert to safe string first
  const name = safeString(value, "")
  if (!name.trim()) return fallback

  const parts = name.trim().split(/\s+/)

  if (parts.length >= 2) {
    // "Salvin Kumar" → "SK"
    return (
      (parts[0]?.[0] ?? "") +
      (parts[1]?.[0] ?? "")
    ).toUpperCase() || fallback
  }

  if (parts[0].length >= 2) {
    // "Salvin" → "SA"
    return parts[0].substring(0, 2).toUpperCase()
  }

  if (parts[0].length === 1) {
    // "S" → "S"
    return parts[0].toUpperCase()
  }

  return fallback
}

/**
 * Safely get display name.
 * Falls back through: name → email prefix → "User"
 */
export const getDisplayName = (profile, user, fallback = "User") => {
  // Try profile.name first
  const profileName = safeString(profile?.name, "")
  if (profileName.trim()) return profileName.trim()

  // Try Firebase user.displayName
  const displayName = safeString(user?.displayName, "")
  if (displayName.trim()) return displayName.trim()

  // Try email prefix (part before @)
  const email = safeString(user?.email || profile?.email, "")
  if (email.includes("@")) {
    return email.split("@")[0]
  }

  return fallback
}

/**
 * Safely get user role label.
 */
export const getRoleLabel = (profile) => {
  const role = safeString(profile?.role, "")
  const map = {
    "driver":     "Driver Account",
    "admin":      "Admin Account",
    "government": "Government Panel",
  }
  return map[role.toLowerCase()] || "Driver Account"
}

/**
 * Safely get user email.
 */
export const getEmail = (profile, user) => {
  return safeString(profile?.email || user?.email, "—")
}
