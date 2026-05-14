const ICONS = {
  pen: '✏️', eraser: '🧹', rect: '⬜', circle: '⭕', arrow: '➡️', text: 'T', sticky: '📝',
}
const LABELS = {
  pen: '펜', eraser: '지우개', rect: '사각형', circle: '원', arrow: '화살표', text: '텍스트', sticky: '스티커',
}

export default function ToolButton({ tool, isActive, onClick }) {
  return (
    <button
      title={LABELS[tool]}
      onClick={() => onClick(tool)}
      style={{
        width: 44, height: 44, border: isActive ? '2px solid #3B82F6' : '1px solid #ddd',
        borderRadius: 8, background: isActive ? '#EBF5FB' : '#fff', cursor: 'pointer',
        fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
      }}
    >
      {ICONS[tool]}
    </button>
  )
}
