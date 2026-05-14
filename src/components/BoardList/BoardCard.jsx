import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShareDialog from './ShareDialog'

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '20px 24px',
  boxShadow: '0 1px 8px #0001',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

export default function BoardCard({ board, onDelete, onShareGenerated }) {
  const navigate = useNavigate()
  const [showShare, setShowShare] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleClick(e) {
    if (e.target.closest('button')) return
    navigate(`/boards/${board.id}`)
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirmDelete) { setConfirmDelete(true); return }
    try {
      await onDelete(board.id)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div style={cardStyle} onClick={handleClick} onMouseLeave={() => setConfirmDelete(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>{board.name}</h3>
          <span style={{ fontSize: 12, background: board.is_owner ? '#EBF5FB' : '#FEF9E7', color: board.is_owner ? '#2980B9' : '#D4AC0D', padding: '2px 8px', borderRadius: 20 }}>
            {board.is_owner ? '소유자' : '공유됨'}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#888' }}>
          {new Date(board.created_at).toLocaleDateString('ko-KR')}
        </p>
        {board.is_owner && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={e => { e.stopPropagation(); setShowShare(true) }}
              style={{ padding: '5px 12px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#f9f9f9', cursor: 'pointer' }}>
              공유
            </button>
            <button onClick={handleDelete}
              style={{ padding: '5px 12px', fontSize: 13, border: '1px solid #fca5a5', borderRadius: 6, background: confirmDelete ? '#fee2e2' : '#fff', color: '#dc2626', cursor: 'pointer' }}>
              {confirmDelete ? '확인 삭제' : '삭제'}
            </button>
          </div>
        )}
      </div>
      {showShare && (
        <ShareDialog board={board} onClose={() => setShowShare(false)} onShareGenerated={onShareGenerated} />
      )}
    </>
  )
}
