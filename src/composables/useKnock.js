import { ref, computed } from "vue";
import Knock, { KnockGuideClient } from "@knocklabs/client";

// Helper function to convert array to object keyed by 'key' property
const byKey = (items) => {
  return items.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});
};

console.log("✅ Using packaged KnockGuideClient from @knocklabs/client");

// Global state for the Knock client
const knockClient = ref(null);
const isAuthenticated = ref(false);

// Configuration from environment variables
const KNOCK_PUBLIC_API_KEY =
  import.meta.env.VITE_KNOCK_PUBLIC_API_KEY || "YOUR_KNOCK_PUBLIC_API_KEY";
const KNOCK_GUIDE_CHANNEL_ID =
  import.meta.env.VITE_KNOCK_GUIDE_CHANNEL_ID || "YOUR_KNOCK_GUIDE_CHANNEL_ID";

/**
 * Initialize and manage the Knock client
 */
export function useKnock() {
  const initializeKnock = (apiKey = KNOCK_PUBLIC_API_KEY) => {
    if (!knockClient.value) {
      knockClient.value = new Knock(apiKey);
    }
    return knockClient.value;
  };

  const authenticate = (userId, userToken = null) => {
    if (!knockClient.value) {
      initializeKnock();
    }

    console.log("🔐 Authenticating with Knock:", {
      userId,
      userToken: userToken ? "[REDACTED]" : null,
    });
    knockClient.value.authenticate({ id: userId }, userToken);
    isAuthenticated.value = true;
    console.log(
      "✅ Authentication successful for user:",
      knockClient.value.userId
    );
  };

  const teardown = () => {
    if (knockClient.value) {
      knockClient.value.teardown();
      isAuthenticated.value = false;
    }
  };

  return {
    knockClient,
    isAuthenticated,
    initializeKnock,
    authenticate,
    teardown,
  };
}

// Global guide client instance (shared across all components)
let globalGuideClient = null;

// COMMENTED OUT: Global fallback state (shared across all components)
// const globalFallbackGuides = ref([]);
// const globalFallbackLoading = ref(false);
// const globalFallbackError = ref(null);

/**
 * Use Knock Guides via the packaged SDK
 */
