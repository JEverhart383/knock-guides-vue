import { computed, inject } from "vue";
import { useKnockGuides } from "./useKnock.js";

/**
 * Use Knock SDK's built-in guide selector - equivalent to React's useGuide hook
 */
export function useGuide(options = {}) {
  let { type, key } = options;

  // Try to get guide config from provider if not passed as options
  const injectedGuideConfig = inject("guideConfig", null);
  if (injectedGuideConfig && !type && !key) {
    type = injectedGuideConfig.type;
    key = injectedGuideConfig.key;
  }

  const { guideClient, guides } = useKnockGuides();

  // Use the SDK's built-in selector or fallback to manual selection
  const step = computed(() => {
    // Try advanced SDK selector first
    if (guideClient && guideClient.store && guideClient.selectGuides) {
      const state = guideClient.store.state;
      const filters = {};
      if (type) filters.type = type;
      if (key) filters.key = key;

      console.log("🔍 useGuide selectGuides with:", {
        filters,
        state: !!state,
      });
      const selectedGuides = guideClient.selectGuides(state, filters);
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

    // Fallback to manual selection for older SDK versions
    // COMMENTED OUT: Manual fallback selection logic
    /*
    const allGuides = guides.value;
    if (!allGuides || allGuides.length === 0) return null;

    let selectedGuide = null;

    if (key) {
      selectedGuide = allGuides.find((guide) => guide.key === key) || null;
    } else if (type) {
      const matchingGuides = allGuides.filter((guide) => guide.type === type);
      if (matchingGuides.length === 0) {
        selectedGuide = allGuides[0] || null; // Fallback
      } else {
        selectedGuide = matchingGuides.sort((a, b) => {
          if (a.priority && b.priority) return b.priority - a.priority;
          if (a.created_at && b.created_at)
            return new Date(b.created_at) - new Date(a.created_at);
          return 0;
        })[0];
      }
    } else {
      selectedGuide = allGuides[0] || null;
    }

    return selectedGuide;
    */

    // If SDK is not available, return null
    console.warn("SDK guide client not available, returning null");
    return null;
  });

  return {
    step,
    guides,
  };
}
