<script>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  onMount(() => {
    goto('/login')
  })
</script>

<div class="redirect-screen">
  <p>Redirecting to login...</p>
</div>

<style>
  .redirect-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: #6B7280;
  }
</style>