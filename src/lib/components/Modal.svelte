<script lang="ts">
  export let show = false
  export let onClose: () => void

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose()
    }
  }
</script>

<svelte:window on:keydown={handleEscape} />

{#if show}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-content">
      <slot />
    </div>
  </div>
{/if}

<style>
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

  .modal-content {
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
</style>