export function useKnockGuides(channelId = KNOCK_GUIDE_CHANNEL_ID) {
  console.log("🔍 useKnockGuides called with:", {
    globalGuideClient: !!globalGuideClient,
    knockClientValue: !!knockClient.value,
    isAuthenticated: isAuthenticated.value,
    channelId,
  });

  // COMMENTED OUT: Use global fallback state
  // const fallbackGuides = globalFallbackGuides;
  // const fallbackLoading = globalFallbackLoading;
  // const fallbackError = globalFallbackError;

  // Create a reactive trigger for the TanStack store
  const storeUpdateTrigger = ref(0);

  // Initialize the packaged KnockGuideClient
  if (!globalGuideClient && knockClient.value && isAuthenticated.value) {
    console.log("🏗️ Initializing packaged KnockGuideClient");

    try {
      globalGuideClient = new KnockGuideClient(knockClient.value, channelId);
      console.log(
        "✅ Successfully initialized packaged guides client:",
        globalGuideClient
      );

      // Subscribe to store changes to trigger Vue reactivity
      globalGuideClient.store.subscribe(() => {
        console.log("🔄 TanStack store updated, triggering Vue reactivity");
        storeUpdateTrigger.value++;
      });
    } catch (error) {
      console.error("❌ Failed to initialize packaged guides client:", error);
      console.log("📡 Falling back to API method");
      globalGuideClient = null;
    }
  } else {
    console.log("🔍 Skipping initialization because:", {
      globalGuideClientExists: !!globalGuideClient,
      knockClientExists: !!knockClient.value,
      isAuthenticated: isAuthenticated.value,
    });
  }

  // Check if we have the advanced guide client, otherwise fall back to basic implementation
  const hasAdvancedGuideClient =
    globalGuideClient &&
    globalGuideClient.store &&
    globalGuideClient.selectGuides;

  // Debug logging
  console.log("🔍 Debug info:", {
    globalGuideClient: !!globalGuideClient,
    hasStore: !!(globalGuideClient && globalGuideClient.store),
    hasSelectGuides: !!(globalGuideClient && globalGuideClient.selectGuides),
    hasAdvancedGuideClient,
    knockClientValue: !!knockClient.value,
    isAuthenticated: isAuthenticated.value,
  });

  // Reactive state from the SDK's TanStack store or fallback
  const guides = computed(() => {
    // Access the trigger to make this computed reactive to store changes
    storeUpdateTrigger.value;

    // Re-check if we have the advanced guide client (it might have been initialized after the initial check)
    const currentHasAdvancedGuideClient =
      globalGuideClient &&
      globalGuideClient.store &&
      globalGuideClient.selectGuides;

    if (currentHasAdvancedGuideClient) {
      const state = globalGuideClient.store.state;
      const selectedGuides = globalGuideClient.selectGuides(state);
      return selectedGuides;
    }

    // COMMENTED OUT: Fallback to manual guides
    // console.log("🔍 useKnockGuides guides (fallback):", fallbackGuides.value);
    // return fallbackGuides.value;

    // Return empty array if SDK not available
    console.warn("SDK not available, returning empty guides array");
    return [];
  });

  const loading = computed(() => {
    if (hasAdvancedGuideClient) {
      const state = globalGuideClient.store.state;
      return Object.values(state.queries).some(
        (query) => query.status === "loading"
      );
    }

    // COMMENTED OUT: Fallback loading state
    // return fallbackLoading.value;

    // Return false if SDK not available
    return false;
  });

  const error = computed(() => {
    if (hasAdvancedGuideClient) {
      const state = globalGuideClient.store.state;
      const errorQuery = Object.values(state.queries).find(
        (query) => query.status === "error"
      );
      return errorQuery?.error?.message || null;
    }

    // COMMENTED OUT: Fallback error state
    // return fallbackError.value;

    // Return null if SDK not available
    return null;
  });

  const fetchGuides = async (filters = {}) => {
    // Check if we can initialize the guide client now (in case authentication happened after useKnockGuides was called)
    if (!globalGuideClient && knockClient.value && isAuthenticated.value) {
      console.log(
        "🏗️ Late initialization of KnockGuideClient during fetchGuides"
      );

      try {
        globalGuideClient = new KnockGuideClient(knockClient.value, channelId);
        console.log(
          "✅ Successfully initialized packaged guides client (late init)"
        );

        // Subscribe to store changes to trigger Vue reactivity
        globalGuideClient.store.subscribe(() => {
          console.log("🔄 TanStack store updated, triggering Vue reactivity");
          storeUpdateTrigger.value++;
        });
      } catch (error) {
        console.error(
          "❌ Failed to initialize packaged guides client (late init):",
          error
        );
        globalGuideClient = null;
      }
    }

    // Now check if we have the advanced guide client
    const currentHasAdvancedGuideClient =
      globalGuideClient &&
      globalGuideClient.store &&
      globalGuideClient.selectGuides;

    if (currentHasAdvancedGuideClient) {
      console.log("📡 Fetching guides using packaged KnockGuideClient");
      try {
        await globalGuideClient.fetch({ filters });
        console.log("✅ Guides fetched successfully using packaged client");
      } catch (err) {
        console.error("❌ Error fetching guides with packaged client:", err);
      }
    } else {
      console.log(
        "❌ Cannot fetch guides - KnockGuideClient not available and not authenticated"
      );
    }
  };

  const startListening = () => {
    // Re-check if we have the advanced guide client (it might have been initialized after the initial check)
    const currentHasAdvancedGuideClient =
      globalGuideClient &&
      globalGuideClient.store &&
      globalGuideClient.selectGuides;

    if (currentHasAdvancedGuideClient) {
      console.log("🚀 Starting real-time guide updates via packaged client");
      globalGuideClient.subscribe();
    } else {
      console.log(
        "🚀 Real-time updates not available - no advanced guide client"
      );
    }
  };

  const stopListening = () => {
    // Re-check if we have the advanced guide client
    const currentHasAdvancedGuideClient =
      globalGuideClient &&
      globalGuideClient.store &&
      globalGuideClient.selectGuides;

    if (currentHasAdvancedGuideClient) {
      console.log("🛑 Stopping real-time guide updates");
      globalGuideClient.unsubscribe();
    } else {
      console.log("🛑 No real-time connection to stop");
    }
  };

  const cleanup = () => {
    if (globalGuideClient && globalGuideClient.cleanup) {
      globalGuideClient.cleanup();
    }
    globalGuideClient = null;

    // COMMENTED OUT: Fallback state reset
    // fallbackGuides.value = [];
    // fallbackLoading.value = false;
    // fallbackError.value = null;
  };

  return {
    guides,
    loading,
    error,
    fetchGuides,
    startListening,
    stopListening,
    cleanup,
    // Expose the guide client for advanced usage
    guideClient: globalGuideClient,
  };
}
