import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useBoards } from '../hooks/useBoards'
import BoardList from '../components/BoardList/BoardList'

export default function BoardListPage() {
  const { boards, loading, error, fetchBoards, createBoard, deleteBoard } = useBoards()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchBoards() }, [fetchBoards])

  async function handleCreate(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) { setCreateError('보드 이름을 입력하세요.'); return }
    if (trimmed.length > 100) { setCreateError('보드 이름은 100자 이하여야 합니다.'); return }
    setCreateError('')
    setCreating(true)
    try {
      await createBoard(trimmed)
      setNewName('')
      setShowCreate(false)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>🖊 내 보드</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowCreate(true)}
            style={{ padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
            + 새 보드 만들기
          </button>
          <button onClick={handleSignOut}
            style={{ padding: '10px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 15, background: '#fff' }}>
            로그아웃
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#e53e3e', marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 120, background: '#f0f0f0', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <BoardList boards={boards} onDelete={deleteBoard} onCreateClick={() => setShowCreate(true)} />
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: '#0005', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 400 }}>
            <h3 style={{ marginBottom: 16 }}>새 보드 만들기</h3>
            {createError && <p style={{ color: '#e53e3e', marginBottom: 10, fontSize: 14 }}>{createError}</p>}
            <form onSubmit={handleCreate}>
              <input autoFocus type="text" placeholder="보드 이름 (1~100자)"
                value={newName} onChange={e => setNewName(e.target.value)} maxLength={100}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={creating}
                  style={{ flex: 1, padding: '11px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
                  {creating ? '생성 중...' : '만들기'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{ flex: 1, padding: '11px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
