import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Ingreso exitoso')
      // Aquí deberías verificar el rol y redirigir acorde
      // Por ahora, redirijo a psicólogo para el ejemplo
      navigate('/psicologo')
    }
  }

  async function handleRegister() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Registrado! Revisa tu email para confirmar.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '2rem' }}>
      <h2>Login / Registro</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button onClick={handleLogin} style={{ marginRight: '1rem' }}>Ingresar</button>
      <button onClick={handleRegister}>Registrar</button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}
