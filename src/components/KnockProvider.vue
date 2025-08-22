<template>
  <div>
    <!-- Guide Modal - Only render if we have guides -->
    <GuideModal 
      v-if="guides && guides.length > 0"
      :type="guideConfig?.type"
      :guide-key="guideConfig?.key"
      :key="`guide-modal-${guides.length}-${loading}`"
    />
    
    <!-- Main content slot -->
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useKnock, useKnockGuides } from '../composables/useKnock.js'
import GuideModal from './GuideModal.vue'

// Props
const props = defineProps({
  apiKey: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userToken: {
    type: String,
    default: null
  },
  guideConfig: {
    type: Object,
    default: () => ({ type: 'modal', key: null })
  }
})

// Emits
const emit = defineEmits(['guides-updated'])

// Initialize Knock
const { initializeKnock, authenticate, teardown } = useKnock()
const { guides, loading, fetchGuides, startListening, stopListening, cleanup } = useKnockGuides()

// Provide guide config to child components
provide('guideConfig', props.guideConfig)

// Emit guide status updates
const emitGuidesUpdated = () => {
  emit('guides-updated', {
    count: guides.value?.length || 0,
    loading: loading.value,
    refresh: () => fetchGuides()
  })
}

// Watch for guide changes
watch([guides, loading], () => {
  console.log('🔄 KnockProvider guides changed:', {
    guidesCount: guides.value?.length || 0,
    loading: loading.value,
    guides: guides.value?.map(g => ({ id: g.id, key: g.key, type: g.type }))
  })
  emitGuidesUpdated()
}, { immediate: true })

// Watch for config changes and re-authenticate
watch(() => props.userId, (newUserId, oldUserId) => {
  if (newUserId !== oldUserId && newUserId) {
    console.log('🔄 Re-authenticating with new user ID:', newUserId)
    authenticate(newUserId, props.userToken)
  }
})

onMounted(() => {
  console.log('🏗️ KnockProvider mounted for user:', props.userId)
  
  // Initialize and authenticate - the SDK handles the rest
  initializeKnock(props.apiKey)
  authenticate(props.userId, props.userToken)
  
  // Fetch guides and start listening
  setTimeout(() => {
    fetchGuides()
    startListening()
  }, 500)
})

onUnmounted(() => {
  stopListening()
  cleanup()
  teardown()
})
</script>
