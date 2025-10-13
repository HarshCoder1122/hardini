// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
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

    // Mobile menu toggle
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
    createMobileMenu();

    // Feature cards interaction
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            featureCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            card.classList.add('active');
        });
    });





    // Get Started button animation
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            ctaButton.classList.add('clicked');
            setTimeout(() => {
                ctaButton.classList.remove('clicked');
                // Scroll to features section
                document.querySelector('.features').scrollIntoView({
                    behavior: 'smooth'
                });
            }, 300);
        });
    }

    // Scroll down button functionality
    const scrollDownBtn = document.querySelector('.scroll-down-btn');
    const newLandingPage = document.querySelector('.new-landing-page');
    const oldAppContent = document.getElementById('old-app-content');

    if (scrollDownBtn && newLandingPage && oldAppContent) {
        scrollDownBtn.addEventListener('click', () => {
            newLandingPage.style.display = 'none';
            oldAppContent.style.display = 'block';
            document.body.style.overflow = 'auto'; // Enable scrolling for the old app
        });
    }

    // Initially hide old app content and enable scrolling for landing page
    if (newLandingPage && oldAppContent) {
        oldAppContent.style.display = 'none';
        document.body.style.overflow = 'hidden'; // Disable scrolling for the landing page
    }

    // Contact Form Functionality
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            // Show sending state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending... 📨';
            submitBtn.disabled = true;

            try {
                // Simulate sending data to server
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Show success message
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Sorry, there was an error sending your message. Please try again.');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Newsletter Form Functionality
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn = newsletterForm.querySelector('button');
            const originalBtnText = submitBtn.innerHTML;
            
            if (!emailInput.value) {
                alert('Please enter your email address.');
                return;
            }

            submitBtn.innerHTML = 'Subscribing...';
            submitBtn.disabled = true;

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
            } catch (error) {
                console.error('Error subscribing:', error);
                alert('Sorry, there was an error subscribing. Please try again.');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }



    // Modal functionality
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    const modals = document.querySelectorAll('.detail-modal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Open modal based on type
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                modal.querySelector('.modal-content').style.opacity = '0';
                setTimeout(() => {
                    modal.querySelector('.modal-content').style.opacity = '1';
                }, 10);
            }
        });
    });

    // Close modal functionality
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(e);
            }
        });
    });

    function closeModal(e) {
        const modal = e.target.closest('.detail-modal');
        modal.querySelector('.modal-content').style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Product Order Functionality
    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const productCard = btn.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Order placed successfully for ${productName}!`);
            btn.textContent = 'Order Now';
            btn.disabled = false;
        });
    });

    // Demo Booking Functionality
    const demoBtns = document.querySelectorAll('.demo-btn');
    demoBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const productCard = btn.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            btn.textContent = 'Scheduling...';
            btn.disabled = true;
            
            // Simulate booking process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Demo scheduled successfully for ${productName}!`);
            btn.textContent = 'Book Demo';
            btn.disabled = false;
        });
    });

    // Rent Button Functionality
    const rentBtns = document.querySelectorAll('.rent-btn');
    rentBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const productCard = btn.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            // Simulate rental processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Rental request submitted for ${productName}! Our team will contact you shortly.`);
            btn.textContent = 'Book Now';
            btn.disabled = false;
        });
    });

    // Service Booking Functionality
    const bookBtns = document.querySelectorAll('.book-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const serviceCard = btn.closest('.service-card');
            const serviceName = serviceCard.querySelector('h4').textContent;
            btn.textContent = 'Booking...';
            btn.disabled = true;
            
            // Simulate booking process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Service booked successfully: ${serviceName}`);
            btn.textContent = 'Book Service';
            btn.disabled = false;
        });
    });

    // Expert Connection Functionality
    const connectBtns = document.querySelectorAll('.connect-btn');
    connectBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const expertCard = btn.closest('.expert-card');
            const expertName = expertCard.querySelector('h4').textContent;
            btn.textContent = 'Connecting...';
            btn.disabled = true;
            
            // Simulate connection process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Connection request sent to ${expertName}`);
            btn.textContent = 'Connect & Learn';
            btn.disabled = false;
        });
    });

    // Program Enrollment Functionality
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    enrollBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const programCard = btn.closest('.program-card');
            const programName = programCard.querySelector('h4').textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            // Simulate enrollment process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification(`Successfully enrolled in ${programName}`);
            btn.textContent = 'Enrolled ✓';
            btn.classList.add('enrolled');
            btn.disabled = true;
        });
    });

    // Soil Analysis Form Submission
    const soilAnalysisForm = document.getElementById('soilAnalysisForm');
    if (soilAnalysisForm) {
        soilAnalysisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = soilAnalysisForm.querySelector('.analyze-btn');
            submitBtn.textContent = 'Analyzing...';
            submitBtn.disabled = true;
            
            // Simulate analysis process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showNotification('Soil analysis report will be sent to your email');
            submitBtn.textContent = 'Get Recommendations';
            submitBtn.disabled = false;
            soilAnalysisForm.reset();
        });
    }

    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Quality Chart Animation
    const chartCircles = document.querySelectorAll('.chart-circle');
    chartCircles.forEach(circle => {
        const percent = circle.style.getPropertyValue('--percent');
        circle.style.setProperty('--percent', '0');
        setTimeout(() => {
            circle.style.setProperty('--percent', percent);
        }, 500);
    });

    // Add hover effects for feature cards
    const featureCardsHover = document.querySelectorAll('.feature-card');
    featureCardsHover.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.borderColor = '#4CAF50';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.borderColor = 'rgba(76, 175, 80, 0.2)';
        });
    });

    // Outlet Category Switching
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categoryContents = document.querySelectorAll('.category-content');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            categoryBtns.forEach(b => b.classList.remove('active'));
            categoryContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            const category = btn.dataset.category;
            document.getElementById(`${category}-content`).classList.add('active');
        });
    });

    // Initialize first category
    if (categoryBtns.length > 0) {
        categoryBtns[0].click();
    }

    // Chatbot Functionality
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotBox = document.getElementById('chatbotBox');
    const botIcon = document.querySelector('.bot-icon');
    const closeChat = document.querySelector('.close-chat');

    if (chatbotToggle && chatbotBox) {
        chatbotToggle.addEventListener('click', () => {
            const isOpen = chatbotBox.classList.contains('active');

            if (isOpen) {
                // Close chatbot
                chatbotBox.classList.remove('active');
                setTimeout(() => {
                    chatbotBox.style.display = 'none';
                }, 300); // Match animation duration
                botIcon.style.display = 'block';
                closeChat.style.display = 'none';
            } else {
                // Open chatbot
                chatbotBox.style.display = 'flex';
                setTimeout(() => {
                    chatbotBox.classList.add('active');
                }, 10); // Small delay to trigger animation
                botIcon.style.display = 'none';
                closeChat.style.display = 'block';
            }
        });
    }
});



