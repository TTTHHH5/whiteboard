import { useState } from 'react'
import BoardCard from './BoardCard'

export default function BoardList({ boards, onDelete, onShareGenerated, onCreateClick }) {
  if (boards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>아직 보드가 없습니다</p>
        <p style={{ fontSize: 14 }}>첫 보드를 만들어 보세요!</p>
        <button onClick={onCreateClick}
          style={{ marginTop: 24, padding: '12px 28px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
          + 새 보드 만들기
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {boards.map(board => (
        <BoardCard key={board.id} board={board} onDelete={onDelete} onShareGenerated={onShareGenerated} />
      ))}
    </div>
  )
}
