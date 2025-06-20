
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's chat participants directly
    const { data: userChats, error: chatsError } = await supabaseClient
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (chatsError) throw chatsError

    if (!userChats || userChats.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatIds = userChats.map(uc => uc.chat_id)

    // Get chat details
    const { data: chatsData, error: chatsDetailError } = await supabaseClient
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updated_at', { ascending: false })

    if (chatsDetailError) throw chatsDetailError

    // Get all participants for these chats
    const { data: participantsData, error: participantsError } = await supabaseClient
      .from('chat_participants')
      .select('chat_id, user_id')
      .in('chat_id', chatIds)

    if (participantsError) throw participantsError

    // Get unique user IDs from participants
    const userIds = [...new Set(participantsData?.map(p => p.user_id) || [])]

    // Get profiles for all participants
    const { data: profilesData } = await supabaseClient
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)

    // Create profiles map
    const profilesMap = new Map(
      (profilesData || []).map(profile => [profile.id, profile])
    )

    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      (chatsData || []).map(async (chat) => {
        const { data: lastMessage } = await supabaseClient
          .from('messages')
          .select('content, created_at, sender_id, message_type')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get participants for this chat
        const chatParticipants = (participantsData || [])
          .filter(p => p.chat_id === chat.id)
          .map(p => ({
            user_id: p.user_id,
            profiles: profilesMap.get(p.user_id) || {
              username: null,
              full_name: null,
              avatar_url: null
            }
          }))

        return {
          ...chat,
          participants: chatParticipants,
          last_message: lastMessage || undefined
        }
      })
    )

    return new Response(
      JSON.stringify({ data: chatsWithLastMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get_user_chats:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
