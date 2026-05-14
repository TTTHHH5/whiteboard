import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Canvas from '../components/Canvas/Canvas'
import Toolbar from '../components/Toolbar/Toolbar'
import { useEditHistory } from '../hooks/useEditHistory'
import { useRealtime } from '../hooks/useRealtime'
import { useToast } from '../components/Toast'

const DEFAULT_STYLE = { color: '#000000', strokeWidth: 2, fillColor: 'transparent' }

function handleApiError(err, navigate, toast) {
  if (err.status === 401) {
    navigate('/login', { replace: true })
  } else if (err.status === 403) {
    toast('이 보드에 대한 권한이 없습니다.', 'error')
  } else if (!navigator.onLine || err.message === 'Failed to fetch') {
    toast('네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도하세요.', 'error')
  } else {
    toast(err.message || '오류가 발생했습니다.', 'error')
  }
}

export default function BoardEditorPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [board, setBoard] = useState(null)
  const [elements, setElements] = useState([])
  const [activeTool, setActiveTool] = useState('pen')
  const [style, setStyle] = useState(DEFAULT_STYLE)
  const [participants, setParticipants] = useState(0)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)
  const history = useEditHistory()

  useEffect(() => {
    async function load() {
      try {
        const [boardData, elementsData] = await Promise.all([
          api.get(`/api/boards/${boardId}`),
          api.get(`/api/boards/${boardId}/elements`),
        ])
        setBoard(boardData)
        setElements(elementsData.elements)
      } catch (err) {
        if (err.status === 401) {
          navigate('/login', { replace: true })
        } else if (err.status === 404) {
          setError('보드를 찾을 수 없습니다.')
        } else {
          setError(err.message)
        }
      }
    }
    load()
  }, [boardId])

  const handleElementAdd = useCallback((element) => {
    setElements(prev => {
      if (prev.some(e => e.id === element.id)) return prev
      return [...prev, element]
    })
  }, [])

  const handleElementDelete = useCallback((elementId) => {
    setElements(prev => prev.filter(e => e.id !== elementId))
  }, [])

  const handlePresenceSync = useCallback((state) => {
    setParticipants(Object.keys(state).length)
  }, [])

  const { broadcast } = useRealtime({
    boardId,
    onElementAdd: handleElementAdd,
    onElementDelete: handleElementDelete,
    onPresenceSync: handlePresenceSync,
  })

  const handleElementComplete = useCallback(async (elementData) => {
    try {
      const saved = await api.post(`/api/boards/${boardId}/elements`, elementData)
      setElements(prev => [...prev, saved])
      history.push({ type: 'add', element: saved })
      await broadcast('element:add', { element: saved })
    } catch (err) {
      handleApiError(err, navigate, toast)
    }
  }, [boardId, history, broadcast])

  const handleUndo = useCallback(async () => {
    const action = history.popUndo()
    if (!action) return
    if (action.type === 'add') {
      try {
        await api.delete(`/api/boards/${boardId}/elements/${action.element.id}`)
        setElements(prev => prev.filter(e => e.id !== action.element.id))
        await broadcast('element:delete', { element_id: action.element.id, board_id: boardId })
      } catch (err) {
        handleApiError(err, navigate, toast)
      }
    } else if (action.type === 'delete') {
      try {
        const saved = await api.post(`/api/boards/${boardId}/elements`, action.element)
        setElements(prev => [...prev, saved])
        await broadcast('element:add', { element: saved })
      } catch (err) {
        handleApiError(err, navigate, toast)
      }
    }
  }, [boardId, history, broadcast])

  const handleRedo = useCallback(async () => {
    const action = history.popRedo()
    if (!action) return
    if (action.type === 'add') {
      try {
        const saved = await api.post(`/api/boards/${boardId}/elements`, action.element)
        setElements(prev => [...prev, saved])
        await broadcast('element:add', { element: saved })
      } catch (err) {
        handleApiError(err, navigate, toast)
      }
    } else if (action.type === 'delete') {
      try {
        await api.delete(`/api/boards/${boardId}/elements/${action.element.id}`)
        setElements(prev => prev.filter(e => e.id !== action.element.id))
        await broadcast('element:delete', { element_id: action.element.id, board_id: boardId })
      } catch (err) {
        handleApiError(err, navigate, toast)
      }
    }
  }, [boardId, history, broadcast])

  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `board-${board?.name || boardId}.png`
    a.click()
  }, [board, boardId])

  const handleEraserHit = useCallback(async ({ x, y }) => {
    const hit = [...elements].reverse().find(el => {
      const ex = el.position_x, ey = el.position_y
      const ew = el.width || 100, eh = el.height || 60
      return x >= ex - 10 && x <= ex + ew + 10 && y >= ey - 10 && y <= ey + eh + 10
    })
    if (!hit) return
    try {
      await api.delete(`/api/boards/${boardId}/elements/${hit.id}`)
      setElements(prev => prev.filter(e => e.id !== hit.id))
      history.push({ type: 'delete', element: hit })
      await broadcast('element:delete', { element_id: hit.id, board_id: boardId })
    } catch (err) {
      handleApiError(err, navigate, toast)
    }
  }, [boardId, elements, history, broadcast])

  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedo() }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleUndo, handleRedo])

  if (error) return <div style={{ padding: 24, color: '#e53e3e' }}>오류: {error}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22 }}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{board?.name || '로딩 중...'}</h2>
        {participants > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#666', background: '#f3f4f6', padding: '4px 12px', borderRadius: 20 }}>
            👥 {participants}명 참여 중
          </span>
        )}
      </div>

      <Toolbar
        activeTool={activeTool}
        style={style}
        onToolChange={setActiveTool}
        onStyleChange={(patch) => setStyle(prev => ({ ...prev, ...patch }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
      />

      <div style={{ flex: 1, background: '#fafafa', overflow: 'hidden' }} ref={canvasRef}>
        <Canvas
          elements={elements}
          activeTool={activeTool}
          style={style}
          onElementComplete={handleElementComplete}
          onEraserHit={handleEraserHit}
        />
      </div>
    </div>
  )
}
