<script>
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'

  export let form

  let email = ''
  let password = ''
  let loading = false
</script>

<div class="container">
  <div class="auth-card">
    <h1>Sign In</h1>

    {#if form?.error}
      <div class="error">{form.error}</div>
    {/if}

    <form
      method="POST"
      use:enhance={() => {
        loading = true
        return async ({ result, update }) => {
          loading = false
          if (result.type === 'redirect') {
            goto(result.location)
          } else {
            await update()
          }
        }
      }}
    >
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
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
          name="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    <p class="auth-link">
      Don't have an account? <a href="/signup">Sign up</a>
    </p>

    <p class="auth-link">
      <a href="/forgot-password">Forgot password?</a>
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

  .auth-link {
    margin-top: 1rem;
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