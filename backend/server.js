const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('⚠️  Supabase credentials not configured. Orders API will not work.');
}

// For now using anon key - in production, use service role key or create proper RLS policies
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Firebase Configuration
const firebaseDatabaseURL = 'https://hardini-d2114-default-rtdb.asia-southeast1.firebasedatabase.app/';

// Firebase is configured - we'll use REST API for public database
let firebaseConfigured = true;
console.log('✅ Firebase Realtime Database configured (using REST API)');

// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAxIpnyaoX0hCOVWn-Y1G-dLcuMK7JxGX8';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Farming-related search terms
const FARMING_SEARCH_TERMS = [
    'farming india',
    'agriculture india',
    'rice farming',
    'wheat farming',
    'tractor farming',
    'organic farming india',
    'vegetable farming',
    'dairy farming india',
    'crop farming',
    'traditional farming india',
    'modern farming techniques',
    'farm life india',
    'agricultural practices india'
];

// Get farming reels from YouTube API
app.get('/api/reels', async (req, res) => {
    try {
        const maxResults = Math.min(parseInt(req.query.limit) || 20, 10); // Limit to 10 videos max to save quota
        const allVideos = [];

        // Search for farming videos using multiple search terms
        for (const searchTerm of FARMING_SEARCH_TERMS) {
            if (allVideos.length >= maxResults) break;

            try {
                const searchResponse = await axios.get(`${YOUTUBE_API_URL}/search`, {
                    params: {
                        key: YOUTUBE_API_KEY,
                        q: searchTerm,
                        type: 'video',
                        part: 'snippet',
                        maxResults: Math.min(10, maxResults - allVideos.length),
                        order: 'relevance',
                        regionCode: 'IN', // Focus on Indian content
                        relevanceLanguage: 'en'
                    }
                });

                if (searchResponse.data.items) {
                    // Get detailed video information
                    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

                    const videoResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
                        params: {
                            key: YOUTUBE_API_KEY,
                            id: videoIds,
                            part: 'snippet,statistics,contentDetails'
                        }
                    });

                    const farmingVideos = videoResponse.data.items
                        .filter(video => {
                            // Filter for farming/agriculture related content
                            const title = video.snippet.title.toLowerCase();
                            const description = video.snippet.description.toLowerCase();
                            const channelTitle = video.snippet.channelTitle.toLowerCase();

                            const farmingKeywords = [
                                'farm', 'agri', 'crop', 'rice', 'wheat', 'tractor', 'harvest',
                                'farming', 'agriculture', 'dairy', 'cattle', 'vegetable',
                                'organic', 'pesticide', 'fertilizer', 'irrigation', 'soil',
                                'cultivation', 'plantation', 'gardening', 'horticulture'
                            ];

                            return farmingKeywords.some(keyword =>
                                title.includes(keyword) ||
                                description.includes(keyword) ||
                                channelTitle.includes(keyword)
                            );
                        })
                        .map(video => ({
                            id: video.id,
                            title: video.snippet.title,
                            description: video.snippet.description,
                            thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
                            channelTitle: video.snippet.channelTitle,
                            publishedAt: video.snippet.publishedAt,
                            viewCount: video.statistics?.viewCount || '0',
                            likeCount: video.statistics?.likeCount || '0',
                            duration: video.contentDetails?.duration || 'PT0S',
                            tags: video.snippet.tags || []
                        }));

                    allVideos.push(...farmingVideos);
                }
            } catch (error) {
                console.log(`Error searching for "${searchTerm}":`, error.message);
                continue; // Continue with next search term
            }
        }

        // Remove duplicates and limit results
        const uniqueVideos = allVideos.filter((video, index, self) =>
            index === self.findIndex(v => v.id === video.id)
        ).slice(0, maxResults);

        // Shuffle the results for variety
        const shuffledVideos = uniqueVideos.sort(() => Math.random() - 0.5);

        res.json({
            success: true,
            data: shuffledVideos,
            count: shuffledVideos.length
        });

    } catch (error) {
        console.error('Error fetching farming reels:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch farming reels',
            message: error.message
        });
    }
});

// Get specific video details
app.get('/api/reels/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: {
                key: YOUTUBE_API_KEY,
                id: videoId,
                part: 'snippet,statistics,contentDetails'
            }
        });

        if (response.data.items && response.data.items.length > 0) {
            const video = response.data.items[0];
            res.json({
                success: true,
                data: {
                    id: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
                    channelTitle: video.snippet.channelTitle,
                    publishedAt: video.snippet.publishedAt,
                    viewCount: video.statistics?.viewCount || '0',
                    likeCount: video.statistics?.likeCount || '0',
                    duration: video.contentDetails?.duration || 'PT0S'
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

    } catch (error) {
        console.error('Error fetching video details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video details',
            message: error.message
        });
    }
});

