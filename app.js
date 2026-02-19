/* ===== HARDINI WEBAPP - app.js ===== */
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : 'https://hardini.onrender.com';

// ===== SPA ROUTER =====
function navigateTo(page) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById('page-' + page);
    if (view) view.classList.add('active');
    document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));
    window.location.hash = page;
    // Trigger page-specific loading
    if (page === 'reels' && !window._reelsLoaded) loadReels();
    if (page === 'marketplace' && !window._marketLoaded) { renderProducts('seeds'); window._marketLoaded = true; }
    if (page === 'soilprobe' && !window._devicesLoaded) { loadDevices(); window._devicesLoaded = true; }
}

// Init nav clicks
document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// Handle hash routing
window.addEventListener('hashchange', () => {
    const page = location.hash.slice(1) || 'home';
    navigateTo(page);
});
window.addEventListener('DOMContentLoaded', () => {
    const page = location.hash.slice(1) || 'home';
    navigateTo(page);
});

// ===== NOTIFICATIONS =====
function showNotification(msg, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${msg}`;
    document.body.appendChild(n);
    requestAnimationFrame(() => n.classList.add('show'));
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 3500);
}

// ===== MODALS =====
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
}
// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});

// ===== PROFILE DROPDOWN =====
function toggleProfileDropdown() {
    document.getElementById('profileDropdown').classList.toggle('active');
}
document.addEventListener('click', e => {
    const d = document.getElementById('profileDropdown');
    const u = document.getElementById('sidebarUser');
    if (d && !d.contains(e.target) && !u.contains(e.target)) d.classList.remove('active');
});

// ===== AUTH INTEGRATION =====
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const name = user.displayName || user.email.split('@')[0];
        document.getElementById('userName').textContent = name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatarInitial').textContent = name.charAt(0).toUpperCase();
        // Pre-fill edit profile
        document.getElementById('editFullName').value = user.displayName || '';
    }
});

function getAuthToken() {
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            if (user) {
                user.getIdToken().then(resolve).catch(() => resolve(null));
            } else {
                resolve(null);
            }
        });
    });
}

function logout() {
    firebase.auth().signOut().then(() => { window.location.href = 'login.html'; });
}

// ===== MARKETPLACE PRODUCTS =====
const PRODUCTS = {
    seeds: [
        { name: 'Premium Wheat Seeds', emoji: '🌾', price: '₹850/bag', badge: 'Best Seller', features: ['High yield variety', 'Disease resistant', 'Govt. certified', '45kg packaging'] },
        { name: 'Hybrid Rice Seeds', emoji: '🌾', price: '₹1,200/bag', badge: '', features: ['Basmati quality', 'Short duration (110 days)', '30% more yield', 'Drought tolerant'] },
        { name: 'BT Cotton Seeds', emoji: '🌿', price: '₹950/packet', badge: 'Popular', features: ['Bollworm resistant', 'High lint %', 'Suitable for all soils', 'Easy to cultivate'] },
        { name: 'Organic Vegetable Kit', emoji: '🥬', price: '₹450/set', badge: 'New', features: ['10 vegetable varieties', 'Non-GMO seeds', 'Includes growing guide', 'Kitchen garden ready'] }
    ],
    pesticides: [
        { name: 'Neem-Based Bio Pesticide', emoji: '🌿', price: '₹380/litre', badge: 'Organic', features: ['100% organic', 'Multi-pest control', 'Safe for beneficial insects', 'No residue'] },
        { name: 'Fungicide Spray', emoji: '🧪', price: '₹550/litre', badge: '', features: ['Broad spectrum', 'Preventive + curative', 'Rain-fast formula', 'Low toxicity'] },
        { name: 'Insecticide Concentrate', emoji: '🧪', price: '₹720/litre', badge: 'Effective', features: ['Quick knockdown', 'Long residual action', 'Systemic + contact', 'Crop safe'] },
        { name: 'Herbicide Solution', emoji: '🌱', price: '₹480/litre', badge: '', features: ['Selective weed control', 'Pre + post emergence', 'Low dose needed', 'Crop friendly'] }
    ],
    fertilizers: [
        { name: 'NPK 20-20-20', emoji: '🧫', price: '₹1,100/bag', badge: 'Top Rated', features: ['Balanced nutrition', 'Water soluble', 'All crops suitable', '25kg packaging'] },
        { name: 'Organic Vermicompost', emoji: '🪱', price: '₹350/bag', badge: 'Organic', features: ['Rich in micronutrients', 'Improves soil structure', '100% natural', 'Pathogen free'] },
        { name: 'DAP Fertilizer', emoji: '🧫', price: '₹1,350/bag', badge: '', features: ['High phosphorus', 'Essential for roots', 'Govt. rate available', '50kg standard'] },
        { name: 'Micronutrient Mix', emoji: '🧪', price: '₹650/kg', badge: 'Premium', features: ['Zinc, Boron, Iron, Mn', 'Prevents deficiency', 'Foliar application', 'Chelated form'] }
    ],
    equipment: [
        { name: 'Mini Power Tiller', emoji: '🚜', price: '₹45,000', badge: 'Best Value', features: ['5HP diesel engine', 'Multiple attachments', 'Ideal for small farms', '2-year warranty'] },
        { name: 'Knapsack Sprayer (Battery)', emoji: '🔋', price: '₹3,500', badge: 'Popular', features: ['16L tank capacity', '12V rechargeable', '5hr battery life', 'Adjustable nozzle'] },
        { name: 'Drip Irrigation Kit', emoji: '💧', price: '₹8,500/acre', badge: 'Save Water', features: ['Complete setup', 'Timer included', '40% water savings', 'Easy installation'] },
        { name: 'Soil Testing Kit', emoji: '🧪', price: '₹2,800', badge: 'New', features: ['NPK + pH + EC', '50 tests included', 'Digital reader', 'Lab-grade accuracy'] }
    ],
    drones: [
        { name: 'Agri Spray Drone 10L', emoji: '🚁', price: '₹2,50,000', badge: 'Premium', features: ['10L tank capacity', '15-min flight time', 'GPS auto-pilot', 'Covers 1 acre/10min'] },
        { name: 'Mapping & Survey Drone', emoji: '🛸', price: '₹1,80,000', badge: 'Pro', features: ['4K camera', 'NDVI mapping', '45-min flight', 'Cloud processing'] },
        { name: 'Seed Spreading Drone', emoji: '🚁', price: '₹3,20,000', badge: 'Latest', features: ['20kg payload', 'Precision dropping', 'Multi-seed support', 'RTK GPS'] },
        { name: 'Crop Monitoring Drone', emoji: '📸', price: '₹85,000', badge: 'Entry', features: ['HD camera', '20-min flight', 'Real-time view', 'Easy to fly'] }
    ]
};

function renderProducts(category) {
    const grid = document.getElementById('productGrid');
    const products = PRODUCTS[category] || [];
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
            <div class="product-img">${p.emoji}</div>
            <div class="product-body">
                <div class="product-name">${p.name}</div>
                <ul class="product-features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
                <div class="product-price">${p.price}</div>
                <button class="btn btn-primary btn-block btn-sm" onclick="placeOrder('${p.name}', '${p.price}')">Order Now 🛒</button>
            </div>
        </div>
    `).join('');
}

