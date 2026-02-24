import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { auth } from '../lib/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate({ to: '/' })
    })
    return () => unsub()
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate({ to: '/' })
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'שגיאה'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
      <h1 style={{ marginBlockEnd: 24 }}>התחברות</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBlockEnd: 16 }}>
          <label htmlFor="email" style={{ display: 'block', marginBlockEnd: 4 }}>אימייל</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBlockEnd: 16 }}>
          <label htmlFor="password" style={{ display: 'block', marginBlockEnd: 4 }}>סיסמה</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <p style={{ color: 'crimson', marginBlockEnd: 16 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? '...' : 'כניסה'}
        </button>
      </form>
    </div>
  )
}
