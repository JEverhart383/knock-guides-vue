# Vue.js Knock Guides Integration

A comprehensive Vue.js application demonstrating how to integrate Knock's advanced guides functionality with real-time updates, engagement tracking, and interactive configuration.

## Features

✅ **Full Knock Guides Integration** - Complete guide fetching, rendering, and engagement tracking  
✅ **Real-time Updates** - Live guide eligibility changes via WebSocket connection  
✅ **Advanced Guide Client** - Uses the complete KnockGuideClient with all features  
✅ **Vue 3 Reactivity** - Seamless integration with Vue's reactivity system  
✅ **Interactive Configuration** - Live user/guide switching for testing  
✅ **Engagement Tracking** - Automatic seen/interacted/archived tracking  

## Architecture

This demo implements the complete Knock guides functionality for Vue.js:

1. **KnockGuideClient**: Full-featured client with real-time updates and advanced guide selection
2. **Vue Composables**: Reactive `useKnock()` and `useGuide()` composables with TanStack Store integration
3. **Real-time Updates**: WebSocket connection for live guide eligibility changes
4. **Provider Pattern**: KnockProvider component managing client lifecycle and authentication
5. **Guide Components**: Modal component with complete engagement tracking
6. **State Management**: TanStack Store integration with Vue reactivity bridges

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Knock

**Option A: Environment Variables (Recommended)**
Create a `.env` file in the project root:
```env
VITE_KNOCK_PUBLIC_API_KEY=pk_test_your_actual_api_key_here
VITE_KNOCK_GUIDE_CHANNEL_ID=your_guide_channel_id_here
VITE_DEMO_USER_ID=your_demo_user_id
```

**Option B: Direct Configuration**
Replace the placeholders in the following files:

1. In `src/composables/useKnock.js`:
   ```javascript
   const KNOCK_PUBLIC_API_KEY = 'pk_test_your_actual_api_key_here'
   const KNOCK_GUIDE_CHANNEL_ID = 'your_guide_channel_id_here'
   ```

2. In `src/App.vue`:
   ```javascript
   apiKey: 'pk_test_your_actual_api_key_here',
   userId: 'your_demo_user_id'
   ```



### 3. Create a Guide in Knock Dashboard

1. Go to your Knock dashboard
2. Create a new guide with:
   - **Type**: `modal`
   - **Key**: Any key you want (e.g., `product-announcement`, `welcome-modal`, etc.)
   - **Content**: Add title, body, and optional action buttons
   - **Targeting**: Set to target your demo users or "All users"
   - **Activation**: Set appropriate activation rules (or leave empty to show on all pages)

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Interactive Configuration

The app includes a configuration banner at the top that allows you to:

- **Change User ID**: Test guides for different users (e.g., "user-1", "user-123", "admin")
- **Override Guide Key**: Show a specific guide by entering its key (optional)
- **Refresh Guides**: Manually refetch guides with current settings
- **View Status**: See active configuration and guide count

### Usage Examples:

1. **Test Different Users**: Enter "user-1" in User ID to see guides for that user
2. **Show All Modal Guides**: Leave Guide Key empty to show all modal guides for the user
3. **Show Specific Guide**: Enter "product-announcement" in Guide Key to show only that guide
4. **Live Updates**: The guide count and eligibility updates automatically as you change settings

## How It Works

### File Structure

```
src/
├── components/
│   ├── ConfigBanner.vue    # Interactive configuration interface
│   ├── GuideModal.vue      # Modal component for displaying guides
│   └── KnockProvider.vue   # Provider component that wraps the app
├── composables/
│   ├── KnockGuideClient.js # Complete KnockGuideClient implementation with real-time updates
│   ├── useKnock.js         # Knock client management with TanStack Store integration
│   └── useGuide.js         # Guide-specific functionality (like React's useGuide)
├── App.vue                 # Main application component
└── main.js                 # App entry point
```

### Key Components

#### `KnockGuideClient.js`
- Complete implementation of Knock's advanced guide client
- Real-time WebSocket connection for live guide updates  
- TanStack Store integration for reactive state management
- Advanced guide selection with location targeting and group staging
- Full engagement tracking (seen, interacted, archived)

#### `useKnock()` Composable
- Initializes and manages the KnockGuideClient
- Bridges TanStack Store with Vue's reactivity system
- Handles user authentication and client lifecycle
- Provides reactive guide data and engagement methods

