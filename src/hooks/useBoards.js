import { useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

export function useBoards() {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBoards = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      setBoards(data.map(b => ({ ...b, is_owner: b.owner_id === user?.id, has_share_link: !!b.share_token })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createBoard = useCallback(async (name) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('boards')
      .insert({ name, owner_id: user.id })
      .select()
      .single()
    if (error) throw error
    const board = { ...data, is_owner: true, has_share_link: false }
    setBoards(prev => [board, ...prev])
    return board
  }, [])

  const deleteBoard = useCallback(async (id) => {
    const { error } = await supabase.from('boards').delete().eq('id', id)
    if (error) throw error
    setBoards(prev => prev.filter(b => b.id !== id))
  }, [])

  const generateShareLink = useCallback(async (id) => {
    const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 64)
    const { error } = await supabase.from('boards').update({ share_token: token }).eq('id', id)
    if (error) throw error
    setBoards(prev => prev.map(b => b.id === id ? { ...b, share_token: token, has_share_link: true } : b))
    return { share_token: token, share_url: `/boards/shared/${token}` }
  }, [])

  return { boards, loading, error, fetchBoards, createBoard, deleteBoard, generateShareLink }
}
