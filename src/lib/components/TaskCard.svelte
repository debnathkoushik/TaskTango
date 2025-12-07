<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import Timer from './Timer.svelte'
  import type { Task, TimeSession } from '$lib/types'

  const dispatch = createEventDispatcher<{
    toggleSelection: string
    sessionStarted: TimeSession
    sessionStopped: void
  }>()

  export let task: Task
  export let isSelected: boolean = false
  export let activeSession: TimeSession | null = null

  let showSessions: boolean = false
  let loading: boolean = false
  let error: string = ''

  $: isActive = activeSession && activeSession.task_id === task.id
  $: totalDuration = calculateTotalDuration()
  $: sessions = task.time_sessions || []

  function calculateTotalDuration(): number {
    if (!task.time_sessions) return 0
    return task.time_sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
  }

  function formatDuration(seconds: number): string {
    if (!seconds) return '0h 0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function handleStartTimer(): Promise<void> {
    if (activeSession) {
      error = 'Please stop the current timer first'
      setTimeout(() => error = '', 3000)
      return
    }

    loading = true
    error = ''

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      error = 'You must be logged in'
      loading = false
      return
    }

    // Create new session
    const { data: newSession, error: sessionError } = await supabase
      .from('time_sessions')
      .insert({
        user_id: user.id,
        task_id: task.id,
        start_time: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      error = 'Failed to start timer: ' + sessionError.message
      loading = false
      return
    }

    // Update task status to in_progress
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)

    loading = false

    if (updateError) {
      console.error('Failed to update task status:', updateError)
    }

    // Notify parent to refresh
    dispatch('sessionStarted', newSession as TimeSession)
  }

  async function handleStopTimer(): Promise<void> {
    if (!activeSession) return

    loading = true
    error = ''

    const endTime = new Date()
    const startTime = new Date(activeSession.start_time)
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    const { error: stopError } = await supabase
      .from('time_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('id', activeSession.id)

    loading = false

    if (stopError) {
      error = 'Failed to stop timer: ' + stopError.message
      return
    }

    // Notify parent to refresh
    dispatch('sessionStopped')
  }

  function toggleSessions(): void {
    showSessions = !showSessions
  }

  function handleCheckboxChange(): void {
    dispatch('toggleSelection', task.id)
  }

  function getStatusColor(status: Task['status']): string {
    const colors: Record<Task['status'], string> = {
      pending: '#DBEAFE',
      in_progress: '#FEF3C7',
      completed: '#D1FAE5',
    }
    return colors[status]
  }

  function getStatusTextColor(status: Task['status']): string {
    const colors: Record<Task['status'], string> = {
      pending: '#1E40AF',
      in_progress: '#92400E',
      completed: '#059669',
    }
    return colors[status]
  }

  function formatStatus(status: Task['status']): string {
    return status.replace('_', ' ').toUpperCase()
  }
</script>

<div class="task-card" class:selected={isSelected} class:active={isActive}>
  <div class="task-header">
    <div class="task-left">
      <input
        type="checkbox"
        checked={isSelected}
        on:change={handleCheckboxChange}
        class="task-checkbox"
      />
      <h3>{task.title}</h3>
    </div>

    <div class="task-actions">
      {#if isActive && activeSession}
        <div class="timer-display">
          <Timer startTime={activeSession.start_time} running={true} />
        </div>
        <button
          on:click={handleStopTimer}
          disabled={loading}
          class="btn-stop"
        >
          ⏹ Stop
        </button>
      {:else}
        <button
          on:click={handleStartTimer}
          disabled={loading}
          class="btn-start"
        >
          ▶ Start
        </button>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}

  <div class="task-meta">
    <span
      class="status-badge"
      style="background: {getStatusColor(task.status)}; color: {getStatusTextColor(task.status)}"
    >
      {formatStatus(task.status)}
    </span>

    <span class="task-date">
      Created: {new Date(task.created_at).toLocaleDateString()}
    </span>

    <span class="total-time">
      Total: {formatDuration(totalDuration)}
    </span>

    {#if sessions.length > 0}
      <button on:click={toggleSessions} class="sessions-toggle">
        {showSessions ? '▼' : '▶'} {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
      </button>
    {/if}
  </div>

  {#if showSessions && sessions.length > 0}
    <div class="sessions-list">
      <h4>Session History</h4>
      {#each sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) as session}
        <div class="session-item">
          <div class="session-header">
            <span class="session-date">{formatDateTime(session.start_time)}</span>
            {#if session.end_time}
              <span class="session-duration">{formatDuration(session.duration_seconds || 0)}</span>
            {:else}
              <span class="session-active">Active</span>
            {/if}
          </div>
          {#if session.notes}
            <p class="session-notes">{session.notes}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .task-card {
    background: white;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .task-card:hover {
    border-color: #D1D5DB;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .task-card.selected {
    border-color: #4F46E5;
    background: #F5F3FF;
  }

  .task-card.active {
    border-color: #DC2626;
    background: #FEF2F2;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  .task-left {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1;
  }

  .task-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-top: 0.25rem;
    flex-shrink: 0;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    word-break: break-word;
  }

  .task-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .timer-display {
    font-family: 'Courier New', monospace;
    font-size: 1.25rem;
    font-weight: 600;
    color: #DC2626;
  }

  .btn-start,
  .btn-stop {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn-start {
    background: #10B981;
    color: white;
  }

  .btn-start:hover:not(:disabled) {
    background: #059669;
  }

  .btn-stop {
    background: #DC2626;
    color: white;
  }

  .btn-stop:hover:not(:disabled) {
    background: #B91C1C;
  }

  .btn-start:disabled,
  .btn-stop:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 0.5rem;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 4px;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .task-description {
    margin: 0 0 1rem 0;
    color: #6B7280;
    line-height: 1.5;
  }

  .task-meta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .task-date,
  .total-time {
    font-size: 0.875rem;
    color: #6B7280;
  }

  .total-time {
    font-weight: 600;
    color: #374151;
  }

  .sessions-toggle {
    padding: 0.25rem 0.5rem;
    background: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: background 0.2s;
  }

  .sessions-toggle:hover {
    background: #E5E7EB;
  }

  .sessions-list {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #E5E7EB;
  }

  .sessions-list h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    color: #6B7280;
    letter-spacing: 0.05em;
  }

  .session-item {
    padding: 0.75rem;
    background: #F9FAFB;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .session-date {
    font-size: 0.875rem;
    color: #374151;
  }

  .session-duration {
    font-size: 0.875rem;
    font-weight: 600;
    color: #059669;
  }

  .session-active {
    font-size: 0.875rem;
    font-weight: 600;
    color: #DC2626;
  }

  .session-notes {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: #6B7280;
    font-style: italic;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .task-header {
      flex-direction: column;
    }

    .task-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .task-meta {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>