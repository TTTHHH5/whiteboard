import ToolButton from './ToolButton'

const TOOLS = ['pen', 'eraser', 'rect', 'circle', 'arrow', 'text', 'sticky']
const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ffffff']

export default function Toolbar({ activeTool, style, onToolChange, onStyleChange, onUndo, onRedo, onExport, canUndo, canRedo }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
      background: '#fff', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap',
    }}>
      {TOOLS.map(tool => (
        <ToolButton key={tool} tool={tool} isActive={activeTool === tool} onClick={onToolChange} />
      ))}

      <div style={{ width: 1, height: 36, background: '#e5e7eb', margin: '0 4px' }} />

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => onStyleChange({ color: c })}
            style={{
              width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
              border: style.color === c ? '2px solid #3B82F6' : '1px solid #ccc',
            }} />
        ))}
        <input type="color" value={style.color} onChange={e => onStyleChange({ color: e.target.value })}
          style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', background: 'none' }} title="색상 직접 선택" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#666' }}>굵기</label>
        <input type="range" min="1" max="20" value={style.strokeWidth}
          onChange={e => onStyleChange({ strokeWidth: Number(e.target.value) })}
          style={{ width: 80 }} />
        <span style={{ fontSize: 12, width: 18 }}>{style.strokeWidth}</span>
      </div>

      <div style={{ width: 1, height: 36, background: '#e5e7eb', margin: '0 4px' }} />

      <button onClick={onUndo} disabled={!canUndo} title="실행 취소 (Ctrl+Z)"
        style={{ padding: '5px 12px', border: '1px solid #ddd', borderRadius: 6, cursor: canUndo ? 'pointer' : 'not-allowed', background: '#f9f9f9', opacity: canUndo ? 1 : 0.4 }}>
        ↩ Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} title="다시 실행 (Ctrl+Y)"
        style={{ padding: '5px 12px', border: '1px solid #ddd', borderRadius: 6, cursor: canRedo ? 'pointer' : 'not-allowed', background: '#f9f9f9', opacity: canRedo ? 1 : 0.4 }}>
        ↪ Redo
      </button>

      <div style={{ marginLeft: 'auto' }}>
        <button onClick={onExport} title="PNG로 내보내기"
          style={{ padding: '5px 14px', border: '1px solid #3B82F6', borderRadius: 6, color: '#3B82F6', cursor: 'pointer', background: '#fff' }}>
          ⬇ 내보내기
        </button>
      </div>
    </div>
  )
}