// Category tab clicks
document.getElementById('categoryTabs').addEventListener('click', e => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    document.querySelectorAll('#categoryTabs .category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderProducts(tab.dataset.cat);
});

// ===== ORDERS =====
async function placeOrder(productName, price) {
    try {
        const token = await getAuthToken();
        if (!token) { showNotification('Please login first', 'error'); return; }
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ items: [{ name: productName, price, qty: 1 }], total: price })
        });
        if (res.ok) showNotification(`Order placed for ${productName}!`, 'success');
        else showNotification('Order failed. Please try again.', 'error');
    } catch (err) { showNotification('Network error. Please try again.', 'error'); }
}

async function loadOrders() {
    const loading = document.getElementById('ordersLoading');
    const list = document.getElementById('ordersList');
    const none = document.getElementById('noOrders');
    loading.style.display = 'block'; list.innerHTML = ''; none.style.display = 'none';
    try {
        const token = await getAuthToken();
        if (!token) {
            none.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        const res = await fetch(`${API_BASE}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        loading.style.display = 'none';
        if (!data.orders || data.orders.length === 0) { none.style.display = 'block'; return; }
        list.innerHTML = data.orders.map(o => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${o.orderId || o.id || 'N/A'}</span>
                    <span class="order-status ${o.status || 'pending'}">${o.status || 'Pending'}</span>
                </div>
                <div class="order-items">${(o.items || []).map(i => i.name).join(', ')}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                    <span class="order-total">${o.total || ''}</span>
                    <span class="order-date">${o.timestamp ? new Date(o.timestamp).toLocaleDateString() : ''}</span>
                </div>
            </div>
        `).join('');
    } catch (err) { loading.style.display = 'none'; none.style.display = 'block'; }
}

// ===== REELS =====
async function loadReels(query) {
    const grid = document.getElementById('reelsGrid');
    grid.innerHTML = '<div class="loading-spinner"></div>';
    const q = query || 'modern farming techniques India';
    try {
        const res = await fetch(`${API_BASE}/api/reels?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        window._reelsLoaded = true;
        if (!data.data || data.data.length === 0) {
            grid.innerHTML = '<div class="empty-state"><span class="empty-icon">🎬</span><h3>No videos found</h3><p>Try a different category.</p></div>';
            return;
        }
        grid.innerHTML = data.data.map(v => `
            <div class="reel-card" onclick="playReel('${v.id}')">
                <div class="reel-thumb">
                    <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
                    <div class="reel-play"><div class="reel-play-icon">▶</div></div>
                </div>
                <div class="reel-info-bar">
                    <div class="reel-title">${v.title}</div>
                    <div class="reel-channel">${v.channelTitle || v.channel || ''}</div>
                </div>
            </div>
        `).join('');
    } catch (err) { grid.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span><h3>Failed to load</h3><p>Check your connection and try again.</p></div>'; }
}

function playReel(videoId) {
    document.getElementById('reelPlayerFrame').src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    document.getElementById('reelPlayerModal').classList.add('active');
}
function closeReelPlayer() {
    document.getElementById('reelPlayerFrame').src = '';
    document.getElementById('reelPlayerModal').classList.remove('active');
}

// Reel category tabs
document.getElementById('reelsTabs').addEventListener('click', e => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;
    document.querySelectorAll('#reelsTabs .category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    window._reelsLoaded = false;
    loadReels(tab.dataset.query);
});

// ===== CHATBOT =====
let chatTTSEnabled = false;
let chatImageData = null;
let isRecording = false;
let mediaRecorder = null;

// Auto-detect language from text using Unicode character ranges
function detectLanguage(text) {
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi (Gurmukhi)
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0900-\u097F]/.test(text)) {
        // Both Hindi and Marathi use Devanagari — default to Hindi
        // Could be refined with a keyword list for Marathi detection
        return 'hi';
    }
    return 'en'; // Default English
}

function toggleChatbot() {
    const fab = document.getElementById('chatbotFab');
    const panel = document.getElementById('chatbotPanel');
    fab.classList.toggle('open');
    panel.classList.toggle('open');
}

function sendQuickChat(msg) {
    document.getElementById('chatInput').value = msg;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg && !chatImageData) return;
    input.value = '';

    // Add user message
    const msgs = document.getElementById('chatMessages');
    let userHtml = `<div class="chat-msg user"><div class="msg-avatar">👤</div><div class="msg-bubble">`;
    if (chatImageData) userHtml += `<img src="${chatImageData}" style="max-width:150px;border-radius:8px;margin-bottom:8px;display:block">`;
    userHtml += `${msg}</div></div>`;
    msgs.innerHTML += userHtml;

    // Add typing indicator
    msgs.innerHTML += `<div class="chat-msg bot typing-msg"><div class="msg-avatar">🌱</div><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const token = await getAuthToken();
        let lang = document.getElementById('chatLang').value;
        if (lang === 'auto') lang = detectLanguage(msg);

        // Get Location (if available/allowed)
        let locationData = null;
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (e) {
            console.log("Location access denied or unavailable");
        }

        const body = { message: msg, language: lang, location: locationData };
        if (chatImageData) body.image = chatImageData;

        const res = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        // Remove typing indicator
        const typingEl = msgs.querySelector('.typing-msg');
        if (typingEl) typingEl.remove();

        const reply = data.reply || data.response || 'Sorry, I could not process that.';
        msgs.innerHTML += `<div class="chat-msg bot"><div class="msg-avatar">🌱</div><div class="msg-bubble">${formatChatReply(reply)}</div></div>`;
        msgs.scrollTop = msgs.scrollHeight;

        if (chatTTSEnabled) speakText(reply);
    } catch (err) {
        const typingEl = msgs.querySelector('.typing-msg');
        if (typingEl) typingEl.remove();
        msgs.innerHTML += `<div class="chat-msg bot"><div class="msg-avatar">🌱</div><div class="msg-bubble">Sorry, I'm having trouble connecting. Please try again.</div></div>`;
    }
    removeChatImage();
}

function formatChatReply(text) {
    return text
        // Code blocks first (preserve them)
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Headers (### or ##)
        .replace(/^### (.*$)/gm, '<div style="font-weight:700;font-size:14px;margin:10px 0 4px;color:var(--accent-light)">$1</div>')
        .replace(/^## (.*$)/gm, '<div style="font-weight:700;font-size:15px;margin:12px 0 6px;color:var(--accent-light)">$1</div>')
        // Bullet lists
        .replace(/^\s*[-•]\s+(.*$)/gm, '<div style="display:flex;gap:6px;padding:2px 0"><span style="color:var(--accent);flex-shrink:0">•</span><span>$1</span></div>')
        // Numbered lists
        .replace(/^\s*(\d+)\.\s+(.*$)/gm, '<div style="display:flex;gap:6px;padding:2px 0"><span style="color:var(--accent);font-weight:600;flex-shrink:0">$1.</span><span>$2</span></div>')
        // Newlines
        .replace(/\n/g, '<br>');
}

function toggleTTS() {
    chatTTSEnabled = !chatTTSEnabled;
    const btn = document.getElementById('ttsToggle');
    btn.textContent = chatTTSEnabled ? '🔊' : '🔈';
    showNotification(chatTTSEnabled ? 'Text-to-Speech enabled' : 'Text-to-Speech disabled', 'info');
}

async function speakText(text) {
    try {
        const token = await getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const lang = document.getElementById('chatLang').value;
        const res = await fetch(`${API_BASE}/api/tts`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text, language: lang })
        });
        if (res.ok) {
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.play();
        }
    } catch (err) {
        // Fallback to browser TTS
        const utter = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utter);
    }
}

function clearChat() {
    document.getElementById('chatMessages').innerHTML = `<div class="chat-msg bot"><div class="msg-avatar">🌱</div><div class="msg-bubble">Chat cleared! How can I help you? 🌾</div></div>`;
}

function handleChatImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        chatImageData = reader.result;
        const preview = document.getElementById('chatImgPreview');
        document.getElementById('chatPreviewImg').src = chatImageData;
        preview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeChatImage() {
    chatImageData = null;
    document.getElementById('chatImgPreview').style.display = 'none';
    document.getElementById('chatImageInput').value = '';
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('Voice input not supported in this browser', 'warning');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    let lang = document.getElementById('chatLang').value;
    if (lang === 'auto') lang = 'en';
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', pa: 'pa-IN' };
    recognition.lang = langMap[lang] || 'en-IN';
    recognition.interimResults = false;

    const btn = document.getElementById('voiceBtn');
    if (isRecording) { recognition.stop(); isRecording = false; btn.style.background = ''; return; }

    isRecording = true;
    btn.style.background = 'var(--danger)';
    recognition.start();

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        isRecording = false;
        btn.style.background = '';
    };
    recognition.onerror = () => { isRecording = false; btn.style.background = ''; };
    recognition.onend = () => { isRecording = false; btn.style.background = ''; };
}

