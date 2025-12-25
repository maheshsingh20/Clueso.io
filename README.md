# Clueso - AI-Powered Video Platform

> **Assignment Project**: A comprehensive video platform with AI-powered features, screen recording, and collaborative editing capabilities.

## 🎯 Project Overview

Clueso is a modern video platform that combines screen recording, AI-powered video editing, and team collaboration features. Built with the MERN stack and TypeScript, it provides a complete solution for creating, editing, and managing video content with advanced AI capabilities.

## ✨ Key Features

### 🎥 **Video Management**
- **Screen Recording**: Full-screen, window, or tab recording with system/microphone audio
- **Video Upload**: Support for MP4, WebM, AVI, MOV formats (up to 500MB)
- **Video Player**: Custom video player with timeline controls and preview
- **Project Organization**: Organize videos into projects and workspaces

### 🤖 **AI-Powered Features**
- **Script Extraction**: AI-powered transcript generation from video content
- **Script Enhancement**: Gemini AI integration for improving video scripts
- **Auto-Captions**: Automatic caption generation with customizable styling
- **AI Voiceover**: Generate professional voiceovers from text using AI
- **Smart Effects**: AI-driven video effects and enhancements

### ✂️ **Advanced Video Editor**
- **Timeline Editor**: Professional timeline with multiple tracks
- **Real-time Preview**: Live video preview with effects
- **Multiple Tabs**: Script, Voiceover, Captions, Clips, Effects, Filters, Transform, Audio, Style
- **Horizontal Sliding Interface**: Space-efficient tab navigation
- **Keyframe Animation**: Advanced animation controls
- **Color Grading**: Professional color correction tools
- **Audio Controls**: EQ, effects, and audio enhancement

### 👥 **Collaboration & Workspace**
- **Team Workspaces**: Multi-user collaboration environments
- **Project Sharing**: Public/private project visibility controls
- **Role-based Access**: Owner, Editor, Viewer permissions
- **Real-time Updates**: WebSocket-powered live collaboration

### 🎨 **User Interface**
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Collapsible Sidebar**: Space-efficient navigation with icon-only mode
- **Dark/Light Themes**: Customizable appearance
- **Mobile Responsive**: Works on all device sizes
- **Accessibility**: WCAG compliant design

### 📊 **Analytics & Insights**
- **Video Analytics**: View counts, engagement metrics
- **User Progress**: Tutorial completion tracking
- **Performance Metrics**: System health monitoring
- **Feedback System**: Built-in user feedback collection

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Query** for state management and caching
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **Socket.io Client** for real-time features

### **Backend**
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **FFmpeg** for video processing
- **Winston** for logging
- **Joi** for validation

### **AI & External Services**
- **Google Gemini AI** for script enhancement and AI features
- **OpenAI** (optional) for additional AI capabilities
- **AWS S3** (optional) for cloud storage
- **Redis** for caching and queues

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Nodemon** for development
- **Concurrently** for running multiple processes

## 📁 Project Structure

```
clueso/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express TypeScript API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── validation/     # Input validation
│   ├── uploads/            # File storage
│   └── package.json
├── shared/                  # Shared TypeScript types
│   ├── src/
│   │   ├── types/          # Common type definitions
│   │   └── interfaces/     # Shared interfaces
│   └── package.json
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher)
- **FFmpeg** (for video processing)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd clueso
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Environment Setup**
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configuration
```

4. **Start the application**
```bash
# Option 1: Start both frontend and backend
npm run dev

# Option 2: Start individually
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/v1/health

## ⚙️ Configuration

### Backend Environment Variables
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/clueso-clone

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key (optional)

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key (optional)
AWS_SECRET_ACCESS_KEY=your-aws-secret (optional)
AWS_S3_BUCKET=your-s3-bucket (optional)

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## 🎮 Usage Guide

### 1. **Getting Started**
- Register a new account or login
- Complete the onboarding tutorial
- Create your first workspace

### 2. **Recording Videos**
- Click "Record Screen" from dashboard or projects
- Choose screen/window/tab to record
- Configure audio settings (system/microphone)
- Start recording and use controls to manage

### 3. **Video Editing**
- Upload or record a video
- Open the video editor
- Use the horizontal sliding tabs to access different editing features:
  - **Script**: Extract and enhance video scripts with AI
  - **Voiceover**: Generate AI voiceovers or upload custom audio
  - **Captions**: Auto-generate and style captions
  - **Clips**: Manage timeline clips and segments
  - **Effects**: Apply AI-powered video effects
  - **Filters**: Color grading and visual filters
  - **Transform**: Crop, resize, and transform video
  - **Audio**: Advanced audio controls and EQ
  - **Style**: Branding and visual styling

### 4. **Collaboration**
- Create workspaces for team collaboration
- Invite team members with different roles
- Share projects with public/private visibility
- Use real-time collaboration features

## 🏗️ Architecture Highlights

### **Scalable Backend Design**
- RESTful API with proper HTTP status codes
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Error handling and logging
- Rate limiting and security middleware

### **Modern Frontend Architecture**
- Component-based React architecture
- Custom hooks for reusable logic
- Centralized state management
- Optimistic UI updates
- Error boundaries and fallbacks
- Performance optimizations

### **Real-time Features**
- WebSocket connections for live updates
- Real-time collaboration indicators
- Live feedback notifications
- Progress tracking for long operations

### **AI Integration**
- Modular AI service architecture
- Support for multiple AI providers
- Fallback mechanisms for AI failures
- Caching for improved performance

## 🔧 Development

### **Available Scripts**
```bash
# Root level
npm run dev              # Start both frontend and backend
npm run build           # Build both applications
npm run install:all     # Install all dependencies

# Frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Backend  
npm run dev             # Start with nodemon
npm run build           # Compile TypeScript
npm run start           # Start production server
npm run test            # Run tests
```

### **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Consistent code formatting
- Comprehensive error handling
- Input validation on all endpoints

## 🚀 Deployment

### **Production Build**
```bash
# Build all applications
npm run build

# Start production server
npm start
```

### **Environment Considerations**
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS settings
- Set up SSL/HTTPS
- Configure cloud storage (AWS S3)
- Set up Redis for production caching

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
```

### **Frontend Testing**
```bash
cd frontend
npm run test           # Run component tests
```

## 📝 API Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:
- **Development**: http://localhost:5000/api/docs
- **Production**: https://your-domain.com/api/docs

### **Key API Endpoints**
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/projects` - List user projects
- `POST /api/v1/videos/upload` - Upload video files
- `GET /api/v1/videos/:id` - Get video details
- `POST /api/v1/ai/enhance-script` - AI script enhancement
- `POST /api/v1/ai/generate-voiceover` - Generate AI voiceover

## 🤝 Contributing

This is an assignment project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created as an assignment and is for educational purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced AI capabilities
- **OpenAI** for additional AI features
- **MongoDB** for database solutions
- **React** and **Node.js** communities
- **TailwindCSS** for styling framework

---

**Built with ❤️ for learning and demonstration purposes**