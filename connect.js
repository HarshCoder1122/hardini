document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
    const connectBtns = document.querySelectorAll('.connect-btn[data-type]');
    const modals = document.querySelectorAll('.detail-modal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Open modal based on type
    connectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const modal = document.getElementById(`${type}Modal`);
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal functionality
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.detail-modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Farmers Network Functionality
    const farmerConnectBtns = document.querySelectorAll('.farmer-card .connect-btn');
    farmerConnectBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.textContent = 'Connecting...';
            await new Promise(resolve => setTimeout(resolve, 1500));
            btn.textContent = 'Connected';
            btn.disabled = true;
            showNotification('Successfully connected with farmer!');
        });
    });

    // Suppliers Hub Functionality
    const contactBtns = document.querySelectorAll('.contact-btn');
    contactBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const supplierName = btn.closest('.supplier-info').querySelector('h4').textContent;
            showNotification(`Contact request sent to ${supplierName}`);
        });
    });

    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productName = btn.closest('.product-card').querySelector('h4').textContent;
            showNotification(`Order placed for ${productName}`);
        });
    });

    // Market Connect Functionality
    const bidBtns = document.querySelectorAll('.bid-btn');
    bidBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const buyerInfo = btn.closest('.buyer-info');
            const buyerName = buyerInfo.querySelector('h4').textContent;
            showNotification(`Bid submitted to ${buyerName}`);
        });
    });

    // Expert Connect Functionality
    const consultBtns = document.querySelectorAll('.consult-btn');
    consultBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const expertName = btn.closest('.expert-info').querySelector('h4').textContent;
            showNotification(`Consultation request sent to ${expertName}`);
        });
    });

    const uploadBtns = document.querySelectorAll('.upload-btn');
    uploadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Simulate file upload
            btn.textContent = 'Uploading...';
            setTimeout(() => {
                btn.textContent = 'Upload Photo';
                showNotification('Photo analysis will be ready in 24 hours');
            }, 2000);
        });
    });

    // Training Hub Functionality
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    enrollBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const courseName = btn.closest('.course-info').querySelector('h4').textContent;
            showNotification(`Successfully enrolled in ${courseName}`);
            
            // Start progress animation
            const progressBar = btn.closest('.course-info').querySelector('.progress');
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = '5%';
            }, 500);
        });
    });

    const joinBtns = document.querySelectorAll('.join-btn');
    joinBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const workshopName = btn.closest('.workshop-card').querySelector('h4').textContent;
            showNotification(`Successfully registered for ${workshopName}`);
        });
    });

    // Community Forum Functionality
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const discussionTitle = btn.closest('.discussion-card').querySelector('h4').textContent;
            showNotification(`Loading discussion: ${discussionTitle}`);
        });
    });

    const postBtn = document.querySelector('.post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const topicInput = document.getElementById('topic');
            const categorySelect = document.getElementById('category');
            
            if (topicInput.value && categorySelect.value) {
                showNotification('Discussion posted successfully!');
                topicInput.value = '';
                categorySelect.value = '';
                document.getElementById('description').value = '';
            } else {
                showNotification('Please fill in all required fields', 'error');
            }
        });
    }

    // Connection form submission
    const connectionForm = document.getElementById('connectionForm');
    if (connectionForm) {
        connectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = connectionForm.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            
            // Get form data
            const formData = new FormData(connectionForm);
            const formDataObj = {};
            formData.forEach((value, key) => {
                if (formDataObj[key]) {
                    if (!Array.isArray(formDataObj[key])) {
                        formDataObj[key] = [formDataObj[key]];
                    }
                    formDataObj[key].push(value);
                } else {
                    formDataObj[key] = value;
                }
            });

            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            submitBtn.classList.remove('loading');
            showNotification('Your connection request has been submitted successfully!');
            connectionForm.reset();
        });
    }

    // Notification system
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

    // Story cards hover effect
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 10px 20px rgba(76, 175, 80, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });

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

    // Initialize mobile menu for smaller screens
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

    // Form validation and enhancement
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            
            // Validate on blur
            if (input.required && !input.value) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', () => {
            if (input.required && !input.value) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
    });

    // Add dynamic styles for form validation
    const validationStyles = document.createElement('style');
    validationStyles.textContent = `
        .form-group.focused label {
            color: #4CAF50;
            transform: translateY(-5px);
            transition: all 0.3s ease;
        }
        
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #ff4444;
        }
        
        .form-group input.error:focus,
        .form-group select.error:focus,
        .form-group textarea.error:focus {
            border-color: #ff4444;
            box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2);
        }
    `;
    document.head.appendChild(validationStyles);
}); 