// Orders API Endpoints

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({
                success: false,
                error: 'Database not configured'
            });
        }

        console.log('Received order request:', JSON.stringify(req.body, null, 2));

        const { items, totalAmount, deliveryAddress, orderNotes, paymentMethod } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Validation failed: items =', items, 'Array.isArray(items) =', Array.isArray(items), 'items.length =', items?.length);
            return res.status(400).json({
                success: false,
                error: 'At least one item is required'
            });
        }

        if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid total amount is required'
            });
        }

        // For guest orders, use a constant guest user ID
        // In production, you'd get user_id from JWT token for authenticated users
        const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'; // Constant guest ID

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: GUEST_USER_ID, // Use constant guest ID instead of null
                items: items,
                total_amount: parseFloat(totalAmount),
                delivery_address: deliveryAddress || null,
                order_notes: orderNotes || null,
                payment_method: paymentMethod || 'COD',
                status: 'pending'
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return res.status(500).json({
                success: false,
                error: 'Failed to create order',
                message: orderError.message
            });
        }

        res.status(201).json({
            success: true,
            data: orderData,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get orders (for authenticated users)
app.get('/api/orders', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({
                success: false,
                error: 'Database not configured'
            });
        }

        // In production, you'd get user_id from JWT token
        // For now, return empty array or guest orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .is('user_id', null) // Guest orders
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch orders',
                message: ordersError.message
            });
        }

        res.json({
            success: true,
            data: orders || [],
            count: orders ? orders.length : 0
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Soil Sensor Data API Endpoints

// Receive soil sensor data from ESP32 devices
app.post('/api/soil-readings', async (req, res) => {
    try {
        if (!firebaseConfigured) {
            return res.status(503).json({
                success: false,
                error: 'Firebase database not configured'
            });
        }

        console.log('Received soil sensor data:', JSON.stringify(req.body, null, 2));

        const {
            user_uid,
            device_id,
            soil_temp_c,
            soil_moist_pct,
            ambient_temp_c,
            ambient_humidity_pct,
            rssi
        } = req.body;

        // Validate required fields
        if (!user_uid) {
            return res.status(400).json({
                success: false,
                error: 'user_uid is required'
            });
        }

        if (!device_id) {
            return res.status(400).json({
                success: false,
                error: 'device_id is required'
            });
        }

        // Prepare data for Firebase
        const readingData = {
            device_id: device_id,
            soil_temp_c: parseFloat(soil_temp_c) || 0,
            soil_moist_pct: parseFloat(soil_moist_pct) || 0,
            ambient_temp_c: parseFloat(ambient_temp_c) || 0,
            ambient_humidity_pct: parseFloat(ambient_humidity_pct) || 0,
            rssi: parseInt(rssi) || null,
            created_at: new Date().toISOString()
        };

        // Send data to Firebase using REST API - new structure: users/{user_uid}/devices/{device_id}/data/
        const firebaseUrl = `${firebaseDatabaseURL}users/${user_uid}/devices/${device_id}/data.json`;
        const response = await axios.post(firebaseUrl, readingData);

        console.log('Soil reading saved successfully to Firebase');

        res.status(201).json({
            success: true,
            data: { ...readingData, id: response.data.name },
            message: 'Soil reading saved successfully'
        });

    } catch (error) {
        console.error('Soil reading error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get soil readings for a specific device
app.get('/api/soil-readings/:deviceId', async (req, res) => {
    try {
        if (!firebaseConfigured) {
            return res.status(503).json({
                success: false,
                error: 'Firebase database not configured'
            });
        }

        const { deviceId } = req.params;
        const userUid = req.query.user_uid;
        const limit = parseInt(req.query.limit) || 50;

        // Validate required fields
        if (!userUid) {
            return res.status(400).json({
                success: false,
                error: 'user_uid query parameter is required'
            });
        }

        // Get readings from Firebase using REST API - new structure: users/{user_uid}/devices/{device_id}/data/
        let firebaseUrl;
        if (deviceId === 'soilprobe1') {
            // Map soilprobe1 to ESP32_1 device data
            firebaseUrl = `${firebaseDatabaseURL}users/${userUid}/devices/ESP32_1/data.json`;
        } else {
            // For other devices, use the new user-specific path
            firebaseUrl = `${firebaseDatabaseURL}users/${userUid}/devices/${deviceId}/data.json`;
        }

        const response = await axios.get(firebaseUrl);

        const readings = [];
        if (response.data) {
            // Convert Firebase response to array format
            Object.keys(response.data).forEach(key => {
                const reading = response.data[key];
                readings.push({
                    id: key,
                    device_id: deviceId,
                    soil_temp_c: parseFloat(reading.soil_temp_c) || 0,
                    soil_moist_pct: parseFloat(reading.soil_moist_pct) || 0,
                    ambient_temp_c: parseFloat(reading.ambient_temp_c) || 0,
                    ambient_humidity_pct: parseFloat(reading.ambient_humidity_pct) || 0,
                    rssi: parseInt(reading.rssi) || null,
                    created_at: reading.created_at || new Date().toISOString()
                });
            });

            // Sort by created_at descending (most recent first)
            readings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Apply limit after sorting
            const limitedReadings = readings.slice(0, limit);
            res.json({
                success: true,
                data: limitedReadings,
                count: limitedReadings.length
            });
        } else {
            res.json({
                success: true,
                data: [],
                count: 0
            });
        }

    } catch (error) {
        console.error('Error fetching soil readings:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hardini Backend API is running',
        timestamp: new Date().toISOString(),
        supabaseConfigured: !!supabase,
        firebaseConfigured: firebaseConfigured
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hardini Backend Server running on port ${PORT}`);
    console.log(`📊 YouTube API Key: ${YOUTUBE_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎥 Farming Reels API: http://localhost:${PORT}/api/reels`);
});

module.exports = app;
