import { useRef, useState } from 'react'

const MAX_STACK = 50

export function useEditHistory() {
  const undoStack = useRef([])
  const redoStack = useRef([])
  const [, forceUpdate] = useState(0)
  const tick = () => forceUpdate(n => n + 1)

  function push(action) {
    if (undoStack.current.length >= MAX_STACK) undoStack.current.shift()
    undoStack.current.push(action)
    redoStack.current = []
    tick()
  }

  function popUndo() {
    const action = undoStack.current.pop()
    if (action) { redoStack.current.push(action); tick() }
    return action
  }

  function popRedo() {
    const action = redoStack.current.pop()
    if (action) { undoStack.current.push(action); tick() }
    return action
  }

  return {
    push,
    popUndo,
    popRedo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  }
}
