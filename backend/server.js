const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Removed to prevent crash on Vercel
require('dotenv').config();
const { Communicate } = require('edge-tts-universal');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow all origins (CORS Fix for Vercel)
app.use(cors({
    origin: ['https://hardiniwebsite.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
const serviceAccountPath = './serviceAccountKey.json';
let serviceAccount;

const fs = require('fs'); // Added fs requirement

try {
    // 1. Try Environment Variable (Best for Render/Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('🔹 Using FIREBASE_SERVICE_ACCOUNT env var');
        // If it's a base64 string (common for easier copy-pasting), decode it
        if (!process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
            const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64');
            serviceAccount = JSON.parse(buff.toString('utf-8'));
        } else {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
    }
    // 2. Try Local File
    else if (fs.existsSync(serviceAccountPath)) {
        console.log('🔹 Using local serviceAccountKey.json');
        serviceAccount = require(serviceAccountPath);
    } else {
        throw new Error('No Firebase credentials found (Env Var or File)');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://hardini-3e576-default-rtdb.firebaseio.com"
    });
    console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Do not crash immediately, allowing health check to pass so we can debug
}

const db = admin.database();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Auth Middleware to verify Firebase ID Token
// Auth Middleware to verify Firebase ID Token
const verifyAuth = async (req, res, next) => {
    // Skip auth for preflight requests
    if (req.method === 'OPTIONS') return next();

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Check if it's the soil reading endpoint (ESP32 might not have token)
            // or health check or public APIs
            if (req.path === '/' || req.path === '/api/soil-readings' || req.path === '/api/health' || req.path === '/api/reels' || req.path === '/api/tts') {
                return next();
            }
            console.warn(`⚠️ Unauthorized access attempt to ${req.path}`);
            return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth verification failed:', error.message);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ success: false, error: 'Unauthorized: Token expired' });
        }
        return res.status(403).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

// Apply Auth Middleware globally (except excluded paths)
app.use(verifyAuth);


// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAxIpnyaoX0hCOVWn-Y1G-dLcuMK7JxGX8';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Farming-related search terms
const FARMING_SEARCH_TERMS = [
    'farming india', 'agriculture india', 'rice farming', 'wheat farming',
    'tractor farming', 'organic farming', 'vegetable farming', 'dairy farming'
];

const FALLBACK_VIDEOS = [
    { id: 'h1_K7pL8C1c', title: 'Modern Farming Technology in India', thumbnail: 'https://i.ytimg.com/vi/h1_K7pL8C1c/hqdefault.jpg', channelTitle: 'Farming Tech' },
    { id: 'X5l6l9w3w5k', title: 'Organic Farming Success Story', thumbnail: 'https://i.ytimg.com/vi/X5l6l9w3w5k/hqdefault.jpg', channelTitle: 'Kisan Of India' },
    { id: '8z7P7b8C8D8', title: 'Vegetable Farming Tips', thumbnail: 'https://i.ytimg.com/vi/8z7P7b8C8D8/hqdefault.jpg', channelTitle: 'Agri World' },
    { id: '1a2b3c4d5e6', title: 'Wheat Cultivation Process', thumbnail: 'https://i.ytimg.com/vi/1a2b3c4d5e6/hqdefault.jpg', channelTitle: 'Indian Farmer' },
    { id: '9f8e7d6c5b4', title: 'Smart Irrigation Systems', thumbnail: 'https://i.ytimg.com/vi/9f8e7d6c5b4/hqdefault.jpg', channelTitle: 'Smart Farm' }
];

// Get farming reels from YouTube API
app.get('/api/reels', async (req, res) => {
    try {
        const maxResults = Math.min(parseInt(req.query.limit) || 20, 10);
        const allVideos = [];

        // Simplified search for brevity in migration
        const searchTerm = FARMING_SEARCH_TERMS[Math.floor(Math.random() * FARMING_SEARCH_TERMS.length)];

        const searchResponse = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                key: YOUTUBE_API_KEY,
                q: searchTerm,
                type: 'video',
                part: 'snippet',
                maxResults: maxResults,
                regionCode: 'IN',
                relevanceLanguage: 'en'
            }
        });

        if (searchResponse.data.items) {
            const videos = searchResponse.data.items.map(video => ({
                id: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
                channelTitle: video.snippet.channelTitle,
            }));
            return res.json({ success: true, data: videos });
        }
        res.json({ success: true, data: [] });

    } catch (error) {
        console.error('Error fetching reels:', error.message);
        // Fallback to hardcoded videos on error to prevent UI breakage
        console.log('Serving fallback videos due to API error');
        res.json({ success: true, data: FALLBACK_VIDEOS });
    }
});

