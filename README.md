# 🌾 Hardini - Agricultural Technology Platform

A modern full-stack platform that bridges technology and farming experiences to create sustainable agricultural solutions with YouTube integration and AI-powered farming tools.

## 🚀 Features

### Frontend
- 🌐 Modern, responsive web design
- 🎥 Instagram-style farming reels (autoplay muted)
- 🛍️ Comprehensive agricultural marketplace
- 🤖 AI-powered farming chatbot
- 📞 Interactive contact forms with maps
- 📱 Mobile-first responsive layout

### Backend
- 📺 YouTube API integration for farming videos
- 🔍 Advanced content filtering and search
- 🌐 RESTful API architecture
- 📊 Real-time data processing
- 🔒 CORS-enabled secure communication

### Development
- ⚡ Concurrent frontend/backend development server
- 🔄 Hot reload capabilities
- 📊 Auto-restart server with nodemon
- 🛠️ Cross-platform compatibility

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript ES6+** - Interactive functionality
- **Google Fonts (Poppins)** - Typography
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **YouTube Data API v3** - Video content
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing

### Development Tools
- **npm** - Package management
- **concurrently** - Parallel process execution
- **nodemon** - Auto-restart development server

## 📋 Setup & Installation

### Prerequisites
- Node.js (v14+ recommended)
- npm (comes with Node.js)
- Modern web browser

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hardini-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm start
   ```
   Or
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:8000`
   - Backend API: `http://localhost:3001`
   - API Health Check: `http://localhost:3001/api/health`

### Manual Commands

**Start both servers concurrently:**
```bash
npm run dev
```

**Start backend only:**
```bash
npm run backend
```

**Start backend with hot reload (development):**
```bash
npm run backend:dev
```

**Start frontend only:**
```bash
npm run frontend
```

## 📁 Project Structure

```
hardini-app/
├── index.html              # Main homepage
├── styles.css             # Global styles
├── script.js             # Main script
├── reels.html            # Reels page
├── reels.js             # Reels functionality
├── connect.html         # Connect page
├── supply-chain.html    # Supply chain page
├── package.json         # Root package.json
├── backend/             # Backend application
│   ├── server.js        # Express server
│   ├── package.json     # Backend dependencies
│   └── .env            # Environment variables
├── assets/              # Static assets
│   └── seed-icon.svg
├── images/              # Image assets
└── README.md           # This file
```

## 🔧 Environment Configuration

Create `backend/.env` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3001
```

**Note:** Get YouTube API key from [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 Usage

### Browsing Reels
- Reels autoplay muted on the homepage
- Click any reel to open it with sound
- Use navigation arrows or swipe to browse
- Auto-scroll through reels every 8 seconds

### Marketplace
- Browse agricultural products by category
- Interactive product cards with ordering
- Equipment rental with detailed terms

### Learning Platform
- Connect with experienced farmers
- Access mentorship programs
- AI-powered chatbot for queries

### API Endpoints
- `GET /api/health` - Server health check
- `GET /api/reels?limit=N` - Fetch farming videos
- `GET /api/reels/:videoId` - Get specific video details

## 🚀 Deployment

### Production Build
```bash
# Backend (consider using PM2)
npm run backend

# Frontend can be served statically or through Node.js
```

### Docker (Optional)
Create a `Dockerfile` for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Contact

Hardini Technologies
- Website: [Coming Soon]
- Email: info@hardini.com
- Support: support@hardini.com

---

**Built with ❤️ for sustainable agriculture** 🌱🚀
