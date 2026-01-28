document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tippy(tooltip, {
            content: tooltip.getAttribute('data-tooltip'),
            animation: 'scale',
            theme: 'hardini'
        });
    });

    // Modal functionality with smooth transitions
    const modal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');

    // Close modal with animation
    function closeModalWithAnimation() {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(20px)';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Close modal events
    closeModal.onclick = closeModalWithAnimation;
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModalWithAnimation();
        }
    };

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModalWithAnimation();
        }
    });

    // Function to show feature details in modal with loading state
    function showDetails(feature) {
        // Show loading state
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        modalContent.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading details...</p>
            </div>
        `;

        // Simulate loading (remove in production and replace with actual API call)
        setTimeout(() => {
            const featureDetails = getFeatureDetails(feature);
            modalContent.innerHTML = `
                <h2 class="modal-title">${featureDetails.title}</h2>
                <div class="feature-content">
                    ${featureDetails.content}
                </div>
                <div class="modal-actions">
                    ${featureDetails.actions}
                </div>
            `;

            // Animate content
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 800);
    }

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Add highlight effect
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 2000);
            }
        });
    });

    // Mobile menu functionality with smooth transitions
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    let isMenuOpen = false;

    if (burger) {
        burger.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            nav.style.right = isMenuOpen ? '0' : '-100%';
            burger.innerHTML = isMenuOpen ? '✕' : '☰';
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !nav.contains(e.target) && !burger.contains(e.target)) {
            isMenuOpen = false;
            nav.style.right = '-100%';
            burger.innerHTML = '☰';
            document.body.style.overflow = 'auto';
        }
    });

    // Add hover effects for chain cards
    const chainCards = document.querySelectorAll('.chain-card');
    chainCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 35px rgba(76, 175, 80, 0.2)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });

    // Add click feedback for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add intersection observer for smooth animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all chain cards and features
    document.querySelectorAll('.chain-card, .feature').forEach(element => {
        observer.observe(element);
    });

    // Add progress indicators for actions
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.textContent;
            this.disabled = true;
            this.innerHTML = '<span class="loading-dots">Processing</span>';

            // Simulate action completion
            setTimeout(() => {
                this.innerHTML = '✓ Done';
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = originalText;
                }, 1000);
            }, 2000);
        });
    });

    // Simulated progress updates for tracking
    function updateTrackingStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const currentValue = parseInt(stat.textContent);
            const change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and 2
            stat.textContent = Math.max(0, currentValue + change);
        });
    }

    // Update stats every 5 seconds
    setInterval(updateTrackingStats, 5000);

    // Animated chain nodes on scroll
    const chainNodes = document.querySelectorAll('.chain-node');
    const nodeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    chainNodes.forEach(node => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(20px)';
        node.style.transition = 'all 0.6s ease';
        nodeObserver.observe(node);
    });

    // Simulated chart data updates
    function updateCharts() {
        const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
        chartPlaceholders.forEach(chart => {
            const randomValue = Math.floor(Math.random() * 100);
            chart.innerHTML = `
                <div class="chart-value" style="color: #4CAF50">
                    ${chart.querySelector('span').textContent}<br>
                    ${randomValue}%
                </div>
            `;
        });
    }

    // Update charts every 3 seconds
    setInterval(updateCharts, 3000);

    // Mobile menu functionality
    const createMobileMenu = () => {
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

    // Initialize mobile menu
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !document.querySelector('.burger')) {
            createMobileMenu();
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Feature details content
    function getFeatureDetails(feature) {
        const details = {
            // Farmers Section
            'crop-planning': {
                title: '🌱 Crop Planning',
                content: `
                    <div class="detail-section">
                        <h3>AI-Powered Planning Tools</h3>
                        <ul>
                            <li>Soil analysis and recommendations</li>
                            <li>Weather pattern integration</li>
                            <li>Market demand forecasting</li>
                            <li>Crop rotation suggestions</li>
                        </ul>
                        <div class="planning-tools">
                            <button class="tool-btn">Soil Analysis</button>
                            <button class="tool-btn">Weather Forecast</button>
                            <button class="tool-btn">Market Insights</button>
                        </div>
                    </div>
                `,
                actions: `
                    <div class="action-section">
                        <button class="primary-btn">Start Planning</button>
                        <button class="secondary-btn">View Templates</button>
                    </div>
                `
            },
            'resource-management': {
                title: '⚡ Resource Management',
                content: `
                    <div class="detail-section">
                        <h3>Resource Tracking Tools</h3>
                        <ul>
                            <li>Water usage monitoring</li>
                            <li>Fertilizer inventory management</li>
                            <li>Equipment maintenance scheduling</li>
                            <li>Labor allocation</li>
                        </ul>
                        <div class="resource-stats">
                            <div class="stat">
                                <span class="stat-value">85%</span>
                                <span class="stat-label">Resource Efficiency</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">24/7</span>
                                <span class="stat-label">Monitoring</span>
                            </div>
                        </div>
                    </div>
                `,
                actions: `
                    <div class="action-section">
                        <button class="primary-btn">Track Resources</button>
                        <button class="secondary-btn">View Reports</button>
                    </div>
                `
            },
            'harvest-scheduling': {
                title: '📅 Harvest Scheduling',
                content: `
                    <div class="detail-section">
                        <h3>Smart Scheduling System</h3>
                        <ul>
                            <li>Optimal harvest time prediction</li>
                            <li>Labor force coordination</li>
                            <li>Equipment availability planning</li>
                            <li>Weather integration</li>
                        </ul>
                        <div class="calendar-preview">
                            <div class="calendar-header">Upcoming Harvests</div>
                            <div class="calendar-body">
                                <!-- Calendar content would be dynamically generated -->
                            </div>
                        </div>
                    </div>
                `,
                actions: `
                    <div class="action-section">
                        <button class="primary-btn">Schedule Harvest</button>
                        <button class="secondary-btn">View Calendar</button>
                    </div>
                `
            },
            // Processing Section
            'cleaning-sorting': {
                title: '�� Cleaning & Sorting',
                content: `
                    <div class="detail-section">
                        <h3>Automated Processing Systems</h3>
                        <ul>
                            <li>AI-powered sorting technology</li>
                            <li>Quality grading automation</li>
                            <li>Waste reduction systems</li>
                            <li>Cleaning process optimization</li>
                        </ul>
                        <div class="process-stats">
                            <div class="stat">
                                <span class="stat-value">99%</span>
                                <span class="stat-label">Accuracy</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">2x</span>
                                <span class="stat-label">Faster Processing</span>
                            </div>
                        </div>
                    </div>
                `,
                actions: `
                    <div class="action-section">
                        <button class="primary-btn">Start Process</button>
                        <button class="secondary-btn">View Status</button>
                    </div>
                `
            },
            // Distribution Section
            'route-optimization': {
                title: '🚛 Route Optimization',
                content: `
                    <div class="detail-section">
                        <h3>Smart Routing System</h3>
                        <ul>
                            <li>Real-time traffic integration</li>
                            <li>Multi-stop route planning</li>
                            <li>Fuel efficiency optimization</li>
                            <li>Delivery time estimation</li>
                        </ul>
                        <div class="map-preview">
                            <!-- Map interface would be integrated here -->
                        </div>
                    </div>
                `,
                actions: `
                    <div class="action-section">
                        <button class="primary-btn">Plan Routes</button>
                        <button class="secondary-btn">View Active Routes</button>
                    </div>
                `
            },
            // Add more feature details as needed
        };

        return details[feature] || {
            title: 'Feature Details',
            content: '<p>Details coming soon...</p>',
            actions: ''
        };
    }

    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.chain-card');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight) && (elementBottom >= 0);
            
            if (isVisible) {
                element.classList.add('fade-in');
            }
        });
    };

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    // Initial check for visible elements
    animateOnScroll();

    // Login System
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.querySelector('.login-btn');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const closeLoginBtn = document.getElementById('closeLogin');
    const closeRegisterBtn = document.getElementById('closeRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Show login modal
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Switch between login and register
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close modals
    [closeLoginBtn, closeRegisterBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            button.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });

    // Password strength checker
    const passwordInput = document.getElementById('regPassword');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text span');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        
        strengthMeter.setAttribute('data-strength', strength.level);
        strengthText.textContent = strength.level.charAt(0).toUpperCase() + strength.level.slice(1);
        strengthText.style.color = strength.color;
    });

    function checkPasswordStrength(password) {
        const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
        const mediumRegex = new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})');

        if (strongRegex.test(password)) {
            return { level: 'strong', color: '#4CAF50' };
        } else if (mediumRegex.test(password)) {
            return { level: 'medium', color: '#ffd93d' };
        } else {
            return { level: 'weak', color: '#ff6b6b' };
        }
    }

    // Form validation
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const submitBtn = loginForm.querySelector('.login-btn');

        if (validateForm(email, password)) {
            // Show loading state
            submitBtn.classList.add('loading');
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Success state
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');
                
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect or update UI
                setTimeout(() => {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    updateUIForLoggedInUser();
                }, 1000);
            } catch (error) {
                submitBtn.classList.remove('loading');
                showError(email.parentElement, 'Login failed. Please try again.');
            }
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('regEmail');
        const phone = document.getElementById('phone');
        const password = document.getElementById('regPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const terms = document.getElementById('terms');
        const submitBtn = registerForm.querySelector('.login-btn');

        if (validateRegistrationForm(fullName, email, phone, password, confirmPassword, terms)) {
            submitBtn.classList.add('loading');
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');
                
                setTimeout(() => {
                    registerModal.style.display = 'none';
                    loginModal.style.display = 'block';
                    showSuccess('Registration successful! Please login.');
                }, 1000);
            } catch (error) {
                submitBtn.classList.remove('loading');
                showError(email.parentElement, 'Registration failed. Please try again.');
            }
        }
    });

    function validateForm(email, password) {
        let isValid = true;
        
        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showError(email.parentElement, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email.parentElement);
        }

        if (password.value.length < 6) {
            showError(password.parentElement, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            clearError(password.parentElement);
        }

        return isValid;
    }

    function validateRegistrationForm(fullName, email, phone, password, confirmPassword, terms) {
        let isValid = true;

        if (fullName.value.length < 2) {
            showError(fullName.parentElement, 'Please enter your full name');
            isValid = false;
        } else {
            clearError(fullName.parentElement);
        }

        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showError(email.parentElement, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email.parentElement);
        }

        if (!phone.value.match(/^\d{10}$/)) {
            showError(phone.parentElement, 'Please enter a valid 10-digit phone number');
            isValid = false;
        } else {
            clearError(phone.parentElement);
        }

        if (password.value.length < 8) {
            showError(password.parentElement, 'Password must be at least 8 characters');
            isValid = false;
        } else {
            clearError(password.parentElement);
        }

        if (password.value !== confirmPassword.value) {
            showError(confirmPassword.parentElement, 'Passwords do not match');
            isValid = false;
        } else {
            clearError(confirmPassword.parentElement);
        }

        if (!terms.checked) {
            showError(terms.parentElement, 'Please accept the terms and conditions');
            isValid = false;
        } else {
            clearError(terms.parentElement);
        }

        return isValid;
    }

    function showError(formGroup, message) {
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearError(formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function showSuccess(message) {
        const successAlert = document.createElement('div');
        successAlert.className = 'success-alert';
        successAlert.textContent = message;
        document.body.appendChild(successAlert);

        setTimeout(() => {
            successAlert.remove();
        }, 3000);
    }

    function updateUIForLoggedInUser() {
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.innerHTML = `
            <span class="user-avatar">👤</span>
            <span>My Account</span>
        `;
        // Add any other UI updates for logged-in state
    }

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        updateUIForLoggedInUser();
    }
}); 