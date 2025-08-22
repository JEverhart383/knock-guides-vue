import { ref, computed } from "vue";
import Knock, { KnockGuideClient } from "@knocklabs/client";

console.log("✅ Using packaged KnockGuideClient from @knocklabs/client");

// Global state for the Knock client
const knockClient = ref(null);
const isAuthenticated = ref(false);

/**
 * Initialize and manage the Knock client
 */
export function useKnock() {
  const initializeKnock = (apiKey) => {
    if (!apiKey) {
      throw new Error("API key is required to initialize Knock");
    }

    if (!knockClient.value) {
      knockClient.value = new Knock(apiKey);
    }
    return knockClient.value;
  };

  const authenticate = (userId, userToken = null) => {
    if (!userId) {
      throw new Error("User ID is required for authentication");
    }

    if (!knockClient.value) {
      throw new Error("Knock client must be initialized before authentication");
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
export function useKnockGuides(channelId = null) {
  // Single computed property that automatically updates
  const isGuideClientInitialized = computed(
    () =>
      knockGuideClient.value &&
      knockGuideClient.value.store &&
      knockGuideClient.value.selectGuides
  );

  // Initialize the packaged KnockGuideClient when channelId is available
  const initializeGuideClient = (newChannelId) => {
    if (!newChannelId) {
      console.warn("Cannot initialize guide client without channel ID");
      return;
    }

    if (!knockClient.value || !isAuthenticated.value) {
      console.log("Cannot initialize guide client - not authenticated yet");
      return;
    }

    if (!knockGuideClient.value) {
      console.log("🏗️ Initializing packaged KnockGuideClient");

      try {
        knockGuideClient.value = new KnockGuideClient(
          knockClient.value,
          newChannelId
        );
        console.log(
          "✅ Successfully initialized packaged guides client:",
          knockGuideClient.value
        );

        // Subscribe to store changes - Vue automatically handles reactivity
        knockGuideClient.value.store.subscribe(() => {
          // Vue automatically handles reactivity
        });
      } catch (error) {
        console.error("❌ Failed to initialize packaged guides client:", error);
        knockGuideClient.value = null;
      }
    }
  };

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
    if (
      !knockGuideClient.value &&
      knockClient.value &&
      isAuthenticated.value &&
      channelId
    ) {
      initializeGuideClient(channelId);
    }

    // Now check if we have the guide client
    if (isGuideClientInitialized.value) {
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
    // Expose the initialization function
    initializeGuideClient,
  };
}