// ===== SOILPROBE / IoT =====
let sensorChart = null;
let devicesListener = null;
let sensorDataListener = null;
let currentDeviceId = null;

// Helper to get DB reference safely
function getDbRef(path) {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    return firebase.database().ref(path);
}

function randomizeMockData(val, range) {
    if (val === undefined || val === '--') return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    const offset = (Math.random() - 0.5) * range;
    return (num + offset).toFixed(1);
}

function loadDevices() {
    const grid = document.getElementById('deviceGrid');

    // Cleanup previous listener if any
    if (devicesListener) {
        getDbRef(`users/${firebase.auth().currentUser.uid}/devices`)?.off('value', devicesListener);
        devicesListener = null;
    }

    grid.innerHTML = '<div class="loading-spinner"></div>';

    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn("No auth user available, checking auth state...");
        // If called before auth ready, wait for it
        const unsubscribe = firebase.auth().onAuthStateChanged(u => {
            unsubscribe();
            if (u) loadDevices();
        });
        return;
    }

    const devicesRef = firebase.database().ref(`users/${user.uid}/devices`);

    devicesListener = devicesRef.on('value', (snapshot) => {
        const devicesObj = snapshot.val();

        if (!devicesObj) {
            grid.innerHTML = '<div class="empty-state"><span class="empty-icon">📡</span><h3>No devices yet</h3><p>Scan for BLE devices or add one manually.</p></div>';
            return;
        }

        // Convert object to array and process
        const devices = [];
        Object.keys(devicesObj).forEach(key => {
            const d = devicesObj[key];
            const config = d.config || {};
            // Get latest data keys
            const dataObj = d.data || {};
            const dataKeys = Object.keys(dataObj).sort(); // Timestamp based keys usually sortable, but relying on created_at is better
            const latestKey = dataKeys[dataKeys.length - 1];
            const latestData = latestKey ? dataObj[latestKey] : null;

            let sensorValues = { moisture: '--', temperature: '--', ph: '--', nitrogen: '--', last_reading: null };

            if (latestData) {
                sensorValues = {
                    moisture: latestData.soil_moist_pct || latestData.moisture,
                    temperature: latestData.soil_temp_c || latestData.temperature,
                    ph: latestData.soil_ph || latestData.ph || '--',
                    nitrogen: latestData.soil_n_mg_kg || latestData.nitrogen || '--',
                    last_reading: latestData.created_at || latestData.timestamp
                };
            }

            devices.push({
                device_id: key,
                ...config,
                ...sensorValues
            });
        });

        window._devicesLoaded = true;

        grid.innerHTML = devices.map(d => {
            // Calculate if online (seen in last 60 minutes)
            let isOnline = false;
            let lastSeenText = 'Never';

            const readingTime = d.last_reading;
            if (readingTime) {
                const now = new Date();
                const lastSeen = new Date(readingTime);
                const diffMs = now - lastSeen;
                const diffMins = diffMs / (1000 * 60);

                isOnline = diffMins < 60;

                // Format relative time
                if (diffMins < 1) lastSeenText = 'Just now';
                else if (diffMins < 60) lastSeenText = `${Math.floor(diffMins)}m ago`;
                else if (diffMins < 1440) lastSeenText = `${Math.floor(diffMins / 60)}h ago`;
                else lastSeenText = lastSeen.toLocaleDateString();
            }

            // Helper to safe format numbers
            const fmt = (val) => {
                if (val === undefined || val === null || val === '--' || isNaN(parseFloat(val))) return '0';
                return val;
            };

            // Randomize mock values if they are static/mock for display variance
            if (isOnline) {
                if (d.moisture && d.moisture !== '--') d.moisture = randomizeMockData(d.moisture, 2);
                if (d.temperature && d.temperature !== '--') d.temperature = randomizeMockData(d.temperature, 0.5);
            }

            const lastUpdateStr = readingTime ? new Date(readingTime).toLocaleString() : 'Never';

            return `
            <div class="device-card" onclick="loadSensorData('${d.device_id}')">
                <button onclick="event.stopPropagation(); deleteDevice('${d.device_id}')" 
                    style="position:absolute;top:10px;right:10px;background:rgba(255,0,0,0.1);color:#ff4444;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;z-index:10" 
                    title="Delete Device">🗑️</button>
                <div class="device-status ${isOnline ? 'online' : 'offline'}">
                    <span class="status-dot"></span>${isOnline ? 'Online' : 'Offline'} 
                    <span style="font-size:0.8em;opacity:0.7;margin-left:5px">(${lastSeenText})</span>
                </div>
                <div class="device-name">${d.device_name || d.name || d.device_id}</div>
                <div class="device-field">📍 ${d.field_name || d.field || 'Unknown'}</div>
                <div style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-bottom:10px">🕒 Updated: ${lastUpdateStr}</div>
                <div class="sensor-grid">
                    <div class="sensor-val"><div class="val">${fmt(d.moisture)}%</div><div class="lbl">Moisture</div></div>
                    <div class="sensor-val"><div class="val">${fmt(d.temperature)}°C</div><div class="lbl">Temp</div></div>
                    <div class="sensor-val"><div class="val">${fmt(d.ph)}</div><div class="lbl">pH</div></div>
                    <div class="sensor-val"><div class="val">${fmt(d.nitrogen)}</div><div class="lbl">NPK</div></div>
                </div>
            </div>
        `}).join('');
    });
}

