export function renderPen(ctx, el) {
  const pts = el.path_data?.points
  if (!pts || pts.length < 2) return
  ctx.beginPath()
  ctx.strokeStyle = el.style_data?.color || '#000'
  ctx.lineWidth = el.style_data?.strokeWidth || 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.stroke()
}

export function renderRect(ctx, el) {
  ctx.beginPath()
  ctx.strokeStyle = el.style_data?.color || '#000'
  ctx.lineWidth = el.style_data?.strokeWidth || 2
  ctx.fillStyle = el.style_data?.fillColor || 'transparent'
  ctx.rect(el.position_x, el.position_y, el.width || 100, el.height || 60)
  ctx.fill()
  ctx.stroke()
}

export function renderCircle(ctx, el) {
  const w = el.width || 80, h = el.height || 80
  const rx = w / 2, ry = h / 2
  ctx.beginPath()
  ctx.strokeStyle = el.style_data?.color || '#000'
  ctx.lineWidth = el.style_data?.strokeWidth || 2
  ctx.fillStyle = el.style_data?.fillColor || 'transparent'
  ctx.ellipse(el.position_x + rx, el.position_y + ry, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

export function renderArrow(ctx, el) {
  const x1 = el.position_x, y1 = el.position_y
  const x2 = el.position_x + (el.width || 100), y2 = el.position_y + (el.height || 0)
  const color = el.style_data?.color || '#000'
  const lw = el.style_data?.strokeWidth || 2
  const headLen = 14

  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

export function renderText(ctx, el) {
  if (!el.content) return
  ctx.font = `${el.style_data?.fontSize || 16}px sans-serif`
  ctx.fillStyle = el.style_data?.color || '#000'
  const lines = el.content.split('\n')
  const lineHeight = (el.style_data?.fontSize || 16) * 1.4
  lines.forEach((line, i) => ctx.fillText(line, el.position_x, el.position_y + i * lineHeight))
}

export function renderSticky(ctx, el) {
  const w = el.width || 160, h = el.height || 120
  ctx.fillStyle = el.style_data?.backgroundColor || '#FFFF88'
  ctx.shadowColor = '#0002'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.beginPath()
  ctx.roundRect(el.position_x, el.position_y, w, h, 4)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  if (el.content) {
    ctx.font = `${el.style_data?.fontSize || 14}px sans-serif`
    ctx.fillStyle = '#222'
    const lines = el.content.split('\n')
    const lineH = 20
    lines.forEach((line, i) => ctx.fillText(line, el.position_x + 12, el.position_y + 24 + i * lineH))
  }
}

export function renderAll(ctx, elements) {
  if (!ctx || !elements) return
  const sorted = [...elements].sort((a, b) => a.z_index - b.z_index || a.created_at?.localeCompare(b.created_at))
  for (const el of sorted) {
    ctx.save()
    switch (el.type) {
      case 'pen': renderPen(ctx, el); break
      case 'rect': renderRect(ctx, el); break
      case 'circle': renderCircle(ctx, el); break
      case 'arrow': renderArrow(ctx, el); break
      case 'text': renderText(ctx, el); break
      case 'sticky': renderSticky(ctx, el); break
    }
    ctx.restore()
  }
}
