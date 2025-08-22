<template>
  <div>
    <!-- Guide Modal - Only render if we have guides -->
    <GuideModal
      v-if="guides && guides.length > 0"
      :key="`guide-modal-${guides.length}-${loading}`"
    />

    <!-- Main content slot -->
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import { useKnock, useKnockGuides } from "../composables/useKnock.js";
import GuideModal from "./GuideModal.vue";

// Props
const props = defineProps({
  apiKey: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userToken: {
    type: String,
    default: null,
  },
});

// Emits
// NOTE: This event system is used for communicating guide status to parent components
// (like ConfigBanner) and can be safely removed without affecting core guide functionality
const emit = defineEmits(["guides-updated"]);

// Initialize Knock
const { initializeKnock, authenticate, teardown } = useKnock();
const { guides, loading, fetchGuides, startListening, stopListening, cleanup } =
  useKnockGuides();

// Emit guide status updates
// This function is used to communicate guide status to parent components
// and can be removed if you don't need this communication
const emitGuidesUpdated = () => {
  emit("guides-updated", {
    count: guides.value?.length || 0,
    loading: loading.value,
    refresh: () => fetchGuides(),
  });
};

// Watch for guide changes and emit status updates
// This watch is only needed if you want to communicate guide status to parent components
// Removing it won't affect the guide modal functionality
watch(
  [guides, loading],
  () => {
    console.log("🔄 KnockProvider guides changed:", {
      guidesCount: guides.value?.length || 0,
      loading: loading.value,
      guides: guides.value?.map((g) => ({
        id: g.id,
        key: g.key,
        type: g.type,
      })),
    });
    emitGuidesUpdated();
  },
  { immediate: true }
);

// Watch for config changes and re-authenticate
watch(
  () => props.userId,
  (newUserId, oldUserId) => {
    if (newUserId !== oldUserId && newUserId) {
      console.log("🔄 Re-authenticating with new user ID:", newUserId);
      authenticate(newUserId, props.userToken);
    }
  }
);

onMounted(() => {
  console.log("🏗️ KnockProvider mounted for user:", props.userId);

  // Initialize and authenticate - the SDK handles the rest
  initializeKnock(props.apiKey);
  authenticate(props.userId, props.userToken);

  // Fetch guides and start listening
  setTimeout(() => {
    fetchGuides();
    startListening();
  }, 500);
});

onUnmounted(() => {
  stopListening();
  cleanup();
  teardown();
});
</script>
