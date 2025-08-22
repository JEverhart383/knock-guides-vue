<template>
  <div class="app-wrapper">
    <ConfigBanner
      :user-id="knockConfig.userId"
      :guides-count="guidesCount"
      :loading="guidesLoading"
      @update:userId="updateUserId"
      @refresh="refreshGuides"
    />

    <KnockProvider
      :api-key="knockConfig.apiKey"
      :user-id="knockConfig.userId"
      :user-token="knockConfig.userToken"
      :channel-id="knockConfig.channelId"
      @guides-updated="handleGuidesUpdated"
    >
      <div class="app">
        <header class="app-header">
          <h1>Vue.js Knock Guide Demo</h1>
          <p>This demo shows modal guides and banner guides</p>
        </header>

        <main class="app-main">
          <div class="content-section">
            <h2>Welcome to the Demo</h2>
            <p>
              This application demonstrates how to integrate Knock guides into a
              Vue.js application. The modal and banner should appear
              automatically when you load the page if you have guides configured
              in your Knock dashboard.
            </p>

            <div class="demo-info">
              <h3>How it works:</h3>
              <ul>
                <li>The app initializes the Knock client with your API key</li>
                <li>It authenticates a demo user</li>
                <li>It fetches guides with type "modal" and "banner"</li>
                <li>
                  When a guide is found, the modal or banner automatically
                  appears
                </li>
                <li>
                  User interactions (seen, interacted, archived) are tracked
                  automatically
                </li>
              </ul>
            </div>

            <div class="configuration">
              <h3>Configuration:</h3>
              <p><strong>API Key:</strong> {{ knockConfig.apiKey }}</p>
              <p><strong>User ID:</strong> {{ knockConfig.userId }}</p>
              <p><strong>Channel ID:</strong> {{ knockConfig.channelId }}</p>
              <p><strong>Guide Types:</strong> modal, banner</p>
            </div>

            <div class="setup-instructions">
              <h3>Setup Instructions:</h3>
              <ol>
                <li>
                  Replace the API key in your environment variables with your
                  actual Knock public API key
                </li>
                <li>
                  Replace the channel ID in your environment variables with your
                  actual guide channel ID
                </li>
                <li>
                  Create guides in your Knock dashboard with types "modal" and
                  "banner"
                </li>
                <li>
                  Make sure your guides are active and target the demo user
                </li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </KnockProvider>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import KnockProvider from "./components/KnockProvider.vue";
import ConfigBanner from "./components/ConfigBanner.vue";

// Demo configuration - uses environment variables with fallbacks
const knockConfig = reactive({
  apiKey:
    import.meta.env.VITE_KNOCK_PUBLIC_API_KEY || "YOUR_KNOCK_PUBLIC_API_KEY", // Replace with your actual API key
  userId: import.meta.env.VITE_DEMO_USER_ID || "YOUR_USER_ID", // Demo user ID
  userToken: null, // Not required for development
  channelId:
    import.meta.env.VITE_KNOCK_GUIDE_CHANNEL_ID || "YOUR_GUIDE_CHANNEL_ID", // Replace with your actual guide channel ID
});

// Guide status tracking
const guidesCount = ref(0);
const guidesLoading = ref(false);
let refreshGuidesCallback = null;

// Methods
const updateUserId = (newUserId) => {
  console.log("📝 Updating user ID:", newUserId);
  knockConfig.userId = newUserId;
};

const refreshGuides = () => {
  console.log("🔄 Manual guide refresh requested");
  if (refreshGuidesCallback) {
    refreshGuidesCallback();
  }
};

const handleGuidesUpdated = (data) => {
  guidesCount.value = data.count || 0;
  guidesLoading.value = data.loading || false;
  refreshGuidesCallback = data.refresh || null;
};
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
}

.app {
  min-height: calc(100vh - 80px); /* Account for banner height */
  background: #f8f9fa;
}

.app-header {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.app-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.app-main {
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.content-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  margin-top: 0;
  color: #333;
}

.demo-info,
.configuration,
.setup-instructions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.demo-info h3,
.configuration h3,
.setup-instructions h3 {
  margin-top: 0;
  color: #333;
}

.demo-info ul,
.setup-instructions ol {
  margin: 1rem 0 0 0;
  padding-left: 1.5rem;
}

.demo-info li,
.setup-instructions li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.configuration p {
  margin: 0.5rem 0;
  font-family: "Courier New", monospace;
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
}
</style>