// Outlet Section Booking Functions
document.addEventListener('DOMContentLoaded', function() {
    // Handle all booking buttons
    const bookingButtons = document.querySelectorAll('.rent-btn, .order-btn, .demo-btn');
    
    bookingButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            const originalText = this.textContent;
            
            // Show loading state
            this.textContent = '⏳ Processing...';
            this.disabled = true;
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Generate booking reference
                const bookingRef = generateBookingReference();
                
                // Get current date and estimated delivery/service date
                const currentDate = new Date();
                const estimatedDate = new Date(currentDate);
                estimatedDate.setDate(currentDate.getDate() + 2); // Add 2 days
                
                // Format dates
                const bookingDate = currentDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                const serviceDate = estimatedDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                
                // Show success message with booking details
                const message = `
                    ✅ Booking Confirmed!
                    
                    🔖 Booking Reference: ${bookingRef}
                    🚜 Equipment: ${productName}
                    📅 Booking Date: ${bookingDate}
                    🗓️ Service Date: ${serviceDate}
                    
                    Our team will contact you shortly with further details.
                    For support, call: +91 1234567890
                `;
                
                showNotification(message, 'success', 8000); // Show for 8 seconds
                
                // Add to recent bookings (could be used to show booking history)
                addToRecentBookings({
                    ref: bookingRef,
                    product: productName,
                    date: bookingDate,
                    status: 'Confirmed'
                });
                
            } catch (error) {
                showNotification('❌ Booking failed. Please try again.', 'error');
            } finally {
                // Reset button state
                this.textContent = originalText;
                this.disabled = false;
            }
        });
    });
});

// Generate unique booking reference
function generateBookingReference() {
    const prefix = 'HDN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// Show notification with custom styling
function showNotification(message, type = 'success', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Convert message to HTML with line breaks
    const messageHTML = message.split('\n').map(line => `<div>${line.trim()}</div>`).join('');
    notification.innerHTML = messageHTML;
    
    // Style based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// Store recent bookings
function addToRecentBookings(booking) {
    let recentBookings = JSON.parse(localStorage.getItem('recentBookings') || '[]');
    recentBookings.unshift(booking);
    recentBookings = recentBookings.slice(0, 5); // Keep only last 5 bookings
    localStorage.setItem('recentBookings', JSON.stringify(recentBookings));
}

// Add styles for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 20px;
        background: #4CAF50;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        min-width: 300px;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-line;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification div {
        margin: 4px 0;
    }

    .notification.error {
        background: #f44336;
    }
`;
document.head.appendChild(style);

// Booking Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all order/rent/book buttons
    document.querySelectorAll('.order-btn, .rent-btn, .demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const category = card.closest('.category-content').id.split('-')[0];
            const modalId = category + 'BookingModal';
            const modal = document.getElementById(modalId);
            
            // Pre-fill product selection if available
            const productSelect = modal.querySelector('select[name="product"], select[name="equipment"], select[name="service"]');
            if (productSelect && card.querySelector('h4')) {
                const productName = card.querySelector('h4').textContent;
                Array.from(productSelect.options).forEach(option => {
                    if (option.text === productName) {
                        option.selected = true;
                        updatePricing(modal);
                    }
                });
            }
            
            modal.style.display = 'flex';
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.booking-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modal when clicking close button
    document.querySelectorAll('.booking-modal .close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.booking-modal').style.display = 'none';
        });
    });

    // Handle form submissions
    document.querySelectorAll('.booking-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const modal = e.target.closest('.booking-modal');
            const formData = new FormData(form);
            const bookingData = Object.fromEntries(formData.entries());
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <h3>✅ Booking Successful!</h3>
                <p>Your booking reference: #${generateBookingReference()}</p>
                <p>We'll send you a confirmation email shortly.</p>
            `;
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.innerHTML = '';
            modalContent.appendChild(successMessage);
            
            // Close modal after 3 seconds
            setTimeout(() => {
                modal.style.display = 'none';
                // Reset form
                form.reset();
                modalContent.innerHTML = modal.querySelector('.modal-content').innerHTML;
            }, 3000);
        });
    });

    // Update pricing when inputs change
    document.querySelectorAll('.booking-form').forEach(form => {
        form.addEventListener('change', (e) => {
            updatePricing(e.target.closest('.booking-modal'));
        });
    });
});

