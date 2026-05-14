import { useState } from 'react'
import { useBoards } from '../../hooks/useBoards'

export default function ShareDialog({ board, onClose, onShareGenerated }) {
  const { generateShareLink } = useBoards()
  const [shareUrl, setShareUrl] = useState(board.has_share_link ? `${window.location.origin}/boards/shared/${board.share_token}` : '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const data = await generateShareLink(board.id)
      const url = `${window.location.origin}${data.share_url}`
      setShareUrl(url)
      if (onShareGenerated) onShareGenerated(board.id, data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, boxShadow: '0 8px 32px #0002' }}>
        <h3 style={{ marginBottom: 16 }}>보드 공유</h3>
        {shareUrl ? (
          <>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>이 링크를 공유하세요 (로그인 후 편집 가능):</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={shareUrl} style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />
              <button onClick={handleCopy}
                style={{ padding: '8px 14px', background: copied ? '#22c55e' : '#3B82F6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
          </>
        ) : (
          <button onClick={handleGenerate} disabled={loading}
            style={{ padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
            {loading ? '생성 중...' : '공유 링크 생성'}
          </button>
        )}
        <button onClick={onClose} style={{ marginTop: 16, padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', width: '100%', background: '#f9f9f9' }}>
          닫기
        </button>
      </div>
    </div>
  )
}
