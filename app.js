/* ===== HARDINI WEBAPP - app.js ===== */
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

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

async function getAuthToken() {
    const user = firebase.auth().currentUser;
    if (user) return user.getIdToken();
    return null;
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
        if (!data.videos || data.videos.length === 0) {
            grid.innerHTML = '<div class="empty-state"><span class="empty-icon">🎬</span><h3>No videos found</h3><p>Try a different category.</p></div>';
            return;
        }
        grid.innerHTML = data.videos.map(v => `
            <div class="reel-card" onclick="playReel('${v.id}')">
                <div class="reel-thumb">
                    <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
                    <div class="reel-play"><div class="reel-play-icon">▶</div></div>
                </div>
                <div class="reel-info-bar">
                    <div class="reel-title">${v.title}</div>
                    <div class="reel-channel">${v.channel || ''}</div>
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
        const body = { message: msg, language: lang };
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
        const lang = document.getElementById('chatLang').value;
        const res = await fetch(`${API_BASE}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

async function loadDevices() {
    const grid = document.getElementById('deviceGrid');
    grid.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/devices`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        window._devicesLoaded = true;
        const devices = data.devices || [];
        if (devices.length === 0) {
            grid.innerHTML = '<div class="empty-state"><span class="empty-icon">📡</span><h3>No devices yet</h3><p>Scan for BLE devices or add one manually.</p></div>';
            return;
        }
        grid.innerHTML = devices.map(d => `
            <div class="device-card" onclick="loadSensorData('${d.deviceId || d.id}')">
                <div class="device-status ${d.online ? 'online' : 'offline'}"><span class="status-dot"></span>${d.online ? 'Online' : 'Offline'}</div>
                <div class="device-name">${d.name || d.deviceId}</div>
                <div class="device-field">📍 ${d.field || d.location || 'Unknown'}</div>
                ${d.lastReading ? `
                <div class="sensor-grid">
                    <div class="sensor-val"><div class="val">${d.lastReading.moisture || '--'}%</div><div class="lbl">Moisture</div></div>
                    <div class="sensor-val"><div class="val">${d.lastReading.temperature || '--'}°C</div><div class="lbl">Temp</div></div>
                    <div class="sensor-val"><div class="val">${d.lastReading.ph || '--'}</div><div class="lbl">pH</div></div>
                    <div class="sensor-val"><div class="val">${d.lastReading.nitrogen || '--'}</div><div class="lbl">NPK</div></div>
                </div>` : ''}
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span><h3>Failed to load devices</h3><p>Check your connection.</p></div>';
    }
}

async function loadSensorData(deviceId) {
    const container = document.getElementById('chartContainer');
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
    try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/soil-readings/${deviceId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const readings = data.readings || [];
        if (readings.length === 0) return;

        const labels = readings.map(r => new Date(r.timestamp).toLocaleTimeString());
        const moisture = readings.map(r => r.moisture);
        const temp = readings.map(r => r.temperature);

        if (sensorChart) sensorChart.destroy();
        sensorChart = new Chart(document.getElementById('sensorChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Moisture %', data: moisture, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,.1)', fill: true, tension: 0.4 },
                    { label: 'Temperature °C', data: temp, borderColor: '#ff9800', backgroundColor: 'rgba(255,152,0,.1)', fill: true, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#e8f5e9' } } },
                scales: {
                    x: { ticks: { color: 'rgba(255,255,255,.4)' }, grid: { color: 'rgba(255,255,255,.05)' } },
                    y: { ticks: { color: 'rgba(255,255,255,.4)' }, grid: { color: 'rgba(255,255,255,.05)' } }
                }
            }
        });
    } catch (err) { showNotification('Failed to load sensor data', 'error'); }
}

async function scanBLEDevices() {
    if (!navigator.bluetooth) { showNotification('Bluetooth not supported. Use Chrome.', 'warning'); return; }
    try {
        showNotification('Scanning for BLE devices...', 'info');
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }, { namePrefix: 'SoilProbe' }],
            optionalServices: ['environmental_sensing']
        });
        showNotification(`Found: ${device.name}`, 'success');
        // Auto-register the device
        const token = await getAuthToken();
        await fetch(`${API_BASE}/api/devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ deviceId: device.id || device.name, name: device.name, field: 'Auto-detected' })
        });
        loadDevices();
    } catch (err) {
        if (err.name !== 'NotFoundError') showNotification('BLE scan failed: ' + err.message, 'error');
    }
}

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
        const res = await fetch(`${API_BASE}/api/devices`, {
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

console.log('🌱 Hardini WebApp loaded successfully');
