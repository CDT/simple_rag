# RAG Frontend - Vue 3 + TypeScript + TailwindCSS

Beautiful, modern frontend for the RAG application with full dark mode support.

## Features

- 🎨 **Modern UI**: Clean, responsive interface with TailwindCSS
- 🌙 **Dark Mode**: Full dark mode support with toggle and persistence
- 💬 **Chat Interface**: Real-time chat with message history and sources
- 📚 **Knowledge Base**: Drag-and-drop file upload with management
- ⚙️ **Settings**: Configurable parameters for the RAG system
- 🔄 **Live Status**: Real-time backend connection monitoring

## Tech Stack

- **Vue 3**: Composition API with `<script setup>`
- **TypeScript**: Full type safety
- **TailwindCSS**: Utility-first styling with dark mode
- **Vue Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Vite**: Lightning-fast development and build

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── views/
│   ├── Chat.vue           # Chat interface
│   ├── KnowledgeBase.vue  # Document management
│   └── Settings.vue       # Configuration
├── router/
│   └── index.ts           # Route definitions
├── composables/
│   └── useDarkMode.ts     # Dark mode logic
├── types/
│   └── index.ts           # TypeScript interfaces
├── App.vue                # Root component with sidebar
├── main.ts                # Application entry point
└── style.css              # Global styles

## Dark Mode

Dark mode is implemented using Tailwind's `class` strategy:

```typescript
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()
```

Features:
- Persistent preference (localStorage)
- System preference detection
- Smooth color transitions
- Full component coverage

## Development

### Adding a New View

1. Create component in `src/views/YourView.vue`
2. Add route in `src/router/index.ts`
3. Add menu item in `App.vue`
4. Add dark mode classes: `bg-white dark:bg-gray-800`

### Dark Mode Pattern

Always use this pattern for colors:

```vue
<div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
  <!-- Your content -->
</div>
```

Common dark mode classes:
- Backgrounds: `bg-white dark:bg-gray-800`
- Text: `text-gray-800 dark:text-gray-100`
- Borders: `border-gray-200 dark:border-gray-700`
- Inputs: `bg-white dark:bg-gray-700`

## API Integration

The frontend communicates with the backend through these endpoints:

- `POST /api/ingest` - Upload documents
- `POST /api/chat` - Send messages
- `GET /api/files` - List documents
- `DELETE /api/files/:id` - Delete document
- `GET /api/settings` - Get configuration
- `PUT /api/settings` - Update configuration

Proxy configuration in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

## Styling

### TailwindCSS Configuration

Custom color palette in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... through 900
  }
}
```

### Global Styles

Located in `src/style.css`:
- Tailwind imports
- Custom scrollbar styles
- Dark mode scrollbar variants
- Base resets

## TypeScript Types

All types are defined in `src/types/index.ts`:

```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp?: number
}
```

## Building for Production

```bash
npm run build
```

Output: `dist/` directory

Serves static files that can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## Environment

No environment variables needed for frontend. API calls are proxied through Vite in development and should go through a reverse proxy in production.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox

## Contributing

When adding new features:
1. Add TypeScript types
2. Include dark mode support
3. Test on mobile viewports
4. Maintain consistent styling patterns

## License

MIT

