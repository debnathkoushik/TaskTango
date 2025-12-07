<script>
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'

  let email = ''
  let password = ''
  let confirmPassword = ''
  let loading = false
  let error = ''
  let success = ''

  async function handleSignUp() {
    error = ''
    success = ''

    if (!email || !password) {
      error = 'Please fill in all fields'
      return
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters'
      return
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      return
    }

    loading = true

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    loading = false

    if (signUpError) {
      error = signUpError.message
      return
    }

    if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        error = 'This email is already registered. Please sign in instead.'
      } else if (!data.session) {
        success = 'Check your email to confirm your account!'
      } else {
        goto('/dashboard')
      }
    }
  }
</script>

<div class="container">
  <div class="auth-card">
    <h1>Sign Up</h1>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if success}
      <div class="success">{success}</div>
    {/if}

    <form on:submit|preventDefault={handleSignUp}>
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

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>

    <p class="auth-link">
      Already have an account? <a href="/login">Sign in</a>
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
    margin-bottom: 1.5rem;
    text-align: center;
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

  input:focus {
    outline: none;
    border-color: #4F46E5;
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
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #4338CA;
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
    color: #666;
  }

  .auth-link a {
    color: #4F46E5;
    text-decoration: none;
  }

  .auth-link a:hover {
    text-decoration: underline;
  }
</style>