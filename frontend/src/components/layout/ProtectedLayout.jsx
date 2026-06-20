import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import Sidebar     from "./Sidebar"
import Topbar      from "./Topbar"
import LoadingScreen from "./LoadingScreen"
import ErrorBoundary from "../ErrorBoundary"

export default function ProtectedLayout() {
  const { user, loading } = useAuth()

  // Show loading while Firebase resolves
  // Never render children during loading
  if (loading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated — render layout
  return (
    <div className="min-h-screen bg-[#070708] text-[#f1f1f3] flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Sidebar wrapped in its own ErrorBoundary */}
      {/* If sidebar crashes, rest of app still works */}
      <ErrorBoundary
        fallback={<SidebarFallback />}>
        <Sidebar />
      </ErrorBoundary>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar wrapped safely */}
        <ErrorBoundary fallback={<TopbarFallback />}>
          <Topbar />
        </ErrorBoundary>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#070708]">
          {/* Each page wrapped in its own boundary */}
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// Minimal fallback if Sidebar crashes
function SidebarFallback() {
  return (
    <aside className="w-[220px] bg-[#0e0e10] border-r border-[rgba(255,255,255,0.04)] p-4 flex-shrink-0 z-20">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        <span className="text-[15px] font-semibold tracking-tight text-[#f1f1f3] font-display">EcoTrack</span>
      </div>
      <p className="text-xs text-[#3a3a45] mt-4">Sidebar crashed.</p>
    </aside>
  )
}

// Minimal fallback if Topbar crashes
function TopbarFallback() {
  return (
    <header className="h-[56px] bg-[#070708] border-b border-[rgba(255,255,255,0.04)] flex-shrink-0" />
  )
}
