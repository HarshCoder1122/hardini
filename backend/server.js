const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hardini Backend API is running',
        timestamp: new Date().toISOString()
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
