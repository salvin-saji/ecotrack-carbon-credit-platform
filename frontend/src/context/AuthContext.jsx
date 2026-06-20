import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, firebaseService } from "../services/firebase"

const AuthContext = createContext({
  user:    null,
  profile: null,
  loading: true,
  login:   async () => {},
  register:async () => {},
  logout:  async () => {},
  forgotPassword: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (firebaseService.isMock) {
      const checkMockUser = () => {
        const email = localStorage.getItem('eco_drive_current_user');
        if (email) {
          setUser({ uid: email, email });
          firebaseService.getProfile(email)
            .then(p => {
              setProfile({
                name:  String(p?.name || ""),
                email: String(p?.email || email || ""),
                role:  String(p?.role || "driver"),
                ...p
              });
              setLoading(false);
            })
            .catch(() => {
              setProfile({
                name:  "",
                email: String(email || ""),
                role:  "driver",
              });
              setLoading(false);
            });
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      };
      checkMockUser();
      // Poll to detect mock auth changes instantly
      const interval = setInterval(checkMockUser, 1000);
      return () => clearInterval(interval);
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u)
          try {
            const p = await firebaseService.getProfile(u.uid);
            setProfile({
              name:  String(p?.name || ""),
              email: String(p?.email || u.email || ""),
              role:  String(p?.role || "driver"),
              ...p
            });
          } catch (e) {
            setProfile({
              name:  "",
              email: String(u.email || ""),
              role:  "driver",
            });
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error("[Auth] onAuthStateChanged error:", err)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const login = async (email, password) => {
    if (firebaseService.isMock) {
      setLoading(true);
      try {
        const mockUser = await firebaseService.login(email, password);
        setUser(mockUser);
        const mockProfile = await firebaseService.getProfile(email);
        setProfile({
          name:  String(mockProfile?.name || ""),
          email: String(mockProfile?.email || email || ""),
          role:  String(mockProfile?.role || "driver"),
          ...mockProfile
        });
        return mockUser;
      } finally {
        setLoading(false);
      }
    }
    const { signInWithEmailAndPassword } = require("firebase/auth")
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const p = await firebaseService.getProfile(cred.user.uid);
    setProfile({
      name:  String(p?.name || ""),
      email: String(p?.email || cred.user.email || ""),
      role:  String(p?.role || "driver"),
      ...p
    });
    return cred.user;
  }

  const register = async (email, password, profileData) => {
    setLoading(true);
    try {
      const registeredUser = await firebaseService.register(email, password, profileData);
      setUser(null);
      setProfile(null);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    console.log('[AuthContext] Logging out session...')
    try {
      // Clear ALL cached auth and user state from storage
      localStorage.removeItem('eco_drive_current_user')
      localStorage.removeItem('eco_drive_auth_token')
      localStorage.removeItem('eco_drive_user_cache')
      sessionStorage.clear()
      console.log('[AuthContext] All storage cleared.')
    } catch (e) {
      console.warn('[AuthContext] Failed to clear storage:', e)
    }

    // Reset React state immediately so forms open blank
    setUser(null)
    setProfile(null)

    if (firebaseService.isMock) {
      try {
        await firebaseService.logout()
        console.log('[AuthContext] Mock logout complete.')
      } catch (e) {
        console.warn('[AuthContext] Mock logout error:', e)
      }
      return
    }
    const { signOut } = require("firebase/auth")
    await signOut(auth)
    console.log('[AuthContext] Firebase logout complete.')
  }

  const forgotPassword = async (email) => {
    if (firebaseService.isMock) return;
    const { sendPasswordResetEmail } = require("firebase/auth")
    return sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout, forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    console.error("[useAuth] Must be inside <AuthProvider>")
    return {
      user:    null,
      profile: null,
      loading: false,
      login:   async () => {},
      register:async () => {},
      logout:  async () => {},
      forgotPassword: async () => {},
    }
  }
  return ctx
}
