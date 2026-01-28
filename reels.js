// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyAxIpnyaoX0hCOVWn-Y1G-dLcuMK7JxGX8';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Global variables for reels data and filtering
let allFarmingReels = [];
let filteredReels = [];
let currentFilters = {
    search: '',
    category: '',
    duration: '',
    sort: 'relevance'
};

// DOM Elements
const reelsContainer = document.getElementById('reelsContainer');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalViews = document.getElementById('modalViews');
const modalLikes = document.getElementById('modalLikes');
const modalChannel = document.getElementById('modalChannel');
const closeModal = document.getElementById('closeModal');
const loadingScreen = document.getElementById('loadingScreen');

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeReels();
    setupEventListeners();
    fetchFarmingReels();
});

// Initialize reels functionality
function initializeReels() {
    if (reelsContainer) {
        reelsContainer.innerHTML = '';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking close button
    if (closeModal) {
        closeModal.addEventListener('click', closeVideoModal);
    }

    // Close modal when clicking outside the video
    if (videoModal) {
        videoModal.addEventListener('click', function (e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Filter panel
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const closeFilter = document.getElementById('closeFilter');
    const applyFilters = document.getElementById('applyFilters');

    if (filterBtn) {
        filterBtn.addEventListener('click', function () {
            if (filterPanel) {
                filterPanel.classList.add('active');
            }
        });
    }

    if (closeFilter) {
        closeFilter.addEventListener('click', function () {
            if (filterPanel) {
                filterPanel.classList.remove('active');
            }
        });
    }

    if (applyFilters) {
        applyFilters.addEventListener('click', function () {
            // Get filter values
            const categoryFilter = document.getElementById('categoryFilter');
            const durationFilter = document.getElementById('durationFilter');
            const sortFilter = document.getElementById('sortFilter');

            currentFilters.category = categoryFilter ? categoryFilter.value : '';
            currentFilters.duration = durationFilter ? durationFilter.value : '';
            currentFilters.sort = sortFilter ? sortFilter.value : 'relevance';

            applyFilters();
            if (filterPanel) {
                filterPanel.classList.remove('active');
            }
        });
    }
}

// Fetch farming reels directly from YouTube API
async function fetchFarmingReels() {
    try {
        console.log('Fetching farming reels from YouTube API...');
        showLoading(true);

        // Search for farming videos
        const searchResponse = await fetch(
            `${YOUTUBE_API_URL}/search?key=${YOUTUBE_API_KEY}&q=farming+india+agriculture+organic&type=video&part=snippet&maxResults=10&order=relevance&regionCode=IN&relevanceLanguage=en`
        );

        if (!searchResponse.ok) {
            throw new Error('YouTube API search failed');
        }

        const searchData = await searchResponse.json();
        console.log('YouTube Search Response:', searchData);

        if (searchData.items && searchData.items.length > 0) {
            // Get video IDs for statistics
            const videoIds = searchData.items.map(item => item.id.videoId).join(',');

            // Fetch video statistics
            const statsResponse = await fetch(
                `${YOUTUBE_API_URL}/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=snippet,statistics,contentDetails`
            );

            if (!statsResponse.ok) {
                throw new Error('YouTube API stats failed');
            }

            const statsData = await statsResponse.json();
            console.log('YouTube Stats Response:', statsData);

            allFarmingReels = statsData.items.map(video => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
                channelTitle: video.snippet.channelTitle,
                publishedAt: video.snippet.publishedAt,
                viewCount: video.statistics?.viewCount || '0',
                likeCount: video.statistics?.likeCount || '0',
                duration: video.contentDetails?.duration || 'PT0S'
            }));

            console.log('Loaded', allFarmingReels.length, 'videos from YouTube API');
            filteredReels = [...allFarmingReels];
            renderReels(filteredReels);
        } else {
            console.warn('No videos found from YouTube API - using fallback reels');
            loadFallbackReels();
        }
    } catch (error) {
        console.error('Error fetching farming reels from YouTube:', error);
        loadFallbackReels();
    } finally {
        showLoading(false);
    }
}

// Load fallback reels when API fails
function loadFallbackReels() {
    allFarmingReels = [
        {
            id: 'IJNR2EpS0jw',
            title: 'Sustainable Rice Farming Techniques for Higher yields',
            description: 'Learn modern rice farming methods that increase productivity while protecting the environment',
            channelTitle: 'AgriPro Tech',
            viewCount: '1250000',
            likeCount: '45000',
            duration: 'PT5M30S',
            thumbnail: 'https://img.youtube.com/vi/IJNR2EpS0jw/maxresdefault.jpg',
            publishedAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 'EmVuUY35rBY',
            title: 'Smart Irrigation Systems for Crop Optimization',
            description: 'Discover how precision irrigation can save water and boost farm productivity',
            channelTitle: 'FarmTech Solutions',
            viewCount: '850000',
            likeCount: '32000',
            duration: 'PT4M15S',
            thumbnail: 'https://img.youtube.com/vi/EmVuUY35rBY/maxresdefault.jpg',
            publishedAt: '2024-01-20T14:30:00Z'
        },
        {
            id: 'fWyPBZUGRjA',
            title: 'Organic Pest Control Methods for Modern Farming',
            description: 'Natural alternatives to chemical pesticides for healthy crop production',
            channelTitle: 'Green Farm Academy',
            viewCount: '680000',
            likeCount: '28000',
            duration: 'PT6M45S',
            thumbnail: 'https://img.youtube.com/vi/fWyPBZUGRjA/maxresdefault.jpg',
            publishedAt: '2024-01-25T09:15:00Z'
        },
        {
            id: 'hCDzSR6bW1k',
            title: 'Drone Technology Revolutionizing Agriculture',
            description: 'How agricultural drones are changing precision farming forever',
            channelTitle: 'AgriDrones Pro',
            viewCount: '920000',
            likeCount: '38000',
            duration: 'PT7M20S',
            thumbnail: 'https://img.youtube.com/vi/hCDzSR6bW1k/maxresdefault.jpg',
            publishedAt: '2024-02-01T16:45:00Z'
        },
        {
            id: '3YEL9ZKfEE8',
            title: 'Advanced Tractor Technology for Efficient Farming',
            description: 'Modern tractors and machinery that boost farm productivity',
            channelTitle: 'Farm Machinery Hub',
            viewCount: '1100000',
            likeCount: '42000',
            duration: 'PT5M10S',
            thumbnail: 'https://img.youtube.com/vi/3YEL9ZKfEE8/maxresdefault.jpg',
            publishedAt: '2024-02-05T11:20:00Z'
        },
        {
            id: 'PoQW_rdJlJ4',
            title: 'Vertical Farming Systems for Urban Agriculture',
            description: 'Growing food in cities using innovative vertical farming technology',
            channelTitle: 'Urban Farm Tech',
            viewCount: '760000',
            likeCount: '31000',
            duration: 'PT8M05S',
            thumbnail: 'https://img.youtube.com/vi/PoQW_rdJlJ4/maxresdefault.jpg',
            publishedAt: '2024-02-10T13:30:00Z'
        },
        {
            id: 'jvzWvr5TIEM',
            title: 'Soil Health Management for Better Crop Production',
            description: 'Essential soil management practices for healthy and productive farms',
            channelTitle: 'Soil Science Academy',
            viewCount: '590000',
            likeCount: '25000',
            duration: 'PT6M30S',
            thumbnail: 'https://img.youtube.com/vi/jvzWvr5TIEM/maxresdefault.jpg',
            publishedAt: '2024-02-15T08:45:00Z'
        },
        {
            id: 'QZ4TK4EYd9M',
            title: 'Automated Greenhouses for Year-Round Harvesting',
            description: 'Climate-controlled greenhouse technology for consistent crop production',
            channelTitle: 'Greenhouse Solutions',
            viewCount: '810000',
            likeCount: '33000',
            duration: 'PT7M45S',
            thumbnail: 'https://img.youtube.com/vi/QZ4TK4EYd9M/maxresdefault.jpg',
            publishedAt: '2024-02-20T12:10:00Z'
        }
    ];
    filteredReels = [...allFarmingReels];
    renderReels(filteredReels);
    console.log('Fallback reels loaded:', allFarmingReels.length, 'videos');
}

// Show/hide loading screen
function showLoading(show) {
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'flex' : 'none';
    }
}



// Apply filters to reels
function applyFilters() {
    filteredReels = allFarmingReels.filter(reel => {
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            const title = reel.title ? reel.title.toLowerCase() : '';
            const description = reel.description ? reel.description.toLowerCase() : '';
            const channel = reel.channelTitle ? reel.channelTitle.toLowerCase() : '';

            if (!title.includes(searchTerm) && !description.includes(searchTerm) && !channel.includes(searchTerm)) {
                return false;
            }
        }

        // Category filter
        if (currentFilters.category) {
            const category = currentFilters.category.toLowerCase();
            const title = reel.title ? reel.title.toLowerCase() : '';
            const description = reel.description ? reel.description.toLowerCase() : '';

            const categoryKeywords = {
                'farming': ['farm', 'farming'],
                'agriculture': ['agri', 'agriculture', 'crop'],
                'agro-tech': ['tech', 'drone', 'smart', 'precision'],
                'organic': ['organic', 'natural', 'sustainable'],
                'sustainable': ['sustainable', 'green', 'eco'],
                'machinery': ['tractor', 'machine', 'equipment'],
                'crops': ['rice', 'wheat', 'crop', 'vegetable'],
                'livestock': ['cow', 'dairy', 'livestock', 'animal']
            };

            const keywords = categoryKeywords[category] || [];
            if (!keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
                return false;
            }
        }

        // Duration filter
        if (currentFilters.duration) {
            const duration = parseDuration(reel.duration || 'PT0S');
            const durationType = currentFilters.duration;

            if (durationType === 'short' && duration >= 300) return false; // 5+ minutes
            if (durationType === 'medium' && (duration < 300 || duration > 900)) return false; // 5-15 minutes
            if (durationType === 'long' && duration <= 900) return false; // 15+ minutes
        }

        return true;
    });

    // Apply sorting
    sortReels();

    // Render filtered results
    renderReels(filteredReels);
}