// Orders API Endpoints (Protected)

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        const { items, totalAmount, deliveryAddress, orderNotes, paymentMethod } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ success: false, error: 'Items required' });

        const orderData = {
            user_id: req.user.uid,
            user_email: req.user.email || 'unknown',
            items,
            total_amount: parseFloat(totalAmount),
            delivery_address: deliveryAddress || null,
            order_notes: orderNotes || null,
            payment_method: paymentMethod || 'COD',
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // Save to Firebase at users/{uid}/orders
        const newOrderRef = db.ref(`users/${req.user.uid}/orders`).push();
        await newOrderRef.set(orderData);

        res.status(201).json({
            success: true,
            data: { id: newOrderRef.key, ...orderData },
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get orders (Protected)
app.get('/api/orders', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        // Fetch orders for logged-in user
        const snapshot = await db.ref(`users/${req.user.uid}/orders`).once('value');
        const ordersObj = snapshot.val();

        const orders = [];
        if (ordersObj) {
            Object.keys(ordersObj).forEach(key => {
                orders.push({ id: key, ...ordersObj[key] });
            });
            // Sort by created_at desc
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        res.json({ success: true, data: orders, count: orders.length });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ============================================
// DEVICE MANAGEMENT API
// ============================================

// Register a new IoT device (Protected)
app.post('/api/devices', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        const { device_id, device_name, field_name, crop_type, connectivity } = req.body;

        if (!device_id || !device_name) {
            return res.status(400).json({ success: false, error: 'device_id and device_name are required' });
        }

        const deviceConfig = {
            device_id,
            device_name,
            field_name: field_name || '',
            crop_type: crop_type || '',
            connectivity: connectivity || 'wifi',
            registered_at: new Date().toISOString(),
            status: 'active'
        };

        await db.ref(`users/${req.user.uid}/devices/${device_id}/config`).set(deviceConfig);

        console.log(`Device ${device_id} registered for user ${req.user.uid}`);
        res.status(201).json({ success: true, data: deviceConfig, message: 'Device registered successfully' });

    } catch (error) {
        console.error('Device registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// List all devices for authenticated user (Protected)
app.get('/api/devices', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        const snapshot = await db.ref(`users/${req.user.uid}/devices`).once('value');
        const devicesObj = snapshot.val();
        const devices = [];

        if (devicesObj) {
            for (const [deviceId, deviceData] of Object.entries(devicesObj)) {
                const config = deviceData.config || {};
                // Get latest reading timestamp
                const dataSnapshot = await db.ref(`users/${req.user.uid}/devices/${deviceId}/data`)
                    .orderByChild('created_at')
                    .limitToLast(1)
                    .once('value');
                const latestData = dataSnapshot.val();
                let lastReading = null;
                let rssi = null;
                if (latestData) {
                    const entry = Object.values(latestData)[0];
                    lastReading = entry.created_at;
                    rssi = entry.rssi;
                }
                devices.push({
                    ...config,
                    device_id: deviceId,
                    last_reading: lastReading,
                    rssi: rssi
                });
            }
        }

        res.json({ success: true, data: devices });

    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a device registration (Protected)
app.delete('/api/devices/:deviceId', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        const { deviceId } = req.params;

        // Remove device config (keep data for historical records)
        await db.ref(`users/${req.user.uid}/devices/${deviceId}/config`).remove();

        console.log(`Device ${deviceId} removed for user ${req.user.uid}`);
        res.json({ success: true, message: 'Device removed successfully' });

    } catch (error) {
        console.error('Error removing device:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Soil Sensor Data API Endpoints

// Receive soil sensor data from ESP32 (Unauthenticated for device simplicity, uses body user_uid)
// In production, use a device secret or auth token
app.post('/api/soil-readings', async (req, res) => {
    try {
        const { user_uid, device_id, soil_temp_c, soil_moist_pct, ambient_temp_c, ambient_humidity_pct, rssi } = req.body;

        if (!user_uid || !device_id) {
            return res.status(400).json({ success: false, error: 'user_uid and device_id required' });
        }

        const readingData = {
            device_id,
            soil_temp_c: parseFloat(soil_temp_c) || 0,
            soil_moist_pct: parseFloat(soil_moist_pct) || 0,
            ambient_temp_c: parseFloat(ambient_temp_c) || 0,
            ambient_humidity_pct: parseFloat(ambient_humidity_pct) || 0,
            rssi: parseInt(rssi) || null,
            created_at: new Date().toISOString()
        };

        // Save to Firebase at users/{uid}/devices/{device_id}/data
        const newReadingRef = db.ref(`users/${user_uid}/devices/${device_id}/data`).push();
        await newReadingRef.set(readingData);

        console.log(`Soil reading saved for user ${user_uid}`);

        res.status(201).json({ success: true, message: 'Soil reading saved' });
    } catch (error) {
        console.error('Soil reading error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get soil readings (Protected)
app.get('/api/soil-readings/:deviceId', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

        const { deviceId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const uid = req.user.uid;

        const snapshot = await db.ref(`users/${uid}/devices/${deviceId}/data`)
            .orderByChild('created_at')
            .limitToLast(limit)
            .once('value');

        const readingsObj = snapshot.val();
        const readings = [];
        if (readingsObj) {
            Object.keys(readingsObj).forEach(key => {
                readings.push({ id: key, ...readingsObj[key] });
            });
            readings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        res.json({ success: true, data: readings });

    } catch (error) {
        console.error('Error fetching soil readings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// HARDINI AI CHATBOT
// ============================================
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const HARDINI_SYSTEM_PROMPT = `You are Hardini AI 🌾, an expert agricultural assistant.
IMPORTANT: The user is authenticated. 
Your expertise includes: Crop cultivation, Soil health, Pest control, Irrigation, Government schemes, Market prices.

🚨 STRICT DOMAIN RESTRICTION 🚨
You must ONLY answer questions related to agriculture, farming, gardening, rural development, and weather.
If the user asks about anything else (e.g., movies, politics, coding, general knowledge), politely decline and steer them back to farming.
Example: "I can only help with farming and agriculture related queries. Do you have any crops you need advice on?"

RULES:
1. Respond in the user's language.
2. Be practical and actionable.
3. Use emojis (🌾🌱).
4. Use the provided context (Weather, Soil, Prices) to give specific advice.
`;

// Helper: Fetch Weather from Open-Meteo
async function fetchWeather(lat, lon) {
    if (!lat || !lon) return null;
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        const response = await axios.get(url);
        const current = response.data.current;
        return `Current Weather: ${current.temperature_2m}°C, Humidity: ${current.relative_humidity_2m}%, Wind: ${current.wind_speed_10m} km/h, Rain: ${current.rain}mm. Code: ${current.weather_code}`;
    } catch (error) {
        console.error('Weather fetch error:', error.message);
        return null;
    }
}

// Helper: Fetch Mandi Prices (Mock/Real)
async function fetchMandiPrices(location, crop) {
    // In a real scenario, use data.gov.in API with an API Key.
    // usage: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_KEY&format=json&filters[state]=${state}&filters[commodity]=${crop}

    // Returning Mock Data for demonstration securely
    return `Market Prices (Mandi) in ${location || 'India'}:
- Wheat: ₹2125/quintal (Avg)
- Rice (Common): ₹2040/quintal
- Cotton: ₹6080/quintal
- Maize: ₹1962/quintal
*Prices are indicative.*`;
}

// Helper: Fetch Soil Data from Firebase
async function fetchUserSoilData(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}/devices`).once('value');
        const devices = snapshot.val();
        if (!devices) return null;

        let soilInfo = "User's Soil Data:\n";
        for (const [deviceId, deviceData] of Object.entries(devices)) {
            // Get latest reading
            const dataSnapshot = await db.ref(`users/${uid}/devices/${deviceId}/data`)
                .orderByChild('created_at')
                .limitToLast(1)
                .once('value');
            const latestData = dataSnapshot.val();
            if (latestData) {
                const reading = Object.values(latestData)[0];
                soilInfo += `- Device ${deviceData.config?.device_name || deviceId}: Moisture ${reading.soil_moist_pct}%, Temp ${reading.soil_temp_c}°C, pH ${reading.ph || 'N/A'}\n`;
            }
        }
        return soilInfo;
    } catch (error) {
        console.error('Soil data fetch error:', error);
        return null;
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        if (!GROQ_API_KEY) return res.status(503).json({ success: false, error: 'AI service not configured' });

        const { message, language, image, history, location } = req.body;
        // Personalization using Auth
        const userContext = req.user ? `User ID: ${req.user.uid}, Email: ${req.user.email}` : 'Guest User';

        if (!message && !image) return res.status(400).json({ success: false, error: 'Message required' });

        // --- RAG & Context Injection ---
        // Parallelize with Timeout (Max 1.5s wait for data)
        const TIMEOUT_MS = 1500;
        const withTimeout = (promise) => Promise.race([
            promise,
            new Promise(resolve => setTimeout(() => resolve(null), TIMEOUT_MS))
        ]);

        const promises = [];

        // 1. Weather
        if (location && location.latitude && location.longitude) {
            promises.push(withTimeout(fetchWeather(location.latitude, location.longitude)).then(res => res ? `[Wait] ${res}` : null));
        } else {
            promises.push(Promise.resolve(null));
        }

        // 2. Soil Data
        if (req.user) {
            promises.push(withTimeout(fetchUserSoilData(req.user.uid)).then(res => res ? `[Soil Sensors] ${res}` : null));
        } else {
            promises.push(Promise.resolve(null));
        }

        // 3. Market Prices
        const lowerMsg = message ? message.toLowerCase() : '';
        if (lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('mandi') || lowerMsg.includes('bhav')) {
            promises.push(withTimeout(fetchMandiPrices("User Location", "All")).then(res => res ? `[Market] ${res}` : null));
        } else {
            promises.push(Promise.resolve(null));
        }

        const results = await Promise.allSettled(promises);
        const contextData = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value)
            .join('\n');

        const messages = [
            { role: 'system', content: HARDINI_SYSTEM_PROMPT + `\nContext: ${userContext}\nReal-time Data:\n${contextData}` + (language ? `\nRespond in ${language}. Keep it short.` : '') }
        ];

        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-6); // Reduced history context for speed
            recentHistory.forEach(msg => messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }));
        }

        // Use High Quality Model
        let model = 'llama-3.3-70b-versatile';
        if (image) {
            model = 'llama-3.2-90b-vision-preview'; // High quality vision model
            const userContent = [
                { type: 'text', text: message || 'Analyze this agricultural image.' },
                { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } }
            ];
            messages.push({ role: 'user', content: userContent });
        } else {
            messages.push({ role: 'user', content: message });
        }

        const groqResponse = await axios.post(GROQ_API_URL, {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024 // Restore token limit
        }, { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } });

        const reply = groqResponse.data.choices[0]?.message?.content || 'Error generating response.';

        // Save chat log to Firebase for history/audit
        if (req.user) {
            db.ref(`users/${req.user.uid}/chat_history`).push({
                role: 'user', content: message || '[Image]', timestamp: Date.now()
            });
            db.ref(`users/${req.user.uid}/chat_history`).push({
                role: 'assistant', content: reply, timestamp: Date.now()
            });
        }

        res.json({ success: true, reply: reply });

    } catch (error) {
        console.error('Chat API error:', error.message);
        res.status(500).json({ success: false, error: 'AI Error: ' + error.message });
    }
});

// ============================================
// TTS — Google Translate (Reliable & Fast)
// ============================================
const googleTTS = require('google-tts-api');
const GOOGLE_LANG_MAP = {
    'English': 'en', 'Hindi': 'hi', 'Marathi': 'mr', 'Telugu': 'te', 'Tamil': 'ta',
    'Bengali': 'bn', 'Kannada': 'kn', 'Gujarati': 'gu', 'Punjabi': 'pa', 'Malayalam': 'ml',
    'Odia': 'or', 'Urdu': 'ur', 'Spanish': 'es', 'French': 'fr', 'Arabic': 'ar'
};

app.post('/api/tts', async (req, res) => {
    try {
        const { text, language } = req.body;
        if (!text) return res.status(400).json({ success: false, error: 'Text required' });

        const cleanText = text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            .replace(/[#_`~@$%^&|+={}\[\]:;"<>\\\/]/g, '')
            .replace(/^[•\-] /gm, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200);

        const langCode = GOOGLE_LANG_MAP[language] || 'en';
        const base64 = await googleTTS.getAudioBase64(cleanText, {
            lang: langCode, slow: false, host: 'https://translate.google.com', timeout: 10000,
        });
        const audioBuffer = Buffer.from(base64, 'base64');

        res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audioBuffer.length, 'Cache-Control': 'no-cache' });
        res.send(audioBuffer);

    } catch (error) {
        console.error('TTS error:', error.message);
        res.status(500).json({ success: false, error: 'TTS Failed' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hardini Backend API is running (Firebase Admin)',
        timestamp: new Date().toISOString(),
        groqConfigured: !!GROQ_API_KEY
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hardini Backend is Running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Only run the server if executed directly (not when imported by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Hardini Backend Server running on port ${PORT}`);
        if (serviceAccount) {
            console.log(`🔥 Firebase Project: ${serviceAccount.project_id}`);
        } else {
            console.log('⚠️ Firebase not initialized (Missing Credentials)');
        }
    });
}

module.exports = app;
