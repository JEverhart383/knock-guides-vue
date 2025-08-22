<template>
  <Teleport to="body" :disabled="!isMounted">
    <div
      v-if="shouldShowModal"
      class="knock-guide-modal-overlay"
      @click="handleOverlayClick"
      :data-guide-id="step?.id"
      :id="`guide-modal-${step?.id || 'no-guide'}`"
    >
      <div
        class="knock-guide-modal"
        @click.stop
        role="dialog"
        aria-modal="true"
        :aria-labelledby="step?.content?.title ? 'modal-title' : undefined"
      >
        <button
          class="knock-guide-modal__close"
          @click="handleClose"
          aria-label="Close modal"
        >
          ×
        </button>

        <div
          v-if="step?.content?.title"
          class="knock-guide-modal__title"
          id="modal-title"
        >
          {{ step.content.title }}
        </div>

        <div v-if="step?.content?.body" class="knock-guide-modal__body">
          <div v-html="step.content.body"></div>
        </div>

        <div v-if="hasActions" class="knock-guide-modal__actions">
          <button
            v-for="(action, index) in step.content.actions"
            :key="index"
            class="knock-guide-modal__button"
            :class="getButtonClass(action, index)"
            @click="handleActionClick(action)"
          >
            {{ action.label || action.text }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from "vue";
import { useGuide } from "../composables/useGuide.js";

// Use the guide composable to get guide data and determine visibility
const { step, guides } = useGuide({ type: "modal" });

// Track mount state for Teleport
const isMounted = ref(false);

// Self-contained visibility logic - only show when we have a valid guide step
const shouldShowModal = computed(() => {
  return step.value && isMounted.value;
});

// Debug the step
watch(
  step,
  (newStep) => {
    console.log("🎭 GuideModal step changed:", {
      hasStep: !!newStep,
      stepId: newStep?.id,
      stepContent: newStep?.content,
      stepTitle: newStep?.content?.title,
      stepBody: newStep?.content?.body,
      shouldShow: shouldShowModal.value,
    });
  },
  { immediate: true }
);

// Computed properties
const hasActions = computed(() => {
  return step.value?.content?.actions && step.value.content.actions.length > 0;
});

// Methods
const handleOverlayClick = () => {
  handleClose();
};

const handleClose = async () => {
  if (step.value) {
    console.log("🚪 Closing guide modal");

    // Prevent multiple rapid clicks
    if (handleClose._isProcessing) {
      return;
    }
    handleClose._isProcessing = true;

    try {
      // Try SDK's built-in method first, fallback to manual tracking
      console.log("🔍 Attempting to archive step:", step.value);
      console.log(
        "🔍 step.value.markAsArchived exists:",
        !!(step.value && step.value.markAsArchived)
      );

      if (step.value && step.value.markAsArchived) {
        console.log("🗃️ Calling step.value.markAsArchived()");
        await step.value.markAsArchived();
        console.log("✅ Successfully archived step");
      } else {
        console.log("🗃️ Using fallback archive tracking (older SDK)");
        // Fallback - just log for now since we don't have the manual methods in this simplified version
      }
    } catch (err) {
      console.error("❌ Error archiving guide:", err);
      console.error("❌ Error details:", err.message, err.stack);
    } finally {
      // Reset the processing flag after a short delay
      setTimeout(() => {
        handleClose._isProcessing = false;
      }, 500);
    }
  }
};

const handleActionClick = (action) => {
  if (step.value) {
    // Try SDK's built-in method first, fallback to manual tracking
    if (step.value.markAsInteracted) {
      step.value.markAsInteracted({
        metadata: { action: action.label || action.text },
      });
    } else {
      console.log("🤝 Using fallback interaction tracking (older SDK)");
      // Fallback - just log for now since we don't have the manual methods in this simplified version
    }
  }

  // Handle the action (e.g., navigate to URL, call callback)
  if (action.url) {
    window.open(action.url, "_blank");
  } else if (action.action) {
    // If action has a custom handler
    if (typeof action.action === "function") {
      action.action();
    } else if (
      typeof action.action === "string" &&
      action.action.startsWith("http")
    ) {
      window.open(action.action, "_blank");
    }
  }

  // Close modal after interaction
  handleClose();
};

const getButtonClass = (action, index) => {
  const baseClass = "knock-guide-modal__button";

  // First button is typically primary
  if (index === 0) {
    return `${baseClass} ${baseClass}--primary`;
  }

  return `${baseClass} ${baseClass}--secondary`;
};

// Handle escape key
const handleEscape = (event) => {
  if (event.key === "Escape" && step.value) {
    handleClose();
  }
};

// Mark as seen when modal appears
onMounted(() => {
  // Enable Teleport after mount
  isMounted.value = true;

  // Clean up any existing duplicate modals first
  const existingModals = document.querySelectorAll(
    ".knock-guide-modal-overlay"
  );
  if (existingModals.length > 1) {
    existingModals.forEach((modal, index) => {
      if (index > 0) {
        // Keep only the first one
        modal.remove();
      }
    });
  }

  if (step.value) {
    // Try SDK's built-in method first, fallback to manual tracking
    if (step.value.markAsSeen) {
      step.value.markAsSeen();
    } else {
      console.log("📍 Using fallback seen tracking (older SDK)");
      // Fallback - just log for now since we don't have the manual methods in this simplified version
    }
  }

  // Add escape key listener
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);

  // Clean up any duplicate modals that might exist
  const existingModals = document.querySelectorAll(
    ".knock-guide-modal-overlay"
  );
  existingModals.forEach((modal, index) => {
    if (index > 0) {
      // Keep only the first one, remove duplicates
      modal.remove();
    }
  });
});

// Watch for step changes and mark as seen
watch(
  step,
  (newStep, oldStep) => {
    if (newStep && newStep.id !== oldStep?.id) {
      if (newStep.markAsSeen) {
        newStep.markAsSeen();
      } else {
        console.log(
          "📍 Using fallback seen tracking on step change (older SDK)"
        );
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.knock-guide-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.knock-guide-modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.knock-guide-modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.knock-guide-modal__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.knock-guide-modal__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  padding-right: 2rem; /* Space for close button */
}

.knock-guide-modal__body {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #555;
}

.knock-guide-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.knock-guide-modal__button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.knock-guide-modal__button--primary {
  background: #007bff;
  color: white;
}

.knock-guide-modal__button--primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.knock-guide-modal__button--secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.knock-guide-modal__button--secondary:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}
</style>
