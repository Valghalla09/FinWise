import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { BudgetProvider } from './contexts/BudgetContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { LearnFinanceProvider } from './contexts/LearnFinanceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="finwise-theme">
        <AuthProvider>
          <BudgetProvider>
            <ProgressProvider>
              <LearnFinanceProvider>
                <App />
              </LearnFinanceProvider>
            </ProgressProvider>
          </BudgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