// Sort reels based on current filter
function sortReels() {
    switch (currentFilters.sort) {
        case 'viewCount':
            filteredReels.sort((a, b) => parseInt(b.viewCount || 0) - parseInt(a.viewCount || 0));
            break;
        case 'rating':
            filteredReels.sort((a, b) => parseInt(b.likeCount || 0) - parseInt(a.likeCount || 0));
            break;
        case 'uploadDate':
            filteredReels.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
            break;
        case 'relevance':
        default:
            // Keep original order for relevance
            break;
    }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
}

// Render reels in the container
function renderReels(reels) {
    if (!reelsContainer) return;

    reelsContainer.innerHTML = '';

    if (reels.length === 0) {
        reelsContainer.innerHTML = `
            <div class="no-results">
                <h3>No farming videos found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    reels.forEach((reel, index) => {
        const reelCard = createReelCard(reel, index);
        reelsContainer.appendChild(reelCard);
    });
}

// Create reel item element
function createReelCard(reel, index) {
    const reelItem = document.createElement('div');
    reelItem.className = 'reel-item';
    reelItem.setAttribute('data-index', index);

    // Format view and like counts
    const viewCount = formatCount(reel.viewCount);
    const likeCount = formatCount(reel.likeCount);

    reelItem.innerHTML = `
        <div class="reel-video-container">
            <iframe
                class="reel-video"
                src="https://www.youtube.com/embed/${reel.id}?autoplay=0&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1"
                frameborder="0"
                allowfullscreen
                poster="${reel.thumbnail}"
            ></iframe>
            <div class="play-button">▶️</div>
        </div>
        <div class="reel-overlay">
            <div class="reel-content">
                <div class="reel-header">
                    <div class="reel-avatar">${getAvatarEmoji(reel.title)}</div>
                    <div class="reel-info">
                        <h3>${reel.channelTitle || 'Agri Channel'}</h3>
                    </div>
                </div>
                <div class="reel-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); likeReel(${index})">
                        <i class="fas fa-heart"></i>
                        <span class="action-count">${likeCount}</span>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); shareReel(${index})">
                        <i class="fas fa-share"></i>
                        <span class="action-count">Share</span>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); saveReel(${index})">
                        <i class="fas fa-bookmark"></i>
                        <span class="action-count">Save</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add intersection observer for autoplay
    const iframe = reelItem.querySelector('.reel-video');
    if (iframe) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Try to autoplay when in view
                    try {
                        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                        // Try to unmute after playing
                        setTimeout(() => {
                            try {
                                iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                            } catch (e) {
                                console.log('Could not unmute video');
                            }
                        }, 500);
                        reelItem.querySelector('.play-button').style.display = 'none';
                    } catch (e) {
                        // Fallback: show play button
                        reelItem.querySelector('.play-button').style.display = 'block';
                    }
                } else {
                    // Pause when out of view
                    try {
                        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    } catch (e) {
                        // Ignore errors
                    }
                }
            });
        }, { threshold: 0.5 });

        observer.observe(iframe);

        // Click to play/pause
        iframe.addEventListener('load', () => {
            iframe.contentWindow.postMessage('{"event":"listening"}', '*');
        });

        // Click on reel item to open modal fullscreen
        reelItem.addEventListener('click', (e) => {
            // Don't open modal if clicking on action buttons
            if (!e.target.closest('.action-btn')) {
                openVideoModal(index);
            }
        });
    }

    return reelItem;
}