#### `useGuide()` Composable
- Vue equivalent of React's `useGuide` hook
- Filters guides by `type` (always "modal") or `key` (when specified)
- Returns reactive guide data with engagement methods
- Automatically responds to configuration changes

#### `GuideModal.vue` Component
- Renders modal guides automatically when available
- Handles user interactions (close, actions)
- Tracks engagement (seen, interacted, archived)
- Supports keyboard navigation (ESC to close)

#### `ConfigBanner.vue` Component
- Interactive configuration interface at the top of the app
- Allows real-time user ID and guide key changes
- Shows active configuration and guide status
- Stays accessible above modal overlays

#### `KnockProvider.vue` Component
- Initializes Knock client on mount
- Authenticates the user and responds to user changes
- Renders guide components with dynamic configuration
- Cleans up on unmount

### Guide Engagement Flow

1. **Seen**: Automatically called when modal appears (`markAsSeen()`)
2. **Interacted**: Called when user clicks action buttons (`markAsInteracted()`)
3. **Archived**: Called when user closes modal (`markAsArchived()`)

### Real-time Updates

The application includes full real-time functionality:

- **WebSocket Connection**: Automatically connects to Knock's real-time service
- **Live Eligibility Changes**: Guides appear/disappear instantly when eligibility changes
- **Engagement Sync**: Guide state updates in real-time across all connected clients
- **Automatic Reconnection**: Handles connection drops and reconnects automatically

**Real-time Events Supported:**
- `guide.added` - New guide becomes available
- `guide.updated` - Guide content or eligibility changes  
- `guide.removed` - Guide becomes unavailable
- `guide_group.added/updated` - Guide group changes

## Customization

### Styling
The modal styling is defined in `index.html` using CSS classes prefixed with `knock-guide-modal`. You can customize the appearance by modifying these styles.

### Guide Types
This demo focuses on modal guides for simplicity. To support other guide types (banner, card, etc.), create additional components similar to `GuideModal.vue` and add them to the `KnockProvider.vue`.

### Content Structure
The guide content is accessed through `step.content` and supports:
- `title`: Guide title
- `body`: Guide body (supports HTML)
- `actions`: Array of action buttons with `label` and optional `url`/`action`

## Dependencies

This project uses additional dependencies for the advanced guide functionality:

```json
{
  "@tanstack/store": "^0.7.2",    // State management for guide client
  "urlpattern-polyfill": "^10.0.0" // URL pattern matching for location targeting
}
```

## Production Considerations

1. **Environment Variables**: Use `.env` files for API keys and configuration (already implemented)
2. **User Authentication**: Implement proper user token generation for production
3. **Error Handling**: Add comprehensive error handling and fallbacks
4. **Performance**: Consider lazy loading and code splitting for guide components
5. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
6. **Security**: Validate and sanitize any HTML content from guides
7. **Real-time Scaling**: Monitor WebSocket connections and implement connection pooling if needed

## API Reference

### `useKnock()`
- `initializeKnock(apiKey)`: Initialize the Knock client
- `authenticate(userId, userToken)`: Authenticate a user
- `teardown()`: Clean up client connections

### `useGuide(options)`
- `options.type`: Filter guides by message type (defaults to "modal")
- `options.key`: Filter guides by specific guide key (optional)
- Returns: `{ step, guides, refetch }`
- Automatically uses configuration from ConfigBanner when no options provided

### Guide Step Object
- `step.content`: Guide content (title, body, actions)
- `step.markAsSeen()`: Mark guide as seen
- `step.markAsInteracted(metadata)`: Mark guide as interacted
- `step.markAsArchived()`: Mark guide as archived (dismissed)

## Troubleshooting

1. **Modal not appearing**: 
   - Check that your guide is active and properly targeted in your Knock dashboard
   - Verify the API key and channel ID are correct in `src/composables/useKnock.js`
   - Try different user IDs in the configuration banner
   - Check the browser console for API errors

2. **Authentication errors**: 
   - Ensure you're using a valid public API key (starts with `pk_`)
   - The user ID can be any string - Knock will create users automatically

3. **Configuration not working**:
   - The configuration banner should stay visible above modals
   - Changes should trigger immediate guide refetching
   - Check browser console for guide filtering and fetching logs

4. **Network errors**: 
   - Check browser console for API errors and verify your Knock configuration
   - Ensure your Knock environment is properly set up

## Learn More

- [Knock Documentation](https://docs.knock.app/)
- [Knock Guides Documentation](https://docs.knock.app/in-app-ui/guides/overview)
- [Vue.js Documentation](https://vuejs.org/)
