import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

export function useRealtime({ boardId, onElementAdd, onElementDelete, onPresenceSync }) {
  const channelRef = useRef(null)

  useEffect(() => {
    if (!boardId) return

    const channel = supabase.channel(`board:${boardId}`, { config: { broadcast: { self: false } } })

    channel
      .on('broadcast', { event: 'element:add' }, ({ payload }) => {
        if (onElementAdd) onElementAdd(payload.element)
      })
      .on('broadcast', { event: 'element:delete' }, ({ payload }) => {
        if (onElementDelete) onElementDelete(payload.element_id)
      })
      .on('presence', { event: 'sync' }, () => {
        if (onPresenceSync) onPresenceSync(channel.presenceState())
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await channel.track({
              user_id: user.id,
              display_name: user.email?.split('@')[0] || '익명',
              joined_at: new Date().toISOString(),
            })
          }
        }
      })

    channelRef.current = channel
    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [boardId])

  async function broadcast(event, payload) {
    if (!channelRef.current) return
    await channelRef.current.send({ type: 'broadcast', event, payload })
  }

  return { broadcast }
}
