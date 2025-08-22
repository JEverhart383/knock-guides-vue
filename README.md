# Vue.js Knock Guides Integration

A comprehensive Vue.js application demonstrating how to integrate Knock's advanced guides functionality with real-time updates, engagement tracking, and interactive configuration. This demo supports both **modal** and **banner** guide types.

## Features

✅ **Full Knock Guides Integration** - Complete guide fetching, rendering, and engagement tracking  
✅ **Dual Guide Types** - Support for both modal and banner guides  
✅ **Real-time Updates** - Live guide eligibility changes via WebSocket connection  
✅ **Advanced Guide Client** - Uses the complete KnockGuideClient with all features  
✅ **Vue 3 Reactivity** - Seamless integration with Vue's reactivity system  
✅ **Interactive Configuration** - Live user switching for testing  
✅ **Engagement Tracking** - Automatic seen/interacted/archived tracking  
✅ **Responsive Design** - Mobile-friendly banner and modal components

## Architecture

This demo implements the complete Knock guides functionality for Vue.js:

1. **KnockGuideClient**: Full-featured client with real-time updates and advanced guide selection
2. **Vue Composables**: Reactive `useKnock()` and `useGuide()` composables with TanStack Store integration
3. **Real-time Updates**: WebSocket connection for live guide eligibility changes
4. **Provider Pattern**: KnockProvider component managing client lifecycle and authentication
5. **Guide Components**: Modal and banner components with complete engagement tracking
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

1. In `src/App.vue`:
   ```javascript
   apiKey: 'pk_test_your_actual_api_key_here',
   userId: 'your_demo_user_id',
   channelId: 'your_guide_channel_id_here'
   ```

### 3. Create Guides in Knock Dashboard

1. Go to your Knock dashboard
2. Create guides with:
   - **Type**: `modal` or `banner`
   - **Key**: Any key you want (e.g., `product-announcement`, `welcome-banner`, etc.)
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
- **Refresh Guides**: Manually refetch guides with current settings
- **View Status**: See active configuration and guide count

### Usage Examples:

1. **Test Different Users**: Enter "user-1" in User ID to see guides for that user
2. **Show All Guides**: The app automatically shows both modal and banner guides for the user
3. **Live Updates**: The guide count and eligibility updates automatically as you change settings

## How It Works

### File Structure

```
src/
├── components/
│   ├── ConfigBanner.vue    # Interactive configuration interface
│   ├── GuideBanner.vue     # Banner component for displaying banner guides
│   ├── GuideModal.vue      # Modal component for displaying modal guides
│   └── KnockProvider.vue   # Provider component that wraps the app
├── composables/
│   ├── useKnock.js         # Knock client management with TanStack Store integration
│   └── useGuide.js         # Guide-specific functionality (like React's useGuide)
├── App.vue                 # Main application component
└── main.js                 # App entry point
```

### Key Components

#### `useKnock()` Composable

- Initializes and manages the KnockGuideClient
- Bridges TanStack Store with Vue's reactivity system
- Handles user authentication and client lifecycle
- Provides reactive guide data and engagement methods

#### `useGuide()` Composable

- Vue equivalent of React's `useGuide` hook
- Filters guides by `type` ("modal" or "banner") and optional `key`
- Returns reactive guide data with engagement methods
- Automatically responds to configuration changes

#### `GuideModal.vue` Component

- Renders modal guides automatically when available
- Handles user interactions (close, actions)
- Tracks engagement (seen, interacted, archived)
- Supports keyboard navigation (ESC to close)
- Uses Teleport for proper modal positioning

#### `GuideBanner.vue` Component

- Renders banner guides automatically when available
- Displays at the top of the page above content
- Handles user interactions (buttons, dismiss)
- Tracks engagement (seen, interacted, archived)
- Supports light/dark color modes
- Responsive design for mobile devices

#### `ConfigBanner.vue` Component

- Interactive configuration interface at the top of the app
- Allows real-time user ID changes
- Shows active configuration and guide status
- Stays accessible above modal overlays
- Responsive design for mobile devices

#### `KnockProvider.vue` Component

- Initializes Knock client on mount
- Authenticates the user and responds to user changes
- Renders both guide components (banner and modal)
- Manages real-time connections and cleanup
- Provides channel ID context to child components

### Guide Engagement Flow

1. **Seen**: Automatically called when guide appears (`markAsSeen()`)
2. **Interacted**: Called when user clicks action buttons (`markAsInteracted()`)
3. **Archived**: Called when user closes modal or dismisses banner (`markAsArchived()`)

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

## Guide Types Supported

### Modal Guides

- Full-screen overlay with centered content
- Support for title, body, and action buttons
- Keyboard navigation (ESC to close)
- Proper focus management and accessibility

### Banner Guides

- Top-of-page banner with inline content
- Support for title, body, and action buttons
- Dismissible with close button
- Light/dark color mode support
- Responsive design for mobile devices

## Customization

### Styling

The modal and banner styling is defined in their respective component files using scoped CSS. You can customize the appearance by modifying these styles.

### Color Modes

The banner component supports light and dark color modes via the `colorMode` prop:

```vue
<GuideBanner color-mode="dark" />
```

### Content Structure

The guide content is accessed through `step.content` and supports:

- `title`: Guide title
- `body`: Guide body (supports HTML)
- `actions`: Array of action buttons with `label` and optional `url`/`action`
- `primary_button` and `secondary_button`: Specific button configurations for banners
- `dismissible`: Whether the banner can be dismissed

## Dependencies

This project uses the following key dependencies:

```json
{
  "@knocklabs/client": "^0.16.5", // Official Knock client with guides support
  "@tanstack/store": "^0.7.2", // State management for guide client
  "urlpattern-polyfill": "^10.1.0", // URL pattern matching for location targeting
  "vue": "^3.4.0" // Vue 3 framework
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

- `options.type`: Filter guides by message type ("modal" or "banner")
- `options.key`: Filter guides by specific guide key (optional)
- `options.channelId`: Required channel ID for guide functionality
- Returns: `{ step, guides }`
- Automatically uses configuration from KnockProvider when no options provided

### Guide Step Object

- `step.content`: Guide content (title, body, actions, buttons)
- `step.markAsSeen()`: Mark guide as seen
- `step.markAsInteracted(metadata)`: Mark guide as interacted
- `step.markAsArchived()`: Mark guide as archived (dismissed)

## Troubleshooting

1. **Guides not appearing**:

   - Check that your guides are active and properly targeted in your Knock dashboard
   - Verify the API key and channel ID are correct in your environment variables
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

5. **Guide type issues**:
   - Make sure your guides in Knock dashboard have the correct type ("modal" or "banner")
   - Check that the channel ID supports both guide types

## Learn More

- [Knock Documentation](https://docs.knock.app/)
- [Knock Guides Documentation](https://docs.knock.app/in-app-ui/guides/overview)
- [Vue.js Documentation](https://vuejs.org/)
- [TanStack Store Documentation](https://tanstack.com/store/latest)
