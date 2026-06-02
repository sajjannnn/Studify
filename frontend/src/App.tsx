import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/auth.store"
import Landing from "./pages/landing"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"
import Dashboard from "./pages/dashboard"
import UploadPage from "./pages/upload"
import AIWorkspace from "./pages/ai-workspace"
import Profile from "./pages/profile"
import Explore from "./pages/explore"
import NoteDetail from "./pages/notes/[id]"
import SummaryDetail from "./pages/summaries/[...docId]/[...id]"
import Onboarding from "./pages/onboarding"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  return children
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={<Signup />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-workspace"
        element={
          <ProtectedRoute>
            <AIWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/summaries/:docId/:summaryId"
        element={
          <ProtectedRoute>
            <SummaryDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
