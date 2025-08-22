import { computed } from "vue";
import { useKnockGuides } from "./useKnock.js";

/**
 * Use Knock SDK's built-in guide selector - equivalent to React's useGuide hook
 */
export function useGuide(options = {}) {
  let { type, key } = options;

  const { guideClient, guides } = useKnockGuides();

  // Use the SDK's built-in selector
  const step = computed(() => {
    // Try advanced SDK selector first
    if (
      guideClient.value &&
      guideClient.value.store &&
      guideClient.value.selectGuides
    ) {
      const state = guideClient.value.store.state;
      const filters = {};
      if (type) filters.type = type;
      if (key) filters.key = key;

      console.log("🔍 useGuide selectGuides with:", {
        filters,
        state: !!state,
      });
      const selectedGuides = guideClient.value.selectGuides(state, filters);
      console.log("🔍 selectGuides returned:", selectedGuides);

      // selectGuides returns an array, get the first guide
      if (selectedGuides && selectedGuides.length > 0) {
        const selectedGuide = selectedGuides[0];

        // The guide has steps, we need to get the first unarchived step
        if (
          selectedGuide &&
          selectedGuide.steps &&
          selectedGuide.steps.length > 0
        ) {
          const guideStep = selectedGuide.steps.find(
            (step) => !step.message.archived_at
          );
          console.log("🔍 Found unarchived step:", guideStep);
          return guideStep || null;
        }

        return selectedGuide || null;
      }

      return null;
    }

    // If SDK is not available, return null
    console.warn("SDK guide client not available, returning null");
    return null;
  });

  return {
    step,
    guides,
  };
}
