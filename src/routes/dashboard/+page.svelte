<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'
  import Modal from '$lib/components/Modal.svelte'
  import TaskForm from '$lib/components/TaskForm.svelte'
  import TaskCard from '$lib/components/TaskCard.svelte'
  import type { Task, TimeSession } from '$lib/types'
  import type { PageData } from './$types'

  export let data: PageData

  let tasks: Task[] = []
  let loading: boolean = true
  let error: string = ''
  let showModal: boolean = false
  let selectedTaskIds: string[] = []
  let editingTask: Task | null = null
  let showDeleteConfirm: boolean = false
  let deleteCount: number = 0
  let activeSession: TimeSession | null = null

  // Wait for data to be available using reactive statement
  $: if (data.user?.id) {
    initializeDashboard()
  }

  async function initializeDashboard() {
    await loadTasks()
    await loadActiveSession()
  }

  async function loadTasks(): Promise<void> {
    // Guard against missing user data
    if (!data.user?.id) {
      console.error('Cannot load tasks: user ID not available')
      return
    }

    loading = true
    error = ''

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        time_sessions (*)
      `)
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })

    if (tasksError) {
      error = 'Failed to load tasks: ' + tasksError.message
      console.error('Error loading tasks:', tasksError)
    } else {
      tasks = (tasksData || []) as Task[]
    }

    loading = false
  }

  async function loadActiveSession(): Promise<void> {
    if (!data.user?.id) {
      return
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('time_sessions')
      .select('*')
      .eq('user_id', data.user.id)
      .is('end_time', null)
      .maybeSingle()

    if (sessionError) {
      console.error('Error loading active session:', sessionError)
    } else {
      activeSession = sessionData as TimeSession | null
    }
  }

  function openCreateModal(): void {
    editingTask = null
    showModal = true
  }

  function closeModal(): void {
    showModal = false
    editingTask = null
  }

  async function handleTaskCreated(): Promise<void> {
    await loadTasks()
  }

  function openEditModal(): void {
    if (selectedTaskIds.length === 0) {
      alert('Please select a task to edit')
      return
    }

    if (selectedTaskIds.length > 1) {
      alert('Please select only ONE task to edit')
      return
    }

    const taskId = selectedTaskIds[0]
    editingTask = tasks.find(t => t.id === taskId) || null

    if (editingTask) {
      showModal = true
    }
  }

  async function handleTaskUpdated(): Promise<void> {
    await loadTasks()
    selectedTaskIds = []
  }

  function openDeleteConfirm(): void {
    if (selectedTaskIds.length === 0) {
      alert('Please select tasks to delete')
      return
    }

    deleteCount = selectedTaskIds.length
    showDeleteConfirm = true
  }

  function closeDeleteConfirm(): void {
    showDeleteConfirm = false
  }

  async function confirmDelete(): Promise<void> {
    loading = true
    error = ''

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .in('id', selectedTaskIds)

    if (deleteError) {
      error = 'Failed to delete tasks: ' + deleteError.message
      console.error('Error deleting tasks:', deleteError)
    } else {
      await loadTasks()
      selectedTaskIds = []
      showDeleteConfirm = false
    }

    loading = false
  }

  function handleToggleSelection(event: CustomEvent<string>): void {
    const taskId = event.detail
    if (selectedTaskIds.includes(taskId)) {
      selectedTaskIds = selectedTaskIds.filter(id => id !== taskId)
    } else {
      selectedTaskIds = [...selectedTaskIds, taskId]
    }
  }

  async function handleSessionStarted(event: CustomEvent<TimeSession>): Promise<void> {
    if (event.detail) {
      activeSession = event.detail
    }
    await loadTasks()
  }

  async function handleSessionStopped(): Promise<void> {
    activeSession = null
    await loadTasks()
  }

  async function handleSignOut(): Promise<void> {
    await supabase.auth.signOut()
    goto('/login')
  }
</script>

<div class="dashboard">
  <header>
    <h1>Task Tracker</h1>
    <div class="user-info">
      <span>{data.user?.email || 'Loading...'}</span>
      <button on:click={handleSignOut} class="btn-signout">Sign Out</button>
    </div>
  </header>

  {#if error}
    <div class="error-banner">{error}</div>
  {/if}

  <div class="toolbar">
    <div class="toolbar-left">
      <button on:click={openCreateModal} class="btn-primary">
        + New Task
      </button>

      {#if selectedTaskIds.length > 0}
        <button
          on:click={openEditModal}
          class="btn-secondary"
          disabled={selectedTaskIds.length !== 1}
        >
          ✏️ Edit Selected
        </button>

        <button on:click={openDeleteConfirm} class="btn-danger">
          🗑️ Delete Selected ({selectedTaskIds.length})
        </button>
      {/if}
    </div>

    <div class="toolbar-right">
      <span class="task-count">
        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
      </span>
      {#if activeSession}
        <span class="active-indicator">
          ⏱️ Timer Running
        </span>
      {/if}
    </div>
  </div>

  <main>
    {#if loading}
      <div class="loading">Loading tasks...</div>
    {:else if tasks.length === 0}
      <div class="empty-state">
        <p>No tasks yet. Create your first task to get started!</p>
      </div>
    {:else}
      <div class="task-list">
        {#each tasks as task (task.id)}
          <TaskCard
            {task}
            isSelected={selectedTaskIds.includes(task.id)}
            {activeSession}
            on:toggleSelection={handleToggleSelection}
            on:sessionStarted={handleSessionStarted}
            on:sessionStopped={handleSessionStopped}
          />
        {/each}
      </div>
    {/if}
  </main>
</div>

<Modal show={showModal} onClose={closeModal}>
  <TaskForm
    onClose={closeModal}
    on:taskCreated={handleTaskCreated}
    on:taskUpdated={handleTaskUpdated}
    task={editingTask}
  />
</Modal>

{#if showDeleteConfirm}
  <div class="modal-backdrop" on:click={closeDeleteConfirm}>
    <div class="confirm-dialog" on:click|stopPropagation>
      <h2>Confirm Delete</h2>
      <p>
        Are you sure you want to delete
        <strong>{deleteCount}</strong>
        {deleteCount === 1 ? 'task' : 'tasks'}?
      </p>
      <p class="warning">This action cannot be undone.</p>

      <div class="confirm-actions">
        <button on:click={closeDeleteConfirm} class="btn-secondary">
          Cancel
        </button>
        <button on:click={confirmDelete} class="btn-danger" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #E5E7EB;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .error-banner {
    padding: 1rem;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .toolbar-left {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .task-count {
    color: #6B7280;
    font-size: 0.875rem;
  }

  .active-indicator {
    padding: 0.5rem 1rem;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background: #4F46E5;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-primary:hover {
    background: #4338CA;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    background: #6B7280;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4B5563;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-danger {
    padding: 0.75rem 1.5rem;
    background: #DC2626;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-danger:hover:not(:disabled) {
    background: #B91C1C;
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-signout {
    padding: 0.5rem 1rem;
    background: #DC2626;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-signout:hover {
    background: #B91C1C;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #6B7280;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #6B7280;
  }

  .task-list {
    display: grid;
    gap: 1rem;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .confirm-dialog {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
  }

  .confirm-dialog h2 {
    margin: 0 0 1rem 0;
  }

  .confirm-dialog p {
    margin: 0 0 0.5rem 0;
    color: #374151;
  }

  .confirm-dialog .warning {
    color: #DC2626;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .confirm-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem;
    }

    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }

    .toolbar-left {
      flex-direction: column;
    }
  }
</style>