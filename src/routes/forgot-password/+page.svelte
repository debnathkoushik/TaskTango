<script>
  import { supabase } from '$lib/supabaseClient'

  let email = ''
  let loading = false
  let error = ''
  let success = ''

  async function handleResetPassword() {
    error = ''
    success = ''

    if (!email) {
      error = 'Please enter your email'
      return
    }

    loading = true

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    loading = false

    if (resetError) {
      error = resetError.message
      return
    }

    success = 'Check your email for the password reset link!'
  }
</script>

<div class="container">
  <div class="auth-card">
    <h1>Reset Password</h1>
    <p class="subtitle">Enter your email and we'll send you a reset link</p>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if success}
      <div class="success">{success}</div>
    {/if}

    <form on:submit|preventDefault={handleResetPassword}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>

    <p class="auth-link">
      <a href="/login">Back to sign in</a>
    </p>
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background: #4F46E5;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
  }

  .error {
    padding: 0.75rem;
    background: #FEE2E2;
    color: #DC2626;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .success {
    padding: 0.75rem;
    background: #D1FAE5;
    color: #059669;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .auth-link {
    margin-top: 1.5rem;
    text-align: center;
  }

  .auth-link a {
    color: #4F46E5;
    text-decoration: none;
  }
</style>