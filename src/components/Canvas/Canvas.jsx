import { useRef, useEffect, useCallback } from 'react'
import { renderAll, renderPen, renderRect, renderCircle, renderArrow } from './renderer'
import { useCanvasDraw } from './useCanvasDraw'

export default function Canvas({ elements, activeTool, style, onElementComplete, onEraserHit }) {
  const canvasRef = useRef(null)
  const { onMouseDown, onMouseMove, onMouseUp, previewRef } = useCanvasDraw({ activeTool, style, onElementComplete })

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderAll(ctx, elements)

    const preview = previewRef.current
    if (!preview) return
    ctx.save()
    ctx.globalAlpha = 0.6
    if (preview.type === 'pen') {
      renderPen(ctx, { path_data: { points: preview.points }, style_data: style })
    } else if (preview.type === 'rect') {
      renderRect(ctx, { position_x: preview.x, position_y: preview.y, width: preview.w, height: preview.h, style_data: style })
    } else if (preview.type === 'circle') {
      renderCircle(ctx, { position_x: preview.x, position_y: preview.y, width: preview.w, height: preview.h, style_data: style })
    } else if (preview.type === 'arrow') {
      renderArrow(ctx, { position_x: preview.x - preview.dx, position_y: preview.y - preview.dy, width: preview.dx, height: preview.dy, style_data: style })
    }
    ctx.restore()
  }, [elements, style, previewRef])

  useEffect(() => { redraw() }, [redraw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handlePreview = () => redraw()
    const handleEraser = (e) => { if (onEraserHit) onEraserHit(e.detail) }
    canvas.addEventListener('preview-update', handlePreview)
    canvas.addEventListener('eraser-up', handleEraser)
    return () => {
      canvas.removeEventListener('preview-update', handlePreview)
      canvas.removeEventListener('eraser-up', handleEraser)
    }
  }, [redraw, onEraserHit])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      redraw()
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [redraw])

  const cursor = activeTool === 'eraser' ? 'cell' : activeTool === 'text' || activeTool === 'sticky' ? 'text' : 'crosshair'

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor, touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  )
}
