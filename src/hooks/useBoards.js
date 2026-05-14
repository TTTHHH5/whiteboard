import { useState, useCallback } from 'react'
import { api } from '../services/api'

export function useBoards() {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBoards = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/boards')
      setBoards(data.boards)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createBoard = useCallback(async (name) => {
    const data = await api.post('/api/boards', { name })
    setBoards(prev => [data, ...prev])
    return data
  }, [])

  const deleteBoard = useCallback(async (id) => {
    await api.delete(`/api/boards/${id}`)
    setBoards(prev => prev.filter(b => b.id !== id))
  }, [])

  const generateShareLink = useCallback(async (id) => {
    return await api.post(`/api/boards/${id}/share`, {})
  }, [])

  return { boards, loading, error, fetchBoards, createBoard, deleteBoard, generateShareLink }
}
