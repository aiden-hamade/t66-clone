# T66 - Open Source AI Chat Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-Latest-green.svg)](https://pocketbase.io/)

> 🚀 **T3 Chat Cloneathon Submission** - A modern, self-hostable AI chat application built for the community.

**T66** is a powerful, open-source AI chat platform that brings together multiple language models in a beautiful, feature-rich interface. Built with React and PocketBase, it's designed to be self-hostable, extensible, and user-friendly.

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
- **🔍 Web Search** - Real-time web search integration
- **🔑 Bring Your Own Key** - Use your own API keys for all providers
- **📱 Mobile App (PWA)** - Native-like mobile experience
- **🎤 Voice Mode** - Speech-to-text and text-to-speech
- **📚 System Message Library** - Pre-built and custom system prompts
- **🎨 Discord-like Themes** - Fully customizable color schemes with CSS variables

### 🚀 Advanced Features
- **🧠 Memory System** - ChatGPT-like conversation memory
- **🔬 Deep Research** - Multi-step research with source citations
- **💾 Local Cache** - Offline-first with intelligent caching
- **⚡ Functions & Tools** - Extensible function calling system
- **📊 Token Counting** - Real-time usage tracking and cost estimation
- **📹 YouTube Integration** - Upload and analyze YouTube videos
- **🐳 Code Execution** - Safe code execution in Docker containers
- **🎛️ Advanced Controls** - Temperature, system messages, safety filters
- **🔎 File Search & Grep** - Cursor-like code analysis and search
- **🖥️ Computer Use** - Advanced automation capabilities (experimental)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: PocketBase (Go-based BaaS)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Real-time**: WebSockets + Server-Sent Events
- **Testing**: Vitest + React Testing Library
- **Deployment**: Docker + Docker Compose

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
├── 📁 backend/                     # PocketBase backend
│   ├── 📁 pb_data/                 # PocketBase data directory
│   ├── 📁 pb_migrations/           # Database migrations
│   ├── 📁 pb_hooks/                # PocketBase hooks (Go)
│   ├── 📁 pb_public/               # Static file serving
│   └── 📄 main.go                  # Custom PocketBase server
│
├── 📁 docs/                        # Documentation
│   ├── 📄 API.md                   # API documentation
│   ├── 📄 DEPLOYMENT.md            # Deployment guide
│   ├── 📄 CONTRIBUTING.md          # Contribution guidelines
│   └── 📄 FEATURES.md              # Feature documentation
│
├── 📁 docker/                      # Docker configuration
│   ├── 📄 Dockerfile.frontend
│   ├── 📄 Dockerfile.backend
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
- Go 1.21+ (for PocketBase customization)
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
   
   # Backend (if customizing PocketBase)
   cd ../backend
   go mod tidy
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   go run main.go serve --http=0.0.0.0:8090
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend Admin: http://localhost:8090/_/

### Docker Setup (Recommended for Production)

```bash
# Build and start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8090
```

## 🎨 Theming System

T66 features a powerful theming system inspired by Discord:

```css
/* All colors are CSS custom properties */
:root {
  --primary: 220 14.3% 95.9%;
  --primary-foreground: 220.9 39.3% 11%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more theme variables */
}

/* Dark theme */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📖 API Documentation

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Chat Management
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### AI Providers
- `POST /api/chat/completions` - Chat completions
- `POST /api/images/generate` - Image generation
- `GET /api/models` - Available models

[Full API Documentation](docs/API.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📋 Roadmap

- [ ] **Phase 1**: Core chat functionality
- [ ] **Phase 2**: Multi-model support
- [ ] **Phase 3**: Advanced features (attachments, image gen)
- [ ] **Phase 4**: Voice and mobile optimization
- [ ] **Phase 5**: Advanced AI features (memory, research)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- T3 Stack team for inspiration
- PocketBase for the amazing backend
- shadcn/ui for beautiful components
- All contributors and testers

## 📞 Support

- 🐛 [Report bugs](https://github.com/yourusername/t66-clone/issues)
- 💡 [Request features](https://github.com/yourusername/t66-clone/discussions)
- 📧 Email: support@t66.dev

---

**Built with ❤️ for the T3 Chat Cloneathon**

> "The future of AI chat is open source" - T66 Team
