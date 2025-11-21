import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { motion } from 'framer-motion'

// Components
import Navbar from './components/Navbar'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import BudgetSmart from './pages/BudgetSmart'
import TrackProgress from './pages/TrackProgress'
import LearnFinance from './pages/LearnFinance'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth()
  return currentUser ? <>{children}</> : <Navigate to="/login" />
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth()
  return !currentUser ? <>{children}</> : <Navigate to="/dashboard" />
}

function App() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentUser && <Navbar />}
      
      <motion.main 
        className={currentUser ? "pt-16" : ""}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/budget-smart" element={
            <ProtectedRoute>
              <BudgetSmart />
            </ProtectedRoute>
          } />
          <Route path="/track-progress" element={
            <ProtectedRoute>
              <TrackProgress />
            </ProtectedRoute>
          } />
          <Route path="/learn-finance" element={
            <ProtectedRoute>
              <LearnFinance />
            </ProtectedRoute>
          } />

          {/* Redirect root to appropriate page */}
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />

          {/* Catch all route */}
          <Route path="*" element={
            <Navigate to={currentUser ? "/dashboard" : "/login"} />
          } />
        </Routes>
      </motion.main>
    </div>
  )
}

export default App
