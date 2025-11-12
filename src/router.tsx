// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'

import { App } from './App'
import { ErrorElement } from './components/common/ErrorElement'
import { NotFound } from './components/common/NotFound'
import ProtectedRoute from './components/common/ProtectedRoute'
// Pages
import { Component as Main } from './pages/(main)/index.sync'
import Dashboard from './pages/Dashboard'
import EmployeeCard from './pages/EmployeeCard'
import EmployeeCardPage from './pages/EmployeeCardPage'
import Login from './pages/Login'
import Profile from './pages/profile'
import Reports from './pages/reports'
import Schedule from './pages/schedule'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      // 🔓 Public routes
      { path: 'login', element: <Login /> },

      // 🔒 Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Main /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'reports', element: <Reports /> },
          { path: 'schedule', element: <Schedule /> },
          { path: 'employees', element: <EmployeeCardPage /> },
          { path: 'employee/:empNo', element: <EmployeeCard /> },
        ],
      },

      // 🚫 Catch-all
      { path: '*', element: <NotFound /> },
    ],
  },
])
