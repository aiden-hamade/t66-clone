# T66 - Open Source AI Chat Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF.svg)](https://vitejs.dev/)

> 🚀 **A powerful, open-source AI chat platform** - Built for the T3 Chat Cloneathon with cutting-edge features and beautiful design.

## 🎬 Demo

[![T66 Demo Video](https://img.youtube.com/vi/UoTBjFbPuik/0.jpg)](https://youtu.be/UoTBjFbPuik)

*Click to watch the full demo showcasing T66's features and capabilities*

## 🔥 Overview

**T66** is a modern, feature-rich AI chat application that brings together multiple language models in an intuitive interface. Built with React 19, TypeScript, and Firebase, it offers a seamless experience for chatting with various AI providers including OpenAI, Anthropic, Google, and more through OpenRouter.

## ✨ Features

### 🤖 AI & Chat Features
- **Multiple AI Providers** - Support for OpenAI, Anthropic, Google, Cohere, and 50+ models via OpenRouter
- **Chat Management** - Create, organize, and manage conversations with folders
- **Real-time Streaming** - Live message streaming with typing indicators
- **Message Editing** - Edit and regenerate messages with different models
- **Chat Branching** - Split conversations to explore different paths
- **Token Counting** - Real-time usage tracking and cost estimation

### 🎨 UI/UX Features
- **Beautiful Interface** - Modern, responsive design with smooth animations
- **Theme System** - Fully customizable color schemes with preset themes
- **Landing Page** - Interactive theme preview and customization
- **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- **Syntax Highlighting** - Code blocks with language detection and formatting
- **Markdown Support** - Rich text rendering with GitHub-flavored markdown

### 🚀 Advanced Features
- **Voice Mode** - Speech-to-text input and text-to-speech output
- **File Attachments** - Upload and chat about images, PDFs, and documents
- **Web Search** - Real-time web search integration with source citations
- **Chat Sharing** - Share conversations with public links
- **Cross-device Sync** - Conversations sync across all your devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 with TypeScript and Vite
- **Backend**: Firebase (Auth, Firestore, Realtime Database)
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: Zustand for global state
- **Routing**: React Router DOM v7
- **AI Integration**: OpenRouter API for multiple providers
- **Voice**: OpenAI Whisper for speech-to-text, TTS for speech synthesis

### Project Structure

```
t66-clone/
├── 📁 frontend/                    # Main React application
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 auth/            # Authentication components
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── 📁 chat/            # Chat-specific components
│   │   │   │   └── SharedChatView.tsx
│   │   │   ├── 📁 settings/        # Settings and configuration
│   │   │   │   ├── ModelSelectorModal.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── ThemeModal.tsx
│   │   │   │   └── ThemePresetCard.tsx
│   │   │   └── 📁 ui/              # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Dropdown.tsx
│   │   │       ├── EditMessageModal.tsx
│   │   │       ├── HtmlPreviewModal.tsx
│   │   │       ├── MarkdownRenderer.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── ShareModal.tsx
│   │   │       ├── ThinkingIndicator.tsx
│   │   │       └── VoiceModeButton.tsx
│   │   ├── 📁 lib/                 # Utility libraries
│   │   │   ├── audioRecording.ts   # Voice recording utilities
│   │   │   ├── auth.ts             # Authentication helpers
│   │   │   ├── firebase.ts         # Firebase configuration
│   │   │   ├── firestore.ts        # Firestore utilities
│   │   │   ├── openai.ts           # OpenAI integration
│   │   │   ├── openrouter.ts       # OpenRouter API client
│   │   │   ├── realtime.ts         # Real-time features
│   │   │   ├── themeStorage.ts     # Theme persistence
│   │   │   └── utils.ts            # General utilities
│   │   ├── 📁 stores/              # Zustand state stores
│   │   │   ├── authStore.ts        # Authentication state
│   │   │   ├── chatStore.ts        # Chat and message state
│   │   │   └── themeStore.ts       # Theme state
│   │   ├── 📁 types/               # TypeScript definitions
│   │   │   ├── index.ts            # Main types
│   │   │   └── theme.ts            # Theme types
│   │   ├── 📁 config/              # Configuration files
│   │   │   └── themePresets.ts     # Theme presets
│   │   └── 📁 assets/              # Static assets
│   │       ├── react.svg
│   │       ├── system_prompt.txt
│   │       └── t66-chat-logo.svg
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.js
│   └── 📄 tsconfig.json
│
├── 📁 landing-page/                # Interactive landing page
│   ├── 📁 src/
│   │   ├── 📄 App.tsx              # Theme customization demo
│   │   └── 📁 assets/
│   │       ├── 2024-P13259.jpg
│   │       ├── koby_pfp.png
│   │       └── t66-chat-logo.svg
│   ├── 📄 package.json
│   └── 📄 vite.config.ts
│
├── 📁 scripts/                     # Development scripts
│   └── 📄 README.md                # Scripts documentation
│
├── 📄 env.example                  # Environment variables template
├── 📄 .gitignore
├── 📄 LICENSE                      # MIT License
└── 📄 README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project (for authentication and data storage)
- OpenRouter API key (for AI models)

### 1. Clone the Repository
```bash
git clone https://github.com/aiden-hamade/t66-clone.git
cd t66-clone
```

### 2. Set Up Environment Variables
```bash
cp env.example .env
```

Edit `.env` with your Firebase configuration:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 3. Install Dependencies & Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Set Up Your Account
1. Open http://localhost:5173 in your browser
2. Create an account or sign in
3. Go to Settings (gear icon) and add your API keys:
   - **OpenRouter API Key**: For general AI model access
   - **OpenAI API Key**: For voice features (optional)

### 5. Start Chatting!
- Select a model from the dropdown
- Type a message or use voice input
- Explore different themes and settings
- Create folders to organize your chats

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password
3. Set up Firestore Database
4. Copy your config to `.env`

### API Keys
- **OpenRouter**: Sign up at https://openrouter.ai/ for access to 50+ AI models
- **OpenAI**: Get your API key at https://platform.openai.com/ (for voice features)

Users can add their own API keys through the Settings modal - no server-side configuration needed!

## 🎨 Themes

T66 includes a powerful theming system with:
- **6 Built-in Presets**: Cyberpunk, Ocean Depths, Sunset Vibes, Forest Green, Royal Purple, Monochrome
- **Custom Themes**: Create your own with the interactive theme editor
- **Live Preview**: See changes in real-time on the landing page
- **Gradient Support**: Use solid colors or gradients for any element

## 📱 Mobile Support

T66 is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Swipe gestures for navigation
- Mobile-optimized voice input
- Progressive Web App (PWA) capabilities

## 🔊 Voice Features

### Speech-to-Text
- Use the microphone button to speak your messages
- Powered by OpenAI Whisper for accurate transcription
- Works in any supported language

### Text-to-Speech
- Automatic response playback in voice mode
- Natural-sounding voice synthesis
- Configurable in settings

## 📊 Usage Tracking

- Real-time token counting for cost estimation
- Usage statistics per conversation
- Support for multiple AI provider pricing

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Landing Page
```bash
npm run dev      # Start development server
npm run build    # Build for production
```

### Building for Production
```bash
cd frontend
npm run build
```

The build artifacts will be in `frontend/dist/`.

## Future Development

We are working on a Progressive Web App (PWA). A buggy version can be found on branch 'pwa'.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 🔒 Security

- Firebase Authentication for secure user management
- API keys stored securely on client-side
- No sensitive data transmitted to servers
- Regular security updates

## 📈 Performance

- Optimized React components with proper memoization
- Efficient state management with Zustand
- Lazy loading for better initial page load
- Theme preferences cached locally

## 🌍 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React ecosystem
- **Firebase Team** - For excellent backend services
- **OpenRouter** - For providing access to multiple AI models
- **Tailwind CSS** - For the utility-first CSS framework
- **Cloudflare** - For hosting and deployment
- **Open Source Community** - For all the incredible libraries and tools

## 🔗 Links

- **GitHub Repository**: [https://github.com/aiden-hamade/t66-clone](https://github.com/aiden-hamade/t66-clone)

## 📞 Support

- 🐛 [Report Issues](https://github.com/aiden-hamade/t66-clone/issues)
- 💬 [Discussions](https://github.com/aiden-hamade/t66-clone/discussions)

---

**Built with ❤️ for the T3 Chat Cloneathon**

> "The future of AI chat is open source" - T66 Team

### 🎯 Competition Highlights

**T66** was built specifically for the T3 Chat Cloneathon with these standout features:

✅ **All Core Requirements Met**
- Multi-model AI chat support
- User authentication & sync
- Browser-friendly with PWA
- Easy deployment & setup
- Stunning, responsive UI

🌟 **Bonus Features Implemented**
- Voice mode with speech-to-text
- File attachments support
- Real-time web search
- Chat sharing & branching
- Advanced theming system
- Mobile optimization

This project demonstrates modern web development practices, clean architecture, and a focus on user experience that makes AI chat accessible to everyone.
