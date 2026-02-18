document.addEventListener('DOMContentLoaded', () => {
    // --- Data Definitions ---

    const farmersData = [
        { name: "Ramesh Kumar", role: "Organic Farming Expert", location: "Maharashtra", image: "https://i.pravatar.cc/150?img=11" },
        { name: "Suresh Patel", role: "Traditional Farming", location: "Gujarat", image: "https://i.pravatar.cc/150?img=12" },
        { name: "Anita Devi", role: "Hydroponics Specialist", location: "Punjab", image: "https://i.pravatar.cc/150?img=5" },
        { name: "Vikram Singh", role: "Dairy Farming", location: "Haryana", image: "https://i.pravatar.cc/150?img=3" },
        { name: "Meera Reddy", role: "Sustainable Agriculture", location: "Telangana", image: "https://i.pravatar.cc/150?img=9" }
    ];

    const marketData = [
        { crop: "Wheat", price: "₹2,200/quintal", trend: "↗️ +5%", trendClass: "trend-up" },
        { crop: "Rice", price: "₹3,100/quintal", trend: "↘️ -2%", trendClass: "trend-down" },
        { crop: "Cotton", price: "₹6,300/quintal", trend: "↗️ +1.5%", trendClass: "trend-up" },
        { crop: "Soybean", price: "₹3,800/quintal", trend: "➡️ 0%", trendClass: "trend-neutral" },
        { crop: "Maize", price: "₹1,950/quintal", trend: "↘️ -1%", trendClass: "trend-down" }
    ];

    const buyersData = [
        { name: "FreshMart", lookingFor: "Organic Vegetables", quantity: "500kg/week" },
        { name: "AgriExport Co.", lookingFor: "Premium Rice", quantity: "2000kg/month" },
        { name: "GreenGrocers", lookingFor: "Exotic Fruits", quantity: "100kg/day" },
        { name: "MegaFoods Ltd.", lookingFor: "Potatoes", quantity: "5 tons/month" }
    ];

    const suppliersData = [
        { name: "GreenSeeds Ltd", product: "Premium Quality Seeds", rating: "⭐⭐⭐⭐⭐" },
        { name: "AgriTech Equipment", product: "Modern Farming Equipment", rating: "⭐⭐⭐⭐" },
        { name: "BioLife Solutions", product: "Organic Fertilizers", rating: "⭐⭐⭐⭐⭐" },
        { name: "FarmGear", product: "Protective Gear", rating: "⭐⭐⭐⭐" }
    ];

    const productsData = [
        { name: "Organic Seeds Pack", price: "₹499/kg", image: "https://via.placeholder.com/150?text=Seeds" },
        { name: "Bio Fertilizer", price: "₹999/pack", image: "https://via.placeholder.com/150?text=Fertilizer" },
        { name: "Drip Irrigation Kit", price: "₹5,500/set", image: "https://via.placeholder.com/150?text=Irrigation" },
        { name: "Solar Insect Trap", price: "₹1,200/unit", image: "https://via.placeholder.com/150?text=Trap" }
    ];

    const expertsData = [
        { name: "Dr. Sharma", role: "Soil Expert", experience: "15 years", image: "https://i.pravatar.cc/150?img=4" },
        { name: "Dr. Patel", role: "Crop Disease Specialist", experience: "12 years", image: "https://i.pravatar.cc/150?img=8" },
        { name: "Prof. Gupta", role: "Agri-Business Consultant", experience: "20 years", image: "https://i.pravatar.cc/150?img=13" },
        { name: "Dr. Emily Ray", role: "Entomologist", experience: "10 years", image: "https://i.pravatar.cc/150?img=10" }
    ];

    const coursesData = [
        { title: "Modern Farming Techniques", duration: "4 weeks", icon: "🌾" },
        { title: "Farm Equipment Training", duration: "2 weeks", icon: "🚜" },
        { title: "Organic Certification Guide", duration: "3 weeks", icon: "📜" },
        { title: "Agri-Marketing Mastery", duration: "5 weeks", icon: "📈" }
    ];

    const workshopsData = [
        { title: "Organic Farming Workshop", date: "Next Sunday, 10:00 AM", instructor: "Dr. Reddy" },
        { title: "Pest Control Seminar", date: "Next Tuesday, 2:00 PM", instructor: "Prof. Singh" },
        { title: "Water Conservation Talk", date: "Friday, 11:00 AM", instructor: "Eng. Das" }
    ];

    const discussionsData = [
        { title: "Best practices for organic farming", author: "Ramesh Kumar", stats: "Replies: 23 • Views: 156", tags: ["Organic", "Tips"] },
        { title: "Water conservation methods", author: "Priya Singh", stats: "Replies: 15 • Views: 98", tags: ["Water", "Conservation"] },
        { title: "Market trends for 2024", author: "Amit Verma", stats: "Replies: 45 • Views: 310", tags: ["Market", "Trends"] },
        { title: "Dealing with locusts", author: "Kishan Lal", stats: "Replies: 12 • Views: 85", tags: ["Pest", "Emergency"] }
    ];

    // --- Helper Functions ---

    function createFarmerCard(farmer) {
        return `
            <div class="farmer-card">
                <img src="${farmer.image}" alt="${farmer.name}">
                <div class="farmer-info">
                    <h4>${farmer.name}</h4>
                    <p>${farmer.role}</p>
                    <span class="location">📍 ${farmer.location}</span>
                    <button class="connect-btn" data-action="connect" data-name="${farmer.name}">Connect</button>
                </div>
            </div>
        `;
    }

    function createMarketRow(item) {
        return `
            <tr>
                <td>${item.crop}</td>
                <td>${item.price}</td>
                <td class="${item.trendClass}">${item.trend}</td>
            </tr>
        `;
    }

    function createBuyerCard(buyer) {
        return `
            <div class="buyer-card">
                <div class="buyer-info">
                    <h4>${buyer.name}</h4>
                    <p>Looking for: ${buyer.lookingFor}</p>
                    <p>Quantity: ${buyer.quantity}</p>
                    <button class="bid-btn" data-action="bid" data-name="${buyer.name}">Place Bid</button>
                </div>
            </div>
        `;
    }

    function createSupplierCard(supplier) {
        return `
            <div class="supplier-card">
                <div class="supplier-logo">🌱</div>
                <div class="supplier-info">
                    <h4>${supplier.name}</h4>
                    <p>${supplier.product}</p>
                    <div class="rating">${supplier.rating}</div>
                    <button class="contact-btn" data-action="contact-supplier" data-name="${supplier.name}">Contact Supplier</button>
                </div>
            </div>
        `;
    }

    function createProductCard(product) {
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>${product.price}</p>
                <button class="order-btn" data-action="order" data-name="${product.name}">Order Now</button>
            </div>
        `;
    }

    function createExpertCard(expert) {
        return `
            <div class="expert-card">
                <img src="${expert.image}" alt="${expert.name}">
                <div class="expert-info">
                    <h4>${expert.name}</h4>
                    <p>${expert.role}</p>
                    <p>Experience: ${expert.experience}</p>
                    <button class="consult-btn" data-action="consult" data-name="${expert.name}">Book Consultation</button>
                </div>
            </div>
        `;
    }

    function createCourseCard(course) {
        return `
            <div class="course-card">
                <div class="course-preview">${course.icon}</div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>Duration: ${course.duration}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                    <button class="enroll-btn" data-action="enroll" data-name="${course.title}">Enroll Now</button>
                </div>
            </div>
        `;
    }

    function createWorkshopCard(workshop) {
        return `
            <div class="workshop-card">
                <h4>${workshop.title}</h4>
                <p>Date: ${workshop.date}</p>
                <p>By: ${workshop.instructor}</p>
                <button class="join-btn" data-action="join" data-name="${workshop.title}">Join Workshop</button>
            </div>
        `;
    }

    function createDiscussionCard(discussion) {
        const tagsHtml = discussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        return `
            <div class="discussion-card">
                <div class="discussion-header">
                    <h4>${discussion.title}</h4>
                    <span class="tags">${tagsHtml}</span>
                </div>
                <p>Started by: ${discussion.author}</p>
                <p>${discussion.stats}</p>
                <button class="view-btn" data-action="view-discussion" data-name="${discussion.title}">View Discussion</button>
            </div>
        `;
    }

    // --- Initialization ---

    function populateData() {
        // Farmers
        const farmersList = document.querySelector('.farmers-list');
        if (farmersList) farmersList.innerHTML = farmersData.map(createFarmerCard).join('');

        // Market
        const marketTableBody = document.querySelector('.price-table tbody');
        if (marketTableBody) marketTableBody.innerHTML = marketData.map(createMarketRow).join('');

        const buyersList = document.querySelector('.buyers-list');
        if (buyersList) buyersList.innerHTML = buyersData.map(createBuyerCard).join('');

        // Suppliers
        const suppliersList = document.querySelector('.suppliers-list');
        if (suppliersList) suppliersList.innerHTML = suppliersData.map(createSupplierCard).join('');

        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) productsGrid.innerHTML = productsData.map(createProductCard).join('');

        // Experts
        const expertsList = document.querySelector('.experts-list');
        if (expertsList) expertsList.innerHTML = expertsData.map(createExpertCard).join('');

        // Training
        const coursesList = document.querySelector('.courses-list');
        if (coursesList) coursesList.innerHTML = coursesData.map(createCourseCard).join('');

        const workshopsList = document.querySelector('.workshops-list');
        if (workshopsList) workshopsList.innerHTML = workshopsData.map(createWorkshopCard).join('');

        // Forum
        const discussionsList = document.querySelector('.discussions-list');
        if (discussionsList) discussionsList.innerHTML = discussionsData.map(createDiscussionCard).join('');
    }

    populateData();

    // --- Modal Logic ---

    const connectBtns = document.querySelectorAll('.connect-btn[data-type]');
    const closeModals = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.detail-modal');

    // Open Modal
    connectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            const modal = document.getElementById(`${type}Modal`);
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.detail-modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // --- Interaction Logic (Event Delegation) ---

    document.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.tagName !== 'BUTTON') return;

        const action = target.dataset.action;
        const name = target.dataset.name;

        if (!action) return;

        // Prevent multiple clicks
        if (target.disabled || target.classList.contains('loading')) return;

        switch (action) {
            case 'connect':
                target.textContent = 'Connecting...';
                target.classList.add('loading');
                await simulateApiCall();
                target.classList.remove('loading');
                target.textContent = 'Connected';
                target.disabled = true;
                showNotification(`Successfully connected with ${name}!`);
                break;

            case 'bid':
                target.textContent = 'Bidding...';
                await simulateApiCall();
                target.textContent = 'Bid Placed';
                target.disabled = true;
                showNotification(`Bid placed for ${name}`);
                break;

            case 'contact-supplier':
                target.textContent = 'Sending...';
                await simulateApiCall();
                target.textContent = 'Request Sent';
                target.disabled = true;
                showNotification(`Contact request sent to ${name}`);
                break;

            case 'order':
                target.textContent = 'Processing...';
                await simulateApiCall();
                target.textContent = 'Ordered';
                target.disabled = true;
                showNotification(`Order placed for ${name}`);
                break;

            case 'consult':
                target.textContent = 'Booking...';
                await simulateApiCall();
                target.textContent = 'Booked';
                target.disabled = true;
                showNotification(`Consultation booked with ${name}`);
                break;

            case 'enroll':
                target.textContent = 'Enrolling...';
                await simulateApiCall();
                target.textContent = 'Enrolled';
                target.disabled = true;
                showNotification(`Successfully enrolled in ${name}`);
                // Animate progress bar if present
                const progressBar = target.closest('.course-info').querySelector('.progress');
                if (progressBar) {
                    setTimeout(() => progressBar.style.width = '10%', 100);
                }
                break;

            case 'join':
                target.textContent = 'Joining...';
                await simulateApiCall();
                target.textContent = 'Registered';
                target.disabled = true;
                showNotification(`Registered for ${name}`);
                break;

            case 'view-discussion':
                showNotification(`Opening discussion: ${name}...`);
                // Simulate navigation or modal change
                break;
        }
    });

    // Special Buttons (Upload, Post) - Static in HTML but managed here
    const uploadBtns = document.querySelectorAll('.upload-btn');
    uploadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = 'Uploading...';
            setTimeout(() => {
                btn.textContent = 'Upload Photo';
                showNotification('Photo analysis will be ready in 24 hours');
            }, 1500);
        });
    });

    const testBtns = document.querySelectorAll('.test-btn');
    testBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = 'Requesting...';
            setTimeout(() => {
                btn.textContent = 'Request Test';
                showNotification('Soil test kit will be delivered soon!');
            }, 1500);
        });
    });

    // Community Post Button
    const postBtn = document.querySelector('.post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const topic = document.getElementById('topic').value;
            const category = document.getElementById('category').value;

            if (topic && category) {
                showNotification('Discussion posted successfully!');
                // Reset form
                document.getElementById('topic').value = '';
                document.getElementById('category').value = '';
                document.getElementById('description').value = '';
                // Ideally, prepend the new post to the list
            } else {
                showNotification('Please fill in required fields', 'error');
            }
        });
    }

    // Connection Form
    const connectionForm = document.getElementById('connectionForm');
    if (connectionForm) {
        connectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = connectionForm.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            await simulateApiCall();
            submitBtn.classList.remove('loading');
            showNotification('Connection request submitted!');
            connectionForm.reset();
        });
    }

    // --- Helpers ---

    function simulateApiCall() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger reflow
        notification.offsetHeight;

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Mobile menu functionality
    const createMobileMenu = () => {
        if (document.querySelector('.burger')) return; // Avoid duplicates

        const nav = document.querySelector('.nav-links');
        const burger = document.createElement('div');
        burger.className = 'burger';
        burger.innerHTML = '☰';
        document.querySelector('nav').appendChild(burger);

        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.innerHTML = nav.classList.contains('nav-active') ? '✕' : '☰';
        });
    };

    if (window.innerWidth <= 768) createMobileMenu();
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) createMobileMenu();
    });

});