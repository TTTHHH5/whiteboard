import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './services/supabase'
import { ToastProvider } from './components/Toast'
import BoardListPage from './pages/BoardListPage'
import BoardEditorPage from './pages/BoardEditorPage'

function ProtectedRoute({ children, session }) {
  if (session === undefined) return <div style={{ padding: 24 }}>로딩 중...</div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

function AuthModal({ mode, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function switchMode() {
    setIsSignUp(!isSignUp)
    setError('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (isSignUp && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    try {
      let result
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password })
      } else {
        result = await supabase.auth.signInWithPassword({ email, password })
      }
      if (result.error) throw result.error
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const passwordMatch = confirmPassword === '' || password === confirmPassword

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: 400, position: 'relative', boxShadow: '0 8px 40px #0003' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{isSignUp ? '회원가입' : '로그인'}</h2>
        {error && <p style={{ color: '#e53e3e', marginBottom: 12, fontSize: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', marginBottom: 10, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} required />
          <input type="password" placeholder="비밀번호 (8자 이상)" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', marginBottom: 10, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} required minLength={8} />
          {isSignUp && (
            <div style={{ marginBottom: 18 }}>
              <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: `1px solid ${passwordMatch ? '#e2e8f0' : '#f87171'}`, borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} required />
              {!passwordMatch && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          )}
          {!isSignUp && <div style={{ marginBottom: 18 }} />}
          <button type="submit" disabled={loading || (isSignUp && !passwordMatch)}
            style={{ width: '100%', padding: '13px', background: loading || (isSignUp && !passwordMatch) ? '#93c5fd' : '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: loading || (isSignUp && !passwordMatch) ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 600 }}>
            {loading ? '처리 중...' : (isSignUp ? '가입하기' : '로그인')}
          </button>
        </form>
        <p style={{ marginTop: 18, textAlign: 'center', cursor: 'pointer', color: '#3B82F6', fontSize: 14 }} onClick={switchMode}>
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </p>
      </div>
    </div>
  )
}

function LoginPage() {
  const [authMode, setAuthMode] = useState(null)
  const [guestLoading, setGuestLoading] = useState(false)
  const navigate = useNavigate()

  async function handleGuest() {
    setGuestLoading(true)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      navigate('/')
    } catch (err) {
      alert(err.message)
    } finally {
      setGuestLoading(false)
    }
  }

  const features = [
    { icon: '✏️', title: '7가지 드로잉 도구', desc: '펜, 도형, 화살표, 텍스트, 스티커 노트' },
    { icon: '⚡', title: '실시간 협업', desc: '변경사항이 500ms 이내로 동기화' },
    { icon: '🔗', title: '보드 공유', desc: '링크 하나로 누구든 초대 가능' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDF4 100%)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>🖊 Whiteboard</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setAuthMode('login')}
            style={{ padding: '9px 22px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
            로그인
          </button>
          <button onClick={() => setAuthMode('signup')}
            style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#3B82F6', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
            회원가입
          </button>
        </div>
      </nav>

      <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#1e293b', lineHeight: 1.2, marginBottom: 20 }}>
          함께 그리는<br />실시간 화이트보드
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
          보드를 만들고, 그리고, 공유하세요.<br />변경사항이 즉시 모든 참여자에게 전달됩니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setAuthMode('signup')}
            style={{ padding: '15px 40px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 18, fontWeight: 600, boxShadow: '0 4px 16px #3B82F640' }}>
            무료로 시작하기
          </button>
          <button onClick={handleGuest} disabled={guestLoading}
            style={{ padding: '10px 28px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
            {guestLoading ? '입장 중...' : '로그인 없이 둘러보기'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '0 24px 80px', flexWrap: 'wrap' }}>
        {features.map(f => (
          <div key={f.title} style={{ background: '#fff', borderRadius: 14, padding: '28px 28px', width: 220, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b', fontSize: 15 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}

function SharedBoardRedirect({ session }) {
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    async function resolveToken() {
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
        const { data: { session: s } } = await supabase.auth.getSession()
        const res = await fetch(`${BASE_URL}/api/boards/shared/${token}`, {
          headers: { Authorization: `Bearer ${s.access_token}` }
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error?.message || 'Not found')
        navigate(`/boards/${json.data.id}`, { replace: true })
      } catch (err) {
        setError(err.message)
      }
    }
    resolveToken()
  }, [session, token, navigate])

  if (!session) return <Navigate to={`/login?redirect=/boards/shared/${token}`} replace />
  if (error) return <div style={{ padding: 24, color: '#e53e3e' }}>오류: {error}</div>
  return <div style={{ padding: 24 }}>공유 보드로 이동 중...</div>
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/boards/shared/:token" element={<SharedBoardRedirect session={session} />} />
          <Route path="/" element={<ProtectedRoute session={session}><BoardListPage /></ProtectedRoute>} />
          <Route path="/boards/:boardId" element={<ProtectedRoute session={session}><BoardEditorPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
