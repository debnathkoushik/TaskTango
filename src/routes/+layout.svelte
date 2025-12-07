<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: {
    console.log('Layout data:', data)
    console.log('Session object:', data.session)
    console.log('Has access_token?', !!data.session?.access_token)
    console.log('Has refresh_token?', !!data.session?.refresh_token)
  }

  // Sync server session to client when data changes
  $: {
    const syncSession = async () => {
      if (data.session) {
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        if (error) {
          console.error('Error setting session:', error)
        } else {
          console.log('Session synced to client')
        }
      }
    }
    syncSession()
  }

  onMount(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      invalidate('supabase:auth')
    })

    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<slot />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #F9FAFB;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>