function loadSensorData(deviceId) {
    const container = document.getElementById('chartContainer');
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    // Cleanup previous listener
    if (sensorDataListener && currentDeviceId) {
        getDbRef(`users/${firebase.auth().currentUser.uid}/devices/${currentDeviceId}/data`)?.off('value', sensorDataListener);
    }
    currentDeviceId = deviceId;

    // Inject Analyze Button safely if not exists
    if (!document.getElementById('aiAnalyzeBtn')) {
        const btn = document.createElement('button');
        btn.id = 'aiAnalyzeBtn';
        btn.className = 'btn btn-primary btn-sm';
        btn.style.marginTop = '15px';
        btn.innerHTML = '🤖 Analyze Data & Recommend';
        btn.onclick = analyzeSoilData;
        container.appendChild(btn);
    }

    const user = firebase.auth().currentUser;
    if (!user) return; // Should be handled by global auth check

    const dataRef = firebase.database().ref(`users/${user.uid}/devices/${deviceId}/data`);

    // Listen to last 50 readings
    sensorDataListener = dataRef.orderByChild('created_at').limitToLast(50).on('value', (snapshot) => {
        const dataObj = snapshot.val();
        if (!dataObj) {
            if (sensorChart) sensorChart.destroy();
            document.getElementById('sensorChart').innerHTML = 'No data available';
            return;
        }

        const readings = [];
        Object.keys(dataObj).forEach(key => {
            readings.push(dataObj[key]);
        });

        // Data usually comes sorted by the query (created_at), but object keys order isn't guaranteed in JS
        // So we sort locally to be sure
        readings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // Limit to 20 for display
        const displayReadings = readings.slice(-20);

        const labels = displayReadings.map(r => new Date(r.created_at || r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const moisture = displayReadings.map(r => r.soil_moist_pct || r.moisture);
        const temp = displayReadings.map(r => r.soil_temp_c || r.temperature);

        if (sensorChart) sensorChart.destroy();
        sensorChart = new Chart(document.getElementById('sensorChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Moisture %',
                        data: moisture,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76,175,80,.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4
                    },
                    {
                        label: 'Temperature °C',
                        data: temp,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255,152,0,.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e8f5e9' } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' } },
                    y: { ticks: { color: 'rgba(255,255,255,.6)' }, grid: { color: 'rgba(255,255,255,.05)' } }
                }
            }
        });
    });
}

async function deleteDevice(deviceId) {
    if (!confirm('Are you sure you want to delete this device? Data history will be retained.')) return;
    try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/devices/${deviceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showNotification('Device deleted successfully', 'success');
            loadDevices(); // Refresh list
            document.getElementById('chartContainer').style.display = 'none'; // Hide chart if open
        } else {
            showNotification('Failed to delete device', 'error');
        }
    } catch (err) { showNotification('Network error', 'error'); }
}

function analyzeSoilData() {
    if (!sensorChart || !sensorChart.data || !sensorChart.data.labels) {
        showNotification('No data available to analyze', 'warning');
        return;
    }

    // Get last 5 readings
    const len = sensorChart.data.labels.length;
    const recent = len > 5 ? 5 : len;

    // Construct simplified data summary
    const moisture = sensorChart.data.datasets[0].data.slice(-recent);
    const temp = sensorChart.data.datasets[1].data.slice(-recent);
    const avgMoist = (moisture.reduce((a, b) => a + b, 0) / recent).toFixed(1);
    const avgTemp = (temp.reduce((a, b) => a + b, 0) / recent).toFixed(1);

    const prompt = `Analyze this soil data from my field (Last ${recent} readings avg):
- Moisture: ${avgMoist}% (Recent trend: ${moisture.join(', ')})
- Temperature: ${avgTemp}°C (Recent trend: ${temp.join(', ')})

Based on this, what are the immediate irrigation and fertilizer recommendations? 
Also, considering general NPK needs for standard crops, suggest any adjustments.`;

    // Open Chatbot
    const panel = document.getElementById('chatbotPanel');
    if (!panel.classList.contains('open')) toggleChatbot();

    // Send Message
    setTimeout(() => sendQuickChat(prompt), 500); // Small delay to let panel open
}

// Inject Analyze Button into Chart Container (One-time setup or dynamic)
// Modifying loadSensorData to ensure button exists
const _origLoadSensorData = loadSensorData;
loadSensorData = async function (deviceId) {
    await _origLoadSensorData(deviceId);
    const container = document.getElementById('chartContainer');
    if (!document.getElementById('aiAnalyzeBtn')) {
        const btn = document.createElement('button');
        btn.id = 'aiAnalyzeBtn';
        btn.className = 'btn btn-primary btn-sm';
        btn.style.marginTop = '15px';
        btn.innerHTML = '🤖 Analyze Data & Recommend';
        btn.onclick = analyzeSoilData;
        container.appendChild(btn);
    }
}

// ===== BLE PROVISIONING =====
// Soil Probe / IoT Integration
// ===================================

