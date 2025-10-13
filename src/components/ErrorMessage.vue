<template>
  <div v-if="error" class="error-message">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <h3 class="error-title">Une erreur s'est produite</h3>
        <p class="error-description">{{ error }}</p>
        <button @click="retry" class="retry-btn" v-if="showRetry">🔄 Réessayer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: '',
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['retry'])

const retry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  z-index: 1000;
  text-align: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.error-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #e74c3c;
  margin: 0 0 0.5rem 0;
}

.error-description {
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .error-message {
    padding: 1.5rem;
  }

  .error-icon {
    font-size: 2.5rem;
  }

  .error-title {
    font-size: 1.1rem;
  }
}
</style>
