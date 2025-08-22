<template>
  <div class="config-banner">
    <div class="config-banner__container">
      <div class="config-banner__section">
        <label for="userId" class="config-banner__label">User ID:</label>
        <input 
          id="userId"
          v-model="localUserId"
          type="text" 
          class="config-banner__input"
          placeholder="Enter user ID"
          @blur="updateUserId"
          @keyup.enter="updateUserId"
        />
      </div>
      
      <div class="config-banner__section">
        <button 
          class="config-banner__button"
          @click="refreshGuides"
          :disabled="loading"
        >
          {{ loading ? 'Refreshing...' : 'Refresh Guides' }}
        </button>
      </div>
      
      <div class="config-banner__status">
        <span class="config-banner__status-item">
          <strong>Active Config:</strong> 
          User {{ currentUserId || 'None' }}, 
          Type "modal"
        </span>
        <span class="config-banner__status-item" :class="{ 
          'config-banner__status-item--success': guidesCount > 0,
          'config-banner__status-item--warning': guidesCount === 0
        }">
          <strong>Guides Found:</strong> {{ guidesCount }}
        </span>        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  guidesCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:userId', 'refresh'])

// Local state
const localUserId = ref(props.userId)
const currentUserId = ref(props.userId)

// Watch for prop changes
watch(() => props.userId, (newUserId) => {
  localUserId.value = newUserId
  currentUserId.value = newUserId
})

// Methods
const updateUserId = () => {
  if (localUserId.value !== currentUserId.value) {
    currentUserId.value = localUserId.value
    emit('update:userId', localUserId.value)
  }
}

const refreshGuides = () => {
  emit('refresh')
}
</script>

<style scoped>
.config-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 20px rgba(102, 126, 234, 0.3);
  position: sticky;
  top: 0;
  z-index: 100000000; /* High z-index to stay above modals */
}

.config-banner__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.config-banner__section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.config-banner__label {
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.9rem;
}

.config-banner__input {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 120px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.config-banner__input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.config-banner__button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.config-banner__button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.config-banner__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.config-banner__status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: auto;
  text-align: right;
  font-size: 0.85rem;
}

.config-banner__status-item {
  display: block;
}

.config-banner__status-item--success {
  color: #90EE90;
}

.config-banner__status-item--warning {
  color: #FFD700;
}

/* Responsive design */
@media (max-width: 768px) {
  .config-banner__container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .config-banner__section {
    justify-content: space-between;
  }
  
  .config-banner__status {
    text-align: left;
    margin-left: 0;
  }
}
</style>