// Helper functions
function getAvatarEmoji(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('rice') || lowerTitle.includes('wheat')) return '🌾';
    if (lowerTitle.includes('tractor') || lowerTitle.includes('farm')) return '🚜';
    if (lowerTitle.includes('organic') || lowerTitle.includes('vegetable')) return '🌱';
    if (lowerTitle.includes('dairy') || lowerTitle.includes('cow')) return '🐄';
    if (lowerTitle.includes('drone') || lowerTitle.includes('tech')) return '🚁';
    return '👨‍🌾';
}

function getCategoryLabel(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('rice') || lowerTitle.includes('wheat')) return 'Crop Farming';
    if (lowerTitle.includes('tractor')) return 'Farm Equipment';
    if (lowerTitle.includes('organic')) return 'Sustainable Farming';
    if (lowerTitle.includes('dairy') || lowerTitle.includes('cow')) return 'Livestock';
    if (lowerTitle.includes('drone')) return 'AgriTech';
    if (lowerTitle.includes('vegetable')) return 'Vegetable Farming';
    return 'Agriculture';
}

function formatCount(count) {
    const num = parseInt(count) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Open video modal
function openVideoModal(index) {
    const reel = filteredReels[index];
    if (videoModal && reel) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Load video content
        if (modalTitle) modalTitle.textContent = reel.title || 'Farming Video';
        if (modalDescription) modalDescription.textContent = reel.description || 'Learn about modern farming techniques';
        if (modalViews) modalViews.textContent = `👁️ ${formatCount(reel.viewCount)} views`;
        if (modalLikes) modalLikes.textContent = `👍 ${formatCount(reel.likeCount)} likes`;
        if (modalChannel) modalChannel.textContent = `📺 ${reel.channelTitle || 'Agri Channel'}`;
        if (modalVideo) {
            // Start muted for autoplay compatibility, then unmute after video loads
            modalVideo.src = `https://www.youtube.com/embed/${reel.id}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;

            // Try to unmute after the video starts playing
            setTimeout(() => {
                try {
                    modalVideo.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                } catch (e) {
                    console.log('Could not unmute video automatically');
                }
            }, 1000); // Wait 1 second for video to load, then try to unmute
        }
    }
}

// Close video modal
function closeVideoModal() {
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalVideo) {
            modalVideo.src = '';
        }
    }
}

// Like reel functionality
function likeReel(index) {
    const likeBtn = document.querySelectorAll('.action-btn')[index * 3];
    if (likeBtn) {
        likeBtn.classList.toggle('liked');
        const countSpan = likeBtn.querySelector('.action-count');
        if (countSpan) {
            let count = parseInt(countSpan.textContent.replace('K', '000').replace('M', '000000')) || 0;
            count = likeBtn.classList.contains('liked') ? count + 1 : count - 1;
            countSpan.textContent = formatCount(count);
        }
    }
}

// Share reel functionality
function shareReel(index) {
    const reel = filteredReels[index];
    if (!reel) return;

    const reelUrl = `https://www.youtube.com/watch?v=${reel.id}`;

    if (navigator.share) {
        navigator.share({
            title: reel.title || 'Check out this farming reel!',
            text: 'Amazing farming content from AgriReels',
            url: reelUrl
        });
    } else {
        navigator.clipboard.writeText(reelUrl).then(() => {
            showNotification('Link copied to clipboard!');
        });
    }
}

// Save reel functionality
function saveReel(index) {
    const saveBtn = document.querySelectorAll('.action-btn')[index * 3 + 2];
    if (saveBtn) {
        saveBtn.classList.toggle('saved');
        const isSaved = saveBtn.classList.contains('saved');
        showNotification(isSaved ? 'Reel saved!' : 'Reel removed from saved');
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
