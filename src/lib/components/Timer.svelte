<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let startTime: string
  export let running: boolean = false

  let elapsed: number = 0
  let interval: ReturnType<typeof setInterval> | undefined

  function updateElapsed(): void {
    if (running && startTime) {
      const start = new Date(startTime)
      const now = new Date()
      elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  onMount(() => {
    updateElapsed()
    interval = setInterval(updateElapsed, 1000)
  })

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })

  $: if (running) {
    updateElapsed()
  }
</script>

<span class="timer" class:running>
  {formatTime(elapsed)}
</span>

<style>
  .timer {
    font-family: 'Courier New', monospace;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
  }

  .timer.running {
    color: #DC2626;
  }
</style>