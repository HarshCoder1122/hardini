const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
require('dotenv').config();
const { Communicate } = require('edge-tts-universal');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Try standard URL format. If it fails, user needs to check Console.
        databaseURL: "https://hardini-3e576-default-rtdb.firebaseio.com"
    });
    console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
}

const db = admin.database();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Middleware to verify Firebase ID Token
const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Check if it's the soil reading endpoint (ESP32 might not have token)
            // or health check
            if (req.path === '/api/soil-readings' || req.path === '/api/health' || req.path === '/api/reels' || req.path === '/api/tts') {
                return next();
            }
            return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth verification failed:', error.message);
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
        res.status(500).json({ success: false, error: 'Failed to fetch reels' });
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
RULES:
1. Respond in the user's language.
2. Be practical and actionable.
3. Use emojis (🌾🌱).
`;

app.post('/api/chat', async (req, res) => {
    try {
        if (!GROQ_API_KEY) return res.status(503).json({ success: false, error: 'AI service not configured' });

        const { message, language, image, history } = req.body;
        // Personalization using Auth
        const userContext = req.user ? `User ID: ${req.user.uid}, Email: ${req.user.email}` : 'Guest User';

        if (!message && !image) return res.status(400).json({ success: false, error: 'Message required' });

        const messages = [
            { role: 'system', content: HARDINI_SYSTEM_PROMPT + `\nContext: ${userContext}` + (language ? `\nRespond in ${language}.` : '') }
        ];

        if (history && Array.isArray(history)) {
            const recentHistory = history.slice(-10);
            recentHistory.forEach(msg => messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }));
        }

        let model = 'llama-3.3-70b-versatile';
        if (image) {
            model = 'meta-llama/llama-4-scout-17b-16e-instruct';
            const userContent = [
                { type: 'text', text: message || 'Analyze this agricultural image.' },
                { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } }
            ];
            messages.push({ role: 'user', content: userContent });
        } else {
            messages.push({ role: 'user', content: message });
        }

        const groqResponse = await axios.post(GROQ_API_URL, {
            model: model, messages: messages, temperature: 0.7, max_tokens: 1024
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

app.listen(PORT, () => {
    console.log(`🚀 Hardini Backend Server running on port ${PORT}`);
    console.log(`🔥 Firebase Project: ${serviceAccount.project_id}`);
});

module.exports = app;
