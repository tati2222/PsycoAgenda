import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import PsicologoDashboard from './components/PsicologoDashboard'
import PacienteDashboard from './components/PacienteDashboard'

function RequireAuth({ children }) {
  // Aquí podés validar si el usuario está logueado y su rol
  // Por ahora permitimos acceso directo
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/psicologo" element={
        <RequireAuth>
          <PsicologoDashboard />
        </RequireAuth>
      } />
      <Route path="/paciente" element={
        <RequireAuth>
          <PacienteDashboard />
        </RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
)