// scanBLEDevices replaced by new logic below
/* 
// LEGACY BLE LOGIC - DISABLED TO PREVENT CONFLICTS
async function scanBLEDevices_OLD() {
    if (!navigator.bluetooth) { showNotification('Bluetooth not supported. Use Chrome.', 'warning'); return; }

    // UUIDs must match ESP32 code
    const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
    const CHAR_SSID_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
    const CHAR_PASS_UUID = "823d06dc-255a-4720-953e-51c367ee2733";
    const CHAR_UID_UUID = "c730e61d-847e-4009-9768-45b73679469e";

    try {
        showNotification('Scanning for Hardini Probe...', 'info');
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'Hardini-Probe' }],
            optionalServices: [SERVICE_UUID]
        });

        showNotification(`Connecting to ${ device.name }...`, 'info');
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);

        // Prompt for WiFi
        const ssid = prompt("Enter WiFi Name (SSID):");
        if (!ssid) return;
        const pass = prompt("Enter WiFi Password:");
        if (!pass) return;

        // Get User UID
        const user = firebase.auth().currentUser;
        if (!user) { showNotification('Please Login First', 'error'); return; }
        const uid = user.uid;

        showNotification('Configuring Device...', 'info');

        // Write Characteristics
        const enc = new TextEncoder();

        const ssidChar = await service.getCharacteristic(CHAR_SSID_UUID);
        await ssidChar.writeValue(enc.encode(ssid));

        const passChar = await service.getCharacteristic(CHAR_PASS_UUID);
        await passChar.writeValue(enc.encode(pass));

        // Writing UID triggers save & restart on ESP32
        const uidChar = await service.getCharacteristic(CHAR_UID_UUID);
        await uidChar.writeValue(enc.encode(uid));

        showNotification('Device Configured! It will restart and connect.', 'success');

        // Register Device in Backend
        const token = await getAuthToken();
        await fetch(`${ API_BASE } / api / devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ token }` },
            body: JSON.stringify({
                deviceId: device.id || 'esp32_new',
                name: 'Soil Probe (BLE)',
                field: 'Auto-detected'
            })
        });

        loadDevices();
        device.gatt.disconnect();

    } catch (err) {
        if (err.name !== 'NotFoundError') showNotification('BLE Setup Failed: ' + err.message, 'error');
        console.error(err);
    }
}
*/

