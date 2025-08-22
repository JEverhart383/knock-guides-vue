<template>
  <div
    v-if="shouldShowBanner"
    class="knock-guide-banner"
    :data-knock-color-mode="colorMode"
    :data-guide-id="step?.id"
    :id="`guide-banner-${step?.id || 'no-guide'}`"
  >
    <div class="knock-guide-banner__message">
      <div class="knock-guide-banner__title">
        {{ step?.content?.title }}
      </div>
      <div class="knock-guide-banner__body" v-html="step?.content?.body"></div>
    </div>

    <div class="knock-guide-banner__actions">
      <button
        v-if="step?.content?.secondary_button"
        class="knock-guide-banner__action knock-guide-banner__action--secondary"
        @click="
          handleButtonClick('secondary_button', step.content.secondary_button)
        "
      >
        {{ step.content.secondary_button.text }}
      </button>

      <button
        v-if="step?.content?.primary_button"
        class="knock-guide-banner__action"
        @click="
          handleButtonClick('primary_button', step.content.primary_button)
        "
      >
        {{ step.content.primary_button.text }}
      </button>

      <button
        v-if="step?.content?.dismissible"
        class="knock-guide-banner__close"
        @click="handleDismiss"
        aria-label="Dismiss banner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
        >
          <g fill="#60646C" fillRule="evenodd" clipRule="evenodd">
            <path
              d="M14.03 3.97a.75.75 0 0 1 0 1.06l-9 9a.75.75 0 0 1-1.06-1.06l9-9a.75.75 0 0 1 1.06 0Z"
            />
            <path
              d="M3.97 3.97a.75.75 0 0 1 1.06 0l9 9a.75.75 0 1 1-1.06 1.06l-9-9a.75.75 0 0 1 0-1.06Z"
            />
          </g>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, inject } from "vue";
import { useGuide } from "../composables/useGuide.js";

// Inject channelId from KnockProvider
const channelId = inject("knockChannelId");

// Props
const props = defineProps({
  guideKey: {
    type: String,
    default: null,
  },
  colorMode: {
    type: String,
    default: "light",
    validator: (value) => ["light", "dark"].includes(value),
  },
});

// Emits
const emit = defineEmits(["button-click", "dismiss"]);

// Use the guide composable to get guide data and determine visibility
const { step, guides } = useGuide({
  type: "banner",
  key: props.guideKey,
  channelId: channelId,
});

// Track mount state
const isMounted = ref(false);

// Self-contained visibility logic - only show when we have a valid guide step
const shouldShowBanner = computed(() => {
  return step.value && isMounted.value;
});

// Debug the step
watch(
  step,
  (newStep) => {
    console.log("🎭 GuideBanner step changed:", {
      hasStep: !!newStep,
      stepId: newStep?.id,
      stepContent: newStep?.content,
      stepTitle: newStep?.content?.title,
      stepBody: newStep?.content?.body,
      shouldShow: shouldShowBanner.value,
    });
  },
  { immediate: true }
);

// Methods
const handleButtonClick = async (buttonType, button) => {
  if (step.value) {
    console.log("🔘 Banner button clicked:", { buttonType, button });

    try {
      // Try SDK's built-in method first
      if (step.value.markAsInteracted) {
        const metadata = {
          ...button,
          type: "button_click",
          button_type: buttonType,
        };
        await step.value.markAsInteracted({ metadata });
        console.log("✅ Successfully marked button as interacted");
      } else {
        console.log("🤝 Using fallback interaction tracking (older SDK)");
      }
    } catch (err) {
      console.error("❌ Error marking button as interacted:", err);
    }

    // Emit the button click event
    emit("button-click", {
      button,
      step: step.value,
      buttonType,
    });

    // Handle the action (e.g., navigate to URL)
    if (button.action) {
      if (
        typeof button.action === "string" &&
        button.action.startsWith("http")
      ) {
        window.open(button.action, "_blank");
      } else if (typeof button.action === "function") {
        button.action();
      }
    }
  }
};

const handleDismiss = async () => {
  if (step.value) {
    console.log("🚪 Dismissing guide banner");

    try {
      // Try SDK's built-in method first
      if (step.value.markAsArchived) {
        await step.value.markAsArchived();
        console.log("✅ Successfully archived banner step");
      } else {
        console.log("🗃️ Using fallback archive tracking (older SDK)");
      }
    } catch (err) {
      console.error("❌ Error archiving banner:", err);
    }

    // Emit the dismiss event
    emit("dismiss", {
      step: step.value,
    });
  }
};

