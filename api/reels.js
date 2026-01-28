const axios = require('axios');

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

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
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
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
