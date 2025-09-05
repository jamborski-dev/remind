# re:MIND - Smart Reminder App

A modern, intelligent reminder application that runs entirely in your browser with offline capabilities. Built with React, TypeScript, and progressive web app (PWA) technologies.

## ✨ Features

### 🎯 Smart Reminders

- **Reminder Groups**: Organize tasks into logical groups with custom colors
- **Loop Completion**: Track progress through task sequences with automatic cycling
- **Flexible Scheduling**: Set custom intervals for different reminder groups
- **Snooze Functionality**: Postpone reminders with 5 or 10-minute delays

### 🏆 Gamification

- **Scoring System**: Earn points for completing reminder loops
- **Achievement Tiers**: Progress through different levels with motivational messages
- **Toast Notifications**: Celebrate achievements with beautiful notifications
- **Activity Tracking**: Detailed log of all completed tasks and achievements

### 📱 Progressive Web App

- **Offline Support**: Works without internet after first visit
- **Installable**: Add to home screen for app-like experience
- **Background Sync**: Service worker handles caching and updates
- **Cross-Platform**: Works on desktop, mobile, and tablet devices

### 🎨 Modern Interface

- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Theme Support**: Clean, modern styling
- **Smooth Animations**: Motion-based transitions and interactions
- **Accessibility**: Keyboard navigation and screen reader support

### 🔧 Advanced Features

- **Wake Lock**: Keep screen active during reminder sessions
- **Sound Notifications**: Customizable notification sounds
- **Activity Log**: Paginated history with filtering options
- **Local Storage**: All data persists locally in your browser
- **Hot Reload**: Development mode with instant updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jamborski-dev/remind.git
   cd remind
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

### Building for Production

```bash
# Build the app
npm run build

# Preview the build
npm run serve
```

## 🛠️ Tech Stack

### Core Technologies

- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Zustand** - Lightweight state management

### UI & Styling

- **Styled Components** - CSS-in-JS styling
- **Motion** - Smooth animations and transitions
- **React Icons** - Comprehensive icon library
- **React Select** - Enhanced dropdown components

### PWA & Performance

- **Service Worker** - Offline caching and background sync
- **Web App Manifest** - Installation and app metadata
- **Wake Lock API** - Screen management
- **IndexedDB/LocalStorage** - Client-side data persistence

### Development Tools

- **Biome** - Code formatting and linting
- **TanStack Router** - Type-safe routing
- **TanStack Devtools** - Development debugging
- **Vitest** - Unit testing framework

## 📁 Project Structure

```
remind/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                 # Service worker
│   └── assets/               # Static assets
├── src/
│   ├── components/           # React components
│   │   ├── design-system/    # Reusable UI components
│   │   └── compound/         # Complex composed components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── contexts/            # React contexts
│   ├── constants/           # App constants and configs
│   ├── utils/               # Utility functions
│   └── routes/              # TanStack Router routes
├── index.html               # Entry point
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎮 Usage Guide

### Creating Reminder Groups

1. Click "Add Reminder Group"
2. Set group name, color, and interval
3. Add individual reminder items
4. Configure enabled/disabled state for each item

### Managing Reminders

- **Complete Task**: Click the checkmark or "Done" in the modal
- **Snooze**: Use 5M or 10M buttons to postpone
- **Edit Groups**: Modify settings, add/remove items
- **Delete Groups**: Remove entire reminder groups

### Tracking Progress

- **Activity Log**: View completion history with timestamps
- **Scoring**: See points earned for completing loops
- **Achievements**: Unlock tiers based on your score

### PWA Installation

1. Visit the app in a modern browser
2. Look for install prompt or browser menu option
3. Install for offline access and home screen shortcut

## ⚙️ Configuration

### Development Settings

- **Port**: Development server runs on port 3001
- **Auto-seeding**: Sample data loads in development mode
- **Hot Reload**: Changes reflect immediately

### Production Settings

- **Service Worker**: Automatic caching and offline support
- **Bundle Optimization**: Tree-shaking and code splitting
- **PWA Features**: Install prompts and update notifications

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

## 📈 Performance

- **Bundle Size**: ~150KB gzipped
- **First Load**: < 1s on fast 3G
- **Offline Ready**: Full functionality without internet
- **Memory Efficient**: Optimized state management
- **Battery Friendly**: Efficient wake lock usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Zustand for lightweight state management
- Vite for blazing fast development experience
- All contributors and beta testers

---

**Built with ❤️ by [jamborski-dev](https://github.com/jamborski-dev)**

_Making habit formation fun and engaging through smart reminders and gamification._