// Mark as seen when banner appears
onMounted(() => {
  isMounted.value = true;

  if (step.value) {
    // Try SDK's built-in method first
    if (step.value.markAsSeen) {
      step.value.markAsSeen();
      console.log("📍 Banner marked as seen");
    } else {
      console.log("📍 Using fallback seen tracking (older SDK)");
    }
  }
});

// Watch for step changes and mark as seen
watch(
  step,
  (newStep, oldStep) => {
    if (newStep && newStep.id !== oldStep?.id) {
      if (newStep.markAsSeen) {
        newStep.markAsSeen();
        console.log("📍 Banner step marked as seen on change");
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
.knock-guide-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--knock-guide-surface, #ffffff);
  padding: var(--knock-spacing-4, 1rem) var(--knock-spacing-6, 1.5rem);
  border-radius: var(--knock-rounded-4, 0.5rem);
  border: 0.5px solid var(--knock-guide-border, #e5e7eb);
  box-shadow: var(--knock-shadow-2, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  gap: var(--knock-spacing-4, 1rem);
  margin: 1rem 0;
}

.knock-guide-banner__message {
  min-width: var(--knock-spacing-96, 24rem);
  flex: 1;
}

.knock-guide-banner__title {
  color: var(--knock-guide-content, #1f2937);
  font-size: var(--knock-text-4, 1.125rem);
  font-weight: var(--knock-weight-medium, 500);
  line-height: var(--knock-leading-4, 1.5);
  margin: 0 0 0.5rem 0;
}

.knock-guide-banner__body {
  color: var(--knock-guide-content-light, #6b7280);
  font-size: var(--knock-text-3, 1rem);
  font-weight: var(--knock-weight-regular, 400);
  line-height: var(--knock-leading-3, 1.5);
  margin: 0;
}

.knock-guide-banner__body > :first-child {
  margin-top: 0;
}

.knock-guide-banner__body > :last-child {
  margin-bottom: 0;
}

.knock-guide-banner__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--knock-spacing-3, 0.75rem);
  flex-shrink: 0;
}

.knock-guide-banner__action {
  text-decoration: none;
  font-size: var(--knock-text-3, 1rem);
  font-weight: var(--knock-weight-regular, 400);
  line-height: var(--knock-leading-3, 1.5);
  border-radius: var(--knock-rounded-3, 0.375rem);
  padding: 0 var(--knock-spacing-4, 1rem);
  box-sizing: border-box;
  height: var(--knock-spacing-10, 2.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.5px solid var(--knock-guide-accent, #3b82f6);
  background: var(--knock-guide-accent, #3b82f6);
  color: var(--knock-guide-content-contrast, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
}

.knock-guide-banner__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.knock-guide-banner__action--secondary {
  border-color: var(--knock-guide-border-dark, #d1d5db);
  background: var(--knock-guide-surface, #ffffff);
  color: var(--knock-guide-content, #1f2937);
}

.knock-guide-banner__action--secondary:hover {
  background: var(--knock-guide-surface-hover, #f9fafb);
}

.knock-guide-banner__close {
  padding: var(--knock-spacing-3, 0.75rem);
  border: none;
  background: none;
  line-height: 0;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.knock-guide-banner__close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Dark mode support */
.knock-guide-banner[data-knock-color-mode="dark"] {
  background: var(--knock-guide-surface-dark, #1f2937);
  border-color: var(--knock-guide-border-dark, #374151);
}

.knock-guide-banner[data-knock-color-mode="dark"] .knock-guide-banner__title {
  color: var(--knock-guide-content-dark, #f9fafb);
}

.knock-guide-banner[data-knock-color-mode="dark"] .knock-guide-banner__body {
  color: var(--knock-guide-content-light-dark, #d1d5db);
}

.knock-guide-banner[data-knock-color-mode="dark"]
  .knock-guide-banner__action--secondary {
  border-color: var(--knock-guide-border-dark, #4b5563);
  background: var(--knock-guide-surface-dark, #374151);
  color: var(--knock-guide-content-dark, #f9fafb);
}

.knock-guide-banner[data-knock-color-mode="dark"]
  .knock-guide-banner__action--secondary:hover {
  background: var(--knock-guide-surface-hover-dark, #4b5563);
}

.knock-guide-banner[data-knock-color-mode="dark"]
  .knock-guide-banner__close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
