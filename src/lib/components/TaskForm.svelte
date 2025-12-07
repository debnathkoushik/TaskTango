<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import type { Task } from '$lib/types'

  const dispatch = createEventDispatcher<{
    taskCreated: Task
    taskUpdated: Task
  }>()

  // Props
  export let onClose: () => void
  export let task: Task | null | undefined = null // Allow null and undefined

  // Form fields
  let title: string = ''
  let description: string = ''
  let status: Task['status'] = 'pending'
  let loading: boolean = false
  let error: string = ''

  // Determine mode
  $: isEditMode = task !== null && task !== undefined

  // Pre-fill form if editing
  onMount(() => {
    if (isEditMode && task) {
      title = task.title || ''
      description = task.description || ''
      status = task.status || 'pending'
    }
  })

  async function handleSubmit(): Promise<void> {
    error = ''
    loading = true

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      console.log('TaskForm - Getting user:', user)

      if (userError) {
        console.error('TaskForm - User error:', userError)
        error = 'Authentication error: ' + userError.message
        loading = false
        return
      }

      if (!user) {
        console.error('TaskForm - No user found')
        error = 'You must be logged in to create/update tasks'
        loading = false
        return
      }

      if (isEditMode) {
        // UPDATE existing task
        await updateTask(user.id)
      } else {
        // CREATE new task
        await createTask(user.id)
      }
    } catch (err) {
      console.error('TaskForm - Unexpected error:', err)
      error = 'An unexpected error occurred'
      loading = false
    }
  }

  async function createTask(userId: string): Promise<void> {
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: title,
        description: description,
        status: 'pending',
      })
      .select()
      .single()

    loading = false

    if (createError) {
      error = createError.message
      return
    }

    // Emit success event
    dispatch('taskCreated', newTask as Task)
    onClose()
  }

  async function updateTask(userId: string): Promise<void> {
    if (!task) {
      error = 'No task to update'
      loading = false
      return
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        title: title,
        description: description,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .eq('user_id', userId) // Security: ensure user owns this task
      .select()
      .single()

    loading = false

    if (updateError) {
      error = updateError.message
      return
    }

    // Emit success event
    dispatch('taskUpdated', updatedTask as Task)
    onClose()
  }

  function handleCancel(): void {
    onClose()
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h2>{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="form-group">
    <label for="title">Title *</label>
    <input
      id="title"
      type="text"
      bind:value={title}
      placeholder="Enter task title"
      disabled={loading}
      required
    />
  </div>

  <div class="form-group">
    <label for="description">Description</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder="Enter task description (optional)"
      disabled={loading}
      rows="4"
    />
  </div>

  {#if isEditMode}
    <div class="form-group">
      <label for="status">Status *</label>
      <select
        id="status"
        bind:value={status}
        disabled={loading}
        required
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  {/if}

  <div class="form-actions">
    <button type="button" on:click={handleCancel} disabled={loading}>
      Cancel
    </button>
    <button type="submit" disabled={loading}>
      {#if loading}
        {isEditMode ? 'Updating...' : 'Creating...'}
      {:else}
        {isEditMode ? 'Update Task' : 'Create Task'}
      {/if}
    </button>
  </div>
</form>

<style>
  form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
  }

  h2 {
    margin: 0 0 1.5rem 0;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #4F46E5;
  }

  textarea {
    resize: vertical;
  }

  select {
    cursor: pointer;
    background: white;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  button[type="button"] {
    background: #E5E7EB;
    color: #374151;
  }

  button[type="submit"] {
    background: #4F46E5;
    color: white;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    padding: 0.75rem;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
</style>