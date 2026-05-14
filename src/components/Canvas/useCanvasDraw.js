import { useRef, useCallback } from 'react'

export function useCanvasDraw({ activeTool, style, onElementComplete }) {
  const drawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const currentPath = useRef([])
  const previewRef = useRef(null)

  function getPos(canvas, e) {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const onMouseDown = useCallback((e) => {
    const canvas = e.currentTarget
    const pos = getPos(canvas, e)
    drawing.current = true
    startPos.current = pos

    if (activeTool === 'pen') {
      currentPath.current = [pos]
    } else if (activeTool === 'text' || activeTool === 'sticky') {
      const content = prompt(activeTool === 'sticky' ? '스티커 노트 내용을 입력하세요:' : '텍스트를 입력하세요:')
      if (content?.trim()) {
        onElementComplete({
          type: activeTool,
          position_x: pos.x,
          position_y: pos.y,
          width: activeTool === 'sticky' ? 160 : undefined,
          height: activeTool === 'sticky' ? 120 : undefined,
          content: content.trim(),
          style_data: { ...style },
          z_index: Date.now() % 100000,
        })
      }
      drawing.current = false
    }
  }, [activeTool, style, onElementComplete])

  const onMouseMove = useCallback((e) => {
    if (!drawing.current) return
    const canvas = e.currentTarget
    const pos = getPos(canvas, e)

    if (activeTool === 'pen') {
      currentPath.current.push(pos)
      previewRef.current = { type: 'pen', points: [...currentPath.current] }
    } else {
      const x = Math.min(startPos.current.x, pos.x)
      const y = Math.min(startPos.current.y, pos.y)
      const w = Math.abs(pos.x - startPos.current.x)
      const h = Math.abs(pos.y - startPos.current.y)
      previewRef.current = { type: activeTool, x, y, w, h, dx: pos.x - startPos.current.x, dy: pos.y - startPos.current.y }
    }
    canvas.dispatchEvent(new CustomEvent('preview-update'))
  }, [activeTool])

  const onMouseUp = useCallback((e) => {
    if (!drawing.current) return
    drawing.current = false
    previewRef.current = null
    const canvas = e.currentTarget
    const pos = getPos(canvas, e)

    if (activeTool === 'pen' && currentPath.current.length >= 2) {
      onElementComplete({
        type: 'pen',
        position_x: currentPath.current[0].x,
        position_y: currentPath.current[0].y,
        style_data: { color: style.color, strokeWidth: style.strokeWidth },
        path_data: { points: currentPath.current },
        z_index: Date.now() % 100000,
      })
      currentPath.current = []
    } else if (['rect', 'circle', 'arrow'].includes(activeTool)) {
      const dx = pos.x - startPos.current.x
      const dy = pos.y - startPos.current.y
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return
      onElementComplete({
        type: activeTool,
        position_x: activeTool === 'arrow' ? startPos.current.x : Math.min(startPos.current.x, pos.x),
        position_y: activeTool === 'arrow' ? startPos.current.y : Math.min(startPos.current.y, pos.y),
        width: activeTool === 'arrow' ? dx : Math.abs(dx),
        height: activeTool === 'arrow' ? dy : Math.abs(dy),
        style_data: { color: style.color, strokeWidth: style.strokeWidth, fillColor: style.fillColor },
        z_index: Date.now() % 100000,
      })
    } else if (activeTool === 'eraser') {
      canvas.dispatchEvent(new CustomEvent('eraser-up', { detail: { x: pos.x, y: pos.y } }))
    }
  }, [activeTool, style, onElementComplete])

  return { onMouseDown, onMouseMove, onMouseUp, previewRef }
}