// Function to update pricing based on selections
function updatePricing(modal) {
    const form = modal.querySelector('.booking-form');
    if (!form) return;

    const modalId = modal.id;
    let total = 0;

    switch(modalId) {
        case 'seedBookingModal':
            const seedQuantity = parseInt(form.querySelector('input[name="quantity"]')?.value || 0);
            const seedPrice = 200; // Price per kg
            total = seedQuantity * seedPrice;
            form.querySelector('.product-cost').textContent = `₹${total}`;
            total += 100; // Delivery charge
            break;

        case 'pesticideBookingModal':
            const pestQuantity = parseInt(form.querySelector('input[name="quantity"]')?.value || 0);
            const pestPrice = 450; // Price per liter
            total = pestQuantity * pestPrice;
            form.querySelector('.product-cost').textContent = `₹${total}`;
            total += 500; // Safety kit
            total += 150; // Delivery charge
            break;

        case 'equipmentRentalModal':
            const equipment = form.querySelector('select[name="equipment"]')?.value;
            const period = form.querySelector('input[name="period"]:checked')?.value;
            const startDate = new Date(form.querySelector('input[name="start-date"]')?.value || '');
            const endDate = new Date(form.querySelector('input[name="end-date"]')?.value || '');
            
            if (equipment && period && startDate && endDate) {
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                let dailyRate = 0;
                
                switch(equipment) {
                    case 'tractor': dailyRate = 5000; break;
                    case 'harvester': dailyRate = 8000; break;
                    case 'rotavator': dailyRate = 2000; break;
                }

                switch(period) {
                    case 'daily': total = dailyRate * days; break;
                    case 'weekly': total = (dailyRate * 6) * Math.ceil(days / 7); break;
                    case 'monthly': total = (dailyRate * 20) * Math.ceil(days / 30); break;
                }
            }

            // Add operator cost if selected
            if (form.querySelector('input[name="operator"][value="yes"]').checked) {
                const operatorCost = 1000 * days;
                form.querySelector('.operator-cost').textContent = `₹${operatorCost}`;
                total += operatorCost;
            }

            // Add insurance if selected
            if (form.querySelector('input[name="insurance"]').checked) {
                const insuranceCost = total * 0.05;
                form.querySelector('.insurance-cost').textContent = `₹${insuranceCost}`;
                total += insuranceCost;
            }

            form.querySelector('.equipment-cost').textContent = `₹${total}`;
            total += 10000; // Security deposit
            break;

        case 'droneBookingModal':
            const service = form.querySelector('select[name="service"]')?.value;
            const fieldSize = parseInt(form.querySelector('input[name="field-size"]')?.value || 0);
            
            if (service && fieldSize) {
                switch(service) {
                    case 'spray': total = fieldSize * 1000; break;
                    case 'mapping': total = fieldSize * 800; break;
                    case 'monitoring': total = fieldSize * 500; break;
                }
            }

            // Add additional services
            if (form.querySelector('input[name="data-analysis"]').checked) {
                total += 1000;
            }
            if (form.querySelector('input[name="consultation"]').checked) {
                total += 500;
            }

            form.querySelector('.service-cost').textContent = `₹${total}`;
            total += 500; // Travel charges
            break;
    }

    // Update total amount
    const totalElement = form.querySelector('.total-amount');
    if (totalElement) {
        totalElement.textContent = `₹${total}`;
    }
}

// Date validation for equipment rental
document.querySelectorAll('input[name="start-date"], input[name="end-date"]').forEach(input => {
    input.addEventListener('change', (e) => {
        const form = e.target.closest('form');
        const startDate = new Date(form.querySelector('input[name="start-date"]').value);
        const endDate = new Date(form.querySelector('input[name="end-date"]').value);

        if (endDate < startDate) {
            alert('End date cannot be earlier than start date');
            e.target.value = '';
        }
    });
});
