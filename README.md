# T66 - Open Source AI Chat Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)](https://firebase.google.com/)

> 🚀 **T3 Chat Cloneathon Submission** - A modern, self-hostable AI chat application built for the community.

**T66** is a powerful, open-source AI chat platform that brings together multiple language models in a beautiful, feature-rich interface. Built with React and Firebase, it's designed to be scalable, extensible, and user-friendly.

## 🏆 Competition Features

### ✅ Core Requirements
- **Chat with Various LLMs** - Support for OpenAI, Anthropic, Google, Cohere, and more
- **Authentication & Sync** - Secure user accounts with cross-device chat synchronization  
- **Browser Friendly** - Modern web application with PWA capabilities
- **Easy to Try** - One-click deployment and simple setup process
- **Stunning UI/UX** - Beautiful, responsive design that rivals the best chat interfaces

### 🌟 Bonus Features
- **📎 Attachment Support** - Upload and chat about images, PDFs, and documents
- **🎨 Image Generation** - AI-powered image creation with DALL-E, Midjourney, and Stable Diffusion
- **💻 Syntax Highlighting** - Beautiful code formatting with 100+ language support
- **🔄 Resumable Streams** - Continue conversations after page refresh
- **🌳 Chat Branching** - Explore alternative conversation paths
- **📤 Chat Sharing** - Share conversations with public links
- **🔍 Web Search** - Real-time web search integration with source citations
- **🔑 Bring Your Own Key** - Use your own API keys for all providers
- **📱 Mobile App (PWA)** - Native-like mobile experience
- **🎤 Voice Mode** - Speech-to-text and text-to-speech
- **📚 System Message Library** - Pre-built and custom system prompts
- **🎨 Discord-like Themes** - Fully customizable color schemes with CSS variables

### 🚀 Advanced Features
- **💾 Local Cache** - Offline-first with intelligent caching
- **📊 Token Counting** - Real-time usage tracking and cost estimation
- **🐳 Code Execution** - Ask any model to generate a frontend (one file) and see it within the app

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: Firebase (Authentication, Firestore, Functions)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Real-time**: Firebase Realtime Database
- **Testing**: Vitest + React Testing Library
- **Deployment**: Firebase

### Project Structure

```
t66-clone/
├── 📁 frontend/                    # React application
│   ├── 📁 public/                  # Static assets
│   │   ├── 📁 ui/              # shadcn/ui base components
│   │   ├── 📁 chat/            # Chat-specific components
│   │   ├── 📁 auth/            # Authentication components
│   │   ├── 📁 settings/        # Settings and configuration
│   │   ├── 📁 shared/          # Shared/common components
│   │   └── 📁 layout/          # Layout components
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 lib/                 # Utility libraries
│   │   │   ├── 📁 ai/              # AI provider integrations
│   │   │   ├── 📁 auth/            # Authentication logic
│   │   │   ├── 📁 storage/         # Local storage utilities
│   │   │   └── 📁 utils/           # General utilities
│   │   ├── 📁 pages/               # Page components
│   │   ├── 📁 stores/              # Zustand state stores
│   │   ├── 📁 styles/              # Global styles and themes
│   │   ├── 📁 types/               # TypeScript type definitions
│   │   └── 📁 workers/             # Web Workers for heavy tasks
│   ├── 📁 tests/                   # Frontend tests
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   └── 📄 tailwind.config.js
│
├── 📁 firebase/                    # Firebase configuration
│   ├── 📁 functions/               # Cloud Functions
│   ├── 📄 firebase.json
│   ├── 📄 firestore.rules
│   └── 📄 storage.rules
│
├── 📁 docs/                        # Documentation
│   ├── 📄 API.md                   # API documentation
│   ├── 📄 DEPLOYMENT.md            # Deployment guide
│   ├── 📄 CONTRIBUTING.md          # Contribution guidelines
│   └── 📄 FEATURES.md              # Feature documentation
│
├── 📁 docker/                      # Docker configuration
│   ├── 📄 Dockerfile.frontend
│   └── 📄 docker-compose.yml
│
├── 📁 scripts/                     # Development scripts
│   ├── 📄 setup.sh                 # Project setup script
│   ├── 📄 deploy.sh                # Deployment script
│   └── 📄 test.sh                  # Testing script
│
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore
├── 📄 LICENSE                      # MIT License
└── 📄 README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase CLI
- Docker and Docker Compose (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/t66-clone.git
   cd t66-clone
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   ```

3. **Firebase setup**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase project
   firebase init
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start development server**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173

### Docker Setup (Optional)

```bash
# Build and start frontend service
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
```

## 📖 API Documentation

### Authentication
- Firebase Authentication with multiple providers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �� Acknowledgments

- React and the amazing React community
- Firebase for the excellent backend services
- shadcn/ui for the beautiful component library
- All the AI providers making this possible
- The open source community

## 📞 Support

- 🐛 [Report bugs](https://github.com/yourusername/t66-clone/issues)
- 💡 [Request features](https://github.com/yourusername/t66-clone/discussions)
- 📧 Email: support@t66.dev

---

**Built with ❤️ for the T3 Chat Cloneathon**

> "The future of AI chat is open source" - T66 Team
