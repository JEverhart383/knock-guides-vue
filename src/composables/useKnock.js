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
const knockGuideClient = ref(null);

/**
 * Use Knock Guides via the packaged SDK
 */
export function useKnockGuides(channelId = KNOCK_GUIDE_CHANNEL_ID) {
  console.log("🔍 useKnockGuides called with:", {
    knockGuideClient: !!knockGuideClient.value,
    knockClientValue: !!knockClient.value,
    isAuthenticated: isAuthenticated.value,
    channelId,
  });

  // Single computed property that automatically updates
  const isGuideClientInitialized = computed(
    () =>
      knockGuideClient.value &&
      knockGuideClient.value.store &&
      knockGuideClient.value.selectGuides
  );

  // Initialize the packaged KnockGuideClient
  if (!knockGuideClient.value && knockClient.value && isAuthenticated.value) {
    console.log("🏗️ Initializing packaged KnockGuideClient");

    try {
      knockGuideClient.value = new KnockGuideClient(
        knockClient.value,
        channelId
      );
      console.log(
        "✅ Successfully initialized packaged guides client:",
        knockGuideClient.value
      );

      // Subscribe to store changes - Vue automatically handles reactivity
      knockGuideClient.value.store.subscribe(() => {
        console.log(
          "🔄 TanStack store updated, Vue reactivity handled automatically"
        );
      });
    } catch (error) {
      console.error("❌ Failed to initialize packaged guides client:", error);
      console.log("📡 Falling back to API method");
      knockGuideClient.value = null;
    }
  } else {
    console.log("🔍 Skipping initialization because:", {
      knockGuideClientExists: !!knockGuideClient.value,
      knockClientExists: !!knockClient.value,
      isAuthenticated: isAuthenticated.value,
    });
  }

  // Debug logging
  console.log("🔍 Debug info:", {
    knockGuideClient: !!knockGuideClient.value,
    hasStore: !!(knockGuideClient.value && knockGuideClient.value.store),
    hasSelectGuides: !!(
      knockGuideClient.value && knockGuideClient.value.selectGuides
    ),
    isGuideClientInitialized: isGuideClientInitialized.value,
    knockClientValue: !!knockClient.value,
    isAuthenticated: isAuthenticated.value,
  });

  // Reactive state from the SDK's TanStack store
  const guides = computed(() => {
    if (isGuideClientInitialized.value) {
      const state = knockGuideClient.value.store.state;
      const selectedGuides = knockGuideClient.value.selectGuides(state);
      return selectedGuides;
    }

    console.warn("SDK not available, returning empty guides array");
    return [];
  });

  const loading = computed(() => {
    if (isGuideClientInitialized.value) {
      const state = knockGuideClient.value.store.state;
      return Object.values(state.queries).some(
        (query) => query.status === "loading"
      );
    }

    return false;
  });

  const error = computed(() => {
    if (isGuideClientInitialized.value) {
      const state = knockGuideClient.value.store.state;
      const errorQuery = Object.values(state.queries).find(
        (query) => query.status === "error"
      );
      return errorQuery?.error?.message || null;
    }

    return null;
  });

  const fetchGuides = async (filters = {}) => {
    // Check if we can initialize the guide client now (in case authentication happened after useKnockGuides was called)
    if (!knockGuideClient.value && knockClient.value && isAuthenticated.value) {
      console.log(
        "🏗️ Late initialization of KnockGuideClient during fetchGuides"
      );

      try {
        knockGuideClient.value = new KnockGuideClient(
          knockClient.value,
          channelId
        );
        console.log(
          "✅ Successfully initialized packaged guides client (late init)"
        );

        // Subscribe to store changes - Vue automatically handles reactivity
        knockGuideClient.value.store.subscribe(() => {
          console.log(
            "🔄 TanStack store updated, Vue reactivity handled automatically"
          );
        });
      } catch (error) {
        console.error(
          "❌ Failed to initialize packaged guides client (late init):",
          error
        );
        knockGuideClient.value = null;
      }
    }

    // Now check if we have the guide client
    if (isGuideClientInitialized.value) {
      console.log("📡 Fetching guides using packaged KnockGuideClient");
      try {
        await knockGuideClient.value.fetch({ filters });
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
    if (isGuideClientInitialized.value) {
      console.log("🚀 Starting real-time guide updates via packaged client");
      knockGuideClient.value.subscribe();
    } else {
      console.log("🚀 Real-time updates not available - no guide client");
    }
  };

  const stopListening = () => {
    if (isGuideClientInitialized.value) {
      console.log("🛑 Stopping real-time guide updates");
      knockGuideClient.value.unsubscribe();
    } else {
      console.log("🛑 No real-time connection to stop");
    }
  };

  const cleanup = () => {
    if (knockGuideClient.value && knockGuideClient.value.cleanup) {
      knockGuideClient.value.cleanup();
    }
    knockGuideClient.value = null;
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
    guideClient: knockGuideClient,
  };
}