// Add device form
document.getElementById('addDeviceForm').addEventListener('submit', async e => {
    e.preventDefault();
    const token = await getAuthToken();
    const body = {
        deviceId: document.getElementById('deviceId').value,
        name: document.getElementById('deviceName').value,
        field: document.getElementById('deviceField').value
    };
    try {
        const res = await fetch(`${API_BASE} / api / devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            showNotification('Device added!', 'success');
            closeModal('addDeviceModal');
            loadDevices();
            e.target.reset();
        } else showNotification('Failed to add device', 'error');
    } catch (err) { showNotification('Network error', 'error'); }
});

// ===== SUPPLY CHAIN DETAIL =====
function openChainDetail(stage) {
    const details = {
        farmers: { title: '👨‍🌾 Farmers Stage', desc: 'Direct sourcing from 50,000+ farmers across India with fair pricing and quality standards.', features: ['Minimum Support Price guarantee', 'Quality grading at source', 'Digital payments within 24hrs', 'Crop advisory support', 'Insurance coverage'] },
        processing: { title: '🏭 Processing Stage', desc: 'State-of-the-art processing facilities with quality testing and certification.', features: ['ISO 22000 certified', 'Multi-stage quality testing', 'Automated sorting & grading', 'Eco-friendly packaging', 'Batch traceability'] },
        distribution: { title: '🚚 Distribution Stage', desc: 'Cold chain logistics with real-time tracking and route optimization.', features: ['Temperature-controlled transport', 'GPS real-time tracking', 'Route optimization AI', 'Same-day delivery in metros', '24/7 monitoring'] },
        retail: { title: '🏪 Retail Stage', desc: 'Multi-channel retail presence ensuring fresh products reach consumers.', features: ['Online + offline channels', 'Quality assurance at store', 'Dynamic pricing', 'Customer feedback loop', 'Return & refund policy'] },
        consumers: { title: '👥 Consumer Stage', desc: 'Farm-to-fork transparency with complete traceability and satisfaction guarantee.', features: ['QR code traceability', 'Freshness guarantee', 'Nutritional information', 'Feedback & ratings', 'Subscription options'] }
    };
    const d = details[stage];
    if (!d) return;
    showNotification(`${d.title}: ${d.desc}`, 'info');
}

// ===== EDIT PROFILE =====
document.getElementById('editProfileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    try {
        const displayName = document.getElementById('editFullName').value;
        await user.updateProfile({ displayName });
        // Save extra data to Firebase Realtime DB
        const token = await getAuthToken();
        const db = firebase.database ? firebase.database() : null;
        if (db) {
            await db.ref('users/' + user.uid).update({
                phone: document.getElementById('editPhone').value,
                farmingExperience: document.getElementById('editFarmingExperience').value,
                userType: document.getElementById('editUserType').value,
                location: document.getElementById('editLocation').value,
                updatedAt: Date.now()
            });
        }
        document.getElementById('userName').textContent = displayName;
        document.getElementById('userAvatarInitial').textContent = displayName.charAt(0).toUpperCase();
        closeModal('editProfileModal');
        showNotification('Profile updated!', 'success');
    } catch (err) { showNotification('Failed to update profile', 'error'); }
});

// ===== RESET PASSWORD =====
document.getElementById('resetPasswordForm').addEventListener('submit', async e => {
    e.preventDefault();
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmNewPassword').value;
    if (newPw !== confirmPw) { showNotification('Passwords do not match', 'error'); return; }
    if (newPw.length < 8) { showNotification('Password must be at least 8 characters', 'error'); return; }
    try {
        const user = firebase.auth().currentUser;
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, document.getElementById('currentPassword').value);
        await user.reauthenticateWithCredential(cred);
        await user.updatePassword(newPw);
        closeModal('resetPasswordModal');
        showNotification('Password updated!', 'success');
        e.target.reset();
    } catch (err) { showNotification('Failed: ' + err.message, 'error'); }
});

function resetPassword() {
    closeModal('settingsModal');
    openModal('resetPasswordModal');
}

// ===== DELETE ACCOUNT =====
function showDeleteAccountConfirmation() {
    closeModal('settingsModal');
    openModal('deleteAccountModal');
}

async function deleteAccount() {
    if (!document.getElementById('deleteConfirmCheckbox').checked) { showNotification('Please confirm you understand', 'warning'); return; }
    const pw = document.getElementById('deletePassword').value;
    if (!pw) { showNotification('Please enter your password', 'warning'); return; }
    try {
        const user = firebase.auth().currentUser;
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, pw);
        await user.reauthenticateWithCredential(cred);
        await user.delete();
        window.location.href = 'login.html';
    } catch (err) { showNotification('Failed: ' + err.message, 'error'); }
}

// ===== SETTINGS =====
function saveSettings() {
    showNotification('Settings saved!', 'success');
    closeModal('settingsModal');
}

function exportData() {
    const user = firebase.auth().currentUser;
    const data = { email: user.email, name: user.displayName, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hardini-data-export.json';
    a.click();
    showNotification('Data exported!', 'success');
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        closeReelPlayer();
        const panel = document.getElementById('chatbotPanel');
        if (panel.classList.contains('open')) toggleChatbot();
    }
});

// ===== CONNECT SECTION =====
const CONNECT_DATA = {
    farmers: [
        { name: 'Ramesh Kumar', location: 'Maharashtra', specialized: 'Organic Farming', exp: '15 years', img: 'https://i.pravatar.cc/150?img=11' },
        { name: 'Suresh Patel', location: 'Gujarat', specialized: 'Cotton & Groundnut', exp: '12 years', img: 'https://i.pravatar.cc/150?img=12' },
        { name: 'Anita Devi', location: 'Punjab', specialized: 'Wheat & Rice', exp: '8 years', img: 'https://i.pravatar.cc/150?img=5' },
        { name: 'Vikram Singh', location: 'Haryana', specialized: 'Dairy Farming', exp: '20 years', img: 'https://i.pravatar.cc/150?img=13' },
        { name: 'Priya Sharma', location: 'Karnataka', specialized: 'Horticulture', exp: '5 years', img: 'https://i.pravatar.cc/150?img=9' }
    ],
    suppliers: [
        { name: 'GreenSeeds Ltd', type: 'Seeds & Fertilizers', rating: 4.8, location: 'Pune', verified: true },
        { name: 'AgriTech Tools', type: 'Farm Machinery', rating: 4.5, location: 'Mumbai', verified: true },
        { name: 'OrganicInputs Co', type: 'Bio-Pesticides', rating: 4.9, location: 'Nashik', verified: true },
        { name: 'Kisan Seva Kendra', type: 'General Supplies', rating: 4.2, location: 'Nagpur', verified: false }
    ],
    market: [
        { crop: 'Wheat', price: '₹2,200/qt', trend: 'up', change: '+5%' },
        { crop: 'Rice (Basmati)', price: '₹3,500/qt', trend: 'down', change: '-2%' },
        { crop: 'Cotton', price: '₹6,000/qt', trend: 'stable', change: '0%' },
        { crop: 'Soybean', price: '₹4,800/qt', trend: 'up', change: '+3%' },
        { crop: 'Onion', price: '₹1,500/qt', trend: 'up', change: '+10%' }
    ],
    buyers: [
        { name: 'FreshMart Retail', need: 'Organic Vegetables', qty: '500kg/week', price: 'Premium' },
        { name: 'Global Exports', need: 'Basmati Rice', qty: '20 tons', price: 'Market Rate' },
        { name: 'Local Mandi Agent', need: 'Wheat', qty: '100 quintals', price: 'MSP' }
    ],
    experts: [
        { name: 'Dr. A. Patil', role: 'Soil Scientist', exp: '25 years', rate: '₹500/call', img: 'https://i.pravatar.cc/150?img=15' },
        { name: 'Dr. S. Rao', role: 'Entomologist', exp: '18 years', rate: '₹400/call', img: 'https://i.pravatar.cc/150?img=8' },
        { name: 'Ms. K. Reddy', role: 'Agri-Business Consultant', exp: '10 years', rate: '₹800/hr', img: 'https://i.pravatar.cc/150?img=44' }
    ],
    training: [
        { title: 'Modern Organic Farming', duration: '4 Weeks', level: 'Intermediate', students: 1250, img: '🌾' },
        { title: 'Drip Irrigation Mastery', duration: '2 Weeks', level: 'Beginner', students: 850, img: '💧' },
        { title: 'Soil Health Management', duration: '3 Weeks', level: 'Advanced', students: 500, img: '🌱' },
        { title: 'Dairy Farm Management', duration: '6 Weeks', level: 'Intermediate', students: 2000, img: '🐄' }
    ],
    forum: [
        { title: 'Best practices for monsoon wheat?', author: 'Ramesh K.', replies: 12, views: 340, tag: 'Crops' },
        { title: 'Dealing with new pest in cotton', author: 'Suresh P.', replies: 8, views: 210, tag: 'Pests' },
        { title: 'Subsidy process for solar pumps', author: 'Vikram S.', replies: 25, views: 890, tag: 'Govt Schemes' },
        { title: 'Organic fertilizer recipes shared', author: 'Anita D.', replies: 45, views: 1200, tag: 'Organic' }
    ]
};

function openConnectModal(type) {
    // Populate data based on type
    if (type === 'farmers') renderFarmers();
    else if (type === 'suppliers') renderSuppliers();
    else if (type === 'market') renderMarket();
    else if (type === 'experts') renderExperts();
    else if (type === 'training') renderTraining();
    else if (type === 'forum') renderForum();

    openModal(type + 'Modal');
}

function renderFarmers() {
    const list = document.getElementById('farmersList');
    list.innerHTML = CONNECT_DATA.farmers.map(f => `
        <div class="glass-card" style="padding:16px;text-align:center">
        <img src="${f.img}" style="width:64px;height:64px;border-radius:50%;margin-bottom:12px;border:2px solid var(--accent)">
            <h4 style="margin-bottom:4px;font-size:16px">${f.name}</h4>
            <div style="color:var(--text-secondary);font-size:12px;margin-bottom:8px">📍 ${f.location}</div>
            <div style="font-size:13px;margin-bottom:4px">🌾 ${f.specialized}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">Experience: ${f.exp}</div>
            <button class="btn btn-secondary btn-sm btn-block" onclick="showNotification('Request sent to ${f.name}!', 'success')">Connect 🤝</button>
        </div>
    `).join('');
}

function renderSuppliers() {
    const list = document.getElementById('suppliersList');
    list.innerHTML = CONNECT_DATA.suppliers.map(s => `
            <div class="glass-card" style="padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
                <div>
                    <h4 style="font-size:16px;margin-bottom:4px">${s.name}</h4>
                    <div style="font-size:12px;color:var(--text-secondary)">📍 ${s.location}</div>
                </div>
                ${s.verified ? '<span style="font-size:16px" title="Verified">✅</span>' : ''}
            </div>
            <div style="margin-bottom:8px;font-size:13px"><span style="color:var(--accent-light)">Type:</span> ${s.type}</div>
            <div style="margin-bottom:16px;font-size:13px">⭐ ${s.rating}/5.0</div>
            <button class="btn btn-primary btn-sm btn-block" onclick="showNotification('Contact details for ${s.name} sent to your phone', 'success')">Contact 📞</button>
        </div>
            `).join('');
}

function renderMarket() {
    // Render Prices
    const tbody = document.getElementById('marketPricesBody');
    tbody.innerHTML = CONNECT_DATA.market.map(m => `
            <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:12px">${m.crop}</td>
            <td style="padding:12px;font-weight:600;color:var(--text-primary)">${m.price}</td>
            <td style="padding:12px;color:${m.trend === 'up' ? 'var(--accent)' : m.trend === 'down' ? 'var(--danger)' : 'var(--warning)'}">
                ${m.trend === 'up' ? '↗' : m.trend === 'down' ? '↘' : '➡'} ${m.change}
            </td>
        </tr>
            `).join('');

    // Render Buyers
    const list = document.getElementById('buyersList');
    list.innerHTML = CONNECT_DATA.buyers.map(b => `
            <div class="glass-card" style="padding:16px">
            <h4 style="margin-bottom:8px;font-size:16px">${b.name}</h4>
            <div style="font-size:13px;margin-bottom:4px">Looking for: <span style="color:var(--accent-light)">${b.need}</span></div>
            <div style="font-size:13px;margin-bottom:4px">Qty: ${b.qty}</div>
            <div style="font-size:13px;margin-bottom:16px">Price: ${b.price}</div>
            <button class="btn btn-secondary btn-sm btn-block" onclick="showNotification('Bid placed successfully!', 'success')">Place Bid 🔨</button>
        </div>
            `).join('');
}

function renderExperts() {
    const list = document.getElementById('expertsList');
    list.innerHTML = CONNECT_DATA.experts.map(e => `
            <div class="glass-card" style="padding:16px;display:flex;gap:16px;align-items:center">
            <img src="${e.img}" style="width:60px;height:60px;border-radius:50%;object-fit:cover">
                <div style="flex:1">
                    <h4 style="font-size:16px;margin-bottom:4px">${e.name}</h4>
                    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">${e.role}</div>
                    <div style="font-size:12px;margin-bottom:4px">Exp: ${e.exp}</div>
                    <div style="font-size:14px;color:var(--accent-light);font-weight:600">${e.rate}</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="showNotification('Consultation request sent!', 'success')">Book</button>
            </div>
    `).join('');
}

function renderTraining() {
    const list = document.getElementById('coursesList');
    list.innerHTML = CONNECT_DATA.training.map(t => `
            <div class="glass-card" style="padding:0;overflow:hidden">
            <div style="height:100px;background:linear-gradient(135deg, rgba(76,175,80,0.1), rgba(46,125,50,0.2));display:flex;align-items:center;justify-content:center;font-size:40px">${t.img}</div>
            <div style="padding:16px">
                <h4 style="font-size:16px;margin-bottom:8px;height:40px;overflow:hidden">${t.title}</h4>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                    <span>⏱ ${t.duration}</span>
                    <span>📊 ${t.level}</span>
                </div>
                <div style="font-size:12px;margin-bottom:16px">👥 ${t.students} students</div>
                <button class="btn btn-primary btn-sm btn-block" onclick="showNotification('Enrolled in ${t.title}!', 'success')">Enroll Now</button>
            </div>
        </div>
            `).join('');
}

function renderForum() {
    const list = document.getElementById('forumList');
    list.innerHTML = CONNECT_DATA.forum.map(f => `
            <div class="glass-card" style="padding:16px;cursor:pointer" onclick="showNotification('Opening discussion thread...', 'info')">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:10px;background:var(--bg-card-hover);padding:2px 8px;border-radius:12px;color:var(--accent-light)">${f.tag}</span>
                <span style="font-size:12px;color:var(--text-muted)">Views: ${f.views}</span>
            </div>
            <h4 style="font-size:15px;margin-bottom:8px">${f.title}</h4>
            <div style="font-size:12px;color:var(--text-secondary);display:flex;justify-content:space-between">
                <span>👤 ${f.author}</span>
                <span>💬 ${f.replies} replies</span>
            </div>
        </div>
            `).join('');
}

console.log('🌱 Hardini WebApp loaded successfully');

// ===================================
// BLE WIZARD & PROVISIONING LOGIC
// ===================================

const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const BLE_CHAR_SSID_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const BLE_CHAR_PASS_UUID = "823d06dc-255a-4720-953e-51c367ee2733";
const BLE_CHAR_UID_UUID = "c730e61d-847e-4009-9768-45b73679469e";

let bleDevice = null;
let bleServer = null;
let selectedDeviceId = '';
let selectedConnectivity = 'wifi';

// Main Entry Point from "Scan BLE Devices" button
function scanBLEDevices() {
    openRegistrationWizard();
}

function openRegistrationWizard() {
    selectedDeviceId = '';
    selectedConnectivity = 'wifi';
    bleDevice = null;
    document.getElementById('wizardOverlay').classList.add('active');
    document.getElementById('wizardModal').classList.add('active');
    goToStep(1);

    // Reset fields
    if (document.getElementById('manualDeviceId')) document.getElementById('manualDeviceId').value = '';
    if (document.getElementById('wifiSsid')) document.getElementById('wifiSsid').value = '';
    if (document.getElementById('wifiPassword')) document.getElementById('wifiPassword').value = '';
    if (document.getElementById('deviceNameWizard')) document.getElementById('deviceNameWizard').value = '';
    if (document.getElementById('fieldNameInput')) document.getElementById('fieldNameInput').value = '';
    if (document.getElementById('cropType')) document.getElementById('cropType').value = '';
    if (document.getElementById('step1Next')) document.getElementById('step1Next').disabled = true;

    // Clear BLE results
    if (document.getElementById('bleResults')) document.getElementById('bleResults').style.display = 'none';
}

function closeRegistrationWizard() {
    if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
    }
    document.getElementById('wizardOverlay').classList.remove('active');
    document.getElementById('wizardModal').classList.remove('active');
}

function goToStep(step) {
    document.querySelectorAll('.wizard-content').forEach(el => el.style.display = 'none');
    const target = document.getElementById(`wizardStep${step}`);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.wizard-step').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (s === step) el.classList.add('active');
        else if (s < step) el.classList.add('completed');
    });

    if (step === 3) {
        document.getElementById('summaryDeviceId').textContent = selectedDeviceId || '--';
        document.getElementById('summaryConn').textContent = selectedConnectivity === 'sim' ? 'SIM Card' : 'WiFi';
    }
}

function onManualIdInput() {
    const val = document.getElementById('manualDeviceId').value.trim();
    selectedDeviceId = val;
    document.getElementById('step1Next').disabled = val.length < 3;
}

// Actual Scanning Logic called from inside Wizard
async function startSoilProbeBLEScan() {
    console.log('🔵 startSoilProbeBLEScan triggered');

    // Visual feedback
    const btn = document.getElementById('bleScanBtn');
    if (btn) {
        btn.innerHTML = '<div class="discover-icon ble-scanning">📡</div><span>Scanning...</span><small>Select "Hardini-Probe"</small>';
    }

    if (!navigator.bluetooth) {
        console.error('❌ Bluetooth API not available');
        showNotification('Bluetooth not supported. Use Chrome on Android/Desktop.', 'warning');
        if (btn) btn.innerHTML = '<div class="discover-icon">🔵</div><span>Scan via Bluetooth</span><small>Not Supported</small>';
        return;
    }

    const resultsContainer = document.getElementById('bleResults');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<h4>Scanning... <span class="ble-scanning">📡</span></h4>';
    }

    try {
        console.log('📡 Requesting Bluetooth Device...');
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'Hardini-Probe' }],
            optionalServices: [BLE_SERVICE_UUID]
        });

        console.log('✅ Device selected:', bleDevice.name);
        showNotification(`Found ${bleDevice.name}`, 'success');

        if (resultsContainer) {
            resultsContainer.innerHTML = `
        <h4>Found Device:</h4>
        <div class="ble-device-item">
            <div>
                <div class="ble-device-name">${bleDevice.name}</div>
                <div class="ble-device-id">ID: ${bleDevice.id.slice(0, 8)}...</div>
            </div>
            <button class="register-device-btn small" onclick="connectToBLEDevice()">Connect</button>
        </div>
            `;
        }

    } catch (error) {
        console.error('❌ Bluetooth Error:', error);
        if (btn) {
            btn.innerHTML = '<div class="discover-icon">🔵</div><span>Scan via Bluetooth</span><small>Try Again/Manual</small>';
        }

        if (error.name === 'NotFoundError') {
            if (resultsContainer) resultsContainer.innerHTML = '<h4>No devices found or scan cancelled.</h4>';
        } else {
            showNotification('BLE Error: ' + error.message, 'error');
            if (resultsContainer) resultsContainer.style.display = 'none';
        }
    }
}

function connectToBLEDevice() {
    if (!bleDevice) return;
    console.log('🔗 Connecting to:', bleDevice.name);
    selectedDeviceId = bleDevice.name || bleDevice.id;

    if (selectedDeviceId === 'Hardini-Probe') {
        selectedDeviceId = 'esp32_' + bleDevice.id.slice(0, 4);
    }

    document.getElementById('manualDeviceId').value = selectedDeviceId;
    document.getElementById('step1Next').disabled = false;

    const resultsContainer = document.getElementById('bleResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="ble-device-item" style="border-color: #4caf50; background: rgba(76, 175, 80, 0.2);">
            <div>
                <div class="ble-device-name">✅ ${bleDevice.name}</div>
                <div class="ble-device-id">Ready to Configure</div>
            </div>
            </div>
            <div style="text-align: center; margin-top: 10px;">
                <small style="color: #4caf50;">Device selected! Click "Next"</small>
            </div>
        `;
    }
    showNotification(`Selected ${bleDevice.name}.Click Next.`, 'success');
}

function selectConnectivity(type) {
    selectedConnectivity = type;
    document.querySelectorAll('.conn-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('wifiConfig').style.display = type === 'wifi' ? 'block' : 'none';
    document.getElementById('simConfig').style.display = type === 'sim' ? 'block' : 'none';
}

async function registerDevice() {
    const deviceName = document.getElementById('deviceNameWizard').value.trim();
    const fieldName = document.getElementById('fieldNameInput').value.trim();
    const cropType = document.getElementById('cropType').value;
    const wifiSsid = document.getElementById('wifiSsid').value.trim();
    const wifiPass = document.getElementById('wifiPassword').value.trim();

    if (!selectedDeviceId) {
        showNotification('Please enter or scan a device ID', 'error');
        goToStep(1);
        return;
    }
    if (!deviceName) {
        showNotification('Please enter a device name', 'error');
        return;
    }

    if (selectedConnectivity === 'wifi' && (!wifiSsid || !wifiPass)) {
        showNotification('Please enter WiFi credentials in Step 2', 'warning');
        goToStep(2);
        return;
    }

    const regBtn = document.getElementById('registerBtn');
    regBtn.disabled = true;
    regBtn.textContent = '⏳ Processing...';

    try {
        // 1. Provision Device via BLE (if connected)
        if (selectedConnectivity === 'wifi' && bleDevice) {
            showNotification('Connecting to device...', 'info');
            await provisionDeviceBLE(wifiSsid, wifiPass);
        }

        // 2. Register in Backend
        const user = firebase.auth().currentUser;
        if (!user) throw new Error("User not logged in");
        const token = await user.getIdToken();

        const response = await fetch(`${API_BASE}/api/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                device_id: selectedDeviceId,
                device_name: deviceName,
                field_name: fieldName,
                crop_type: cropType,
                connectivity: selectedConnectivity
            })
        });

        const data = await response.json();
        if (data.success) {
            showNotification(`🎉 Device "${deviceName}" registered successfully!`, 'success');
            closeRegistrationWizard();
            // Refresh devices list - assuming loadDevices exists in app.js
            if (typeof loadDevices === 'function') await loadDevices();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration/Provisioning error:', error);
        showNotification('Process failed: ' + error.message, 'error');
    }

    regBtn.disabled = false;
    regBtn.textContent = '✅ Register Device';
}

async function provisionDeviceBLE(ssid, password) {
    if (!bleDevice) throw new Error("No Bluetooth device selected.");
    const statusLabel = document.getElementById('registerBtn');
    statusLabel.textContent = '🔗 Connecting BLE...';

    try {
        if (!bleDevice.gatt.connected) {
            bleServer = await bleDevice.gatt.connect();
        } else {
            bleServer = bleDevice.gatt;
        }

        statusLabel.textContent = '📡 Finding Service...';
        const service = await bleServer.getPrimaryService(BLE_SERVICE_UUID);
        const enc = new TextEncoder();

        // Write SSID
        statusLabel.textContent = 'Writing SSID...';
        const ssidChar = await service.getCharacteristic(BLE_CHAR_SSID_UUID);
        if (ssidChar.properties.writeWithoutResponse) {
            await ssidChar.writeValueWithoutResponse(enc.encode(ssid));
        } else {
            await ssidChar.writeValue(enc.encode(ssid));
        }
        await new Promise(r => setTimeout(r, 500));

        // Write Password
        statusLabel.textContent = 'Writing Password...';
        const passChar = await service.getCharacteristic(BLE_CHAR_PASS_UUID);
        if (passChar.properties.writeWithoutResponse) {
            await passChar.writeValueWithoutResponse(enc.encode(password));
        } else {
            await passChar.writeValue(enc.encode(password));
        }
        await new Promise(r => setTimeout(r, 500));

        // Write UID (Triggers Restart)
        statusLabel.textContent = 'Finalizing...';
        const uidChar = await service.getCharacteristic(BLE_CHAR_UID_UUID);
        const user = firebase.auth().currentUser;
        if (user) {
            if (uidChar.properties.writeWithoutResponse) {
                await uidChar.writeValueWithoutResponse(enc.encode(user.uid));
            } else {
                await uidChar.writeValue(enc.encode(user.uid));
            }
        }

        showNotification('Device configured! It will now restart.', 'success');
        await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
        console.error("BLE Provisioning Failed", err);
        if (err.message.includes('disconnected') || err.message.includes('Connection failed')) {
            console.warn("Device disconnected, possibly restarted.");
        } else {
            throw new Error("BLE Config Failed: " + err.message);
        }
    }
}
