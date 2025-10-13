# 🌾 HARDINI Agriculture App

Empowering Agriculture Through Innovation and Technology

## 🚀 Quick Start

### Option 1: Quick Launch (Recommended)
- **Windows:** Double-click `launch.bat`
- **Mac/Linux:** Run `chmod +x launch.sh && ./launch.sh`

### Option 2: Permanent Service (24/7)
For production use or development, install as a permanent background service:

#### Windows (PowerShell - Administrator)
```powershell
# Run PowerShell as Administrator
.\start-hardini-service.ps1
# Server runs permanently with auto-restart
# Press Ctrl+C to stop (keeps running on failures)
```

#### Linux/Mac with systemd
```bash
# Install as permanent service (requires sudo)
sudo ./hardini-service.sh --install

# Then manage the service
./hardini-service.sh start    # Start permanent service
./hardini-service.sh stop     # Stop service
./hardini-service.sh restart  # Restart service
./hardini-service.sh status   # Check status
./hardini-service.sh logs     # View real-time logs
```

### Manual Start (For Development)
```bash
# Start backend server
cd backend && node server.js

# Open index.html in browser
# The app should automatically connect to the backend at localhost:3001
```

## 📱 App Features

- 🌅 **Beautiful Landing Page** - Modern IIFM Coalescence'25 design
- 📱 **Responsive Design** - Works on all devices
- 🎥 **AgriReels** - YouTube integration for farming videos
- 🏪 **AgriMart Outlet** - Premium agricultural products
- ♻️ **Waste Management** - Smart waste utilization solutions
- 👨‍🌾 **Farmer Network** - Connect with expert farmers
- 🤖 **AI Chatbot** - Integrated assistance system

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express
- **APIs:** YouTube Data API v3
- **Design:** Modern UI/UX with smooth animations

## 📝 API Endpoints

- `GET /api/health` - Health check
- `GET /api/reels` - Fetch farming videos
- `GET /api/reels/:videoId` - Specific video details

## 🔧 Development

```bash
# Install backend dependencies
cd backend && npm install

# Start development server
npm start

# Access the app at http://localhost:3001
```

## 📄 Project Structure

```
hardini-app/
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── .env               # Environment variables
├── assets/                 # Static assets (images)
├── styles.css             # Main stylesheet
├── index.html             # Main application
├── launch.bat             # Windows launcher
├── launch.sh              # Unix/Mac launcher
└── README.md              # This file
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 📞 Contact

**Indian Institute of Forest Management**
Bhopal, Madhya Pradesh, India

For support: support@hardini.com

## 📜 License

This project is part of IIFM Coalescence'25 initiative.

---

*Built with ❤️ by Team Aspirofy *
