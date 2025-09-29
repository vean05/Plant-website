// Plant Gifts Page - Interactive Functionality

class PlantGiftsPage {
    constructor() {
        this.currentCategory = 'gifts-she-loves';
        this.init();
    }
    
    init() {
        this.setupProductInteractions();
        this.setupScrollEffects();
    }
    
    setupProductInteractions() {
        const productCards = document.querySelectorAll('.premium-card');
        
        productCards.forEach(card => {
            // Quick view functionality
            const quickViewBtn = card.querySelector('.quick-view');
            if (quickViewBtn) {
                quickViewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showQuickView(card);
                });
            }
            
            // Wishlist functionality
            const wishlistBtn = card.querySelector('.add-to-wishlist');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleWishlist(wishlistBtn);
                });
            }
            
            // Add to cart functionality
            const addToCartBtn = card.querySelector('.premium-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.addToCart(card);
                });
            }
        });
    }
    
    showQuickView(card) {
        const productName = card.querySelector('h3').textContent;
        const productPrice = card.querySelector('.current-price').textContent;
        const productImage = card.querySelector('img').src;
        
        // Create quick view modal
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="${productImage}" alt="${productName}">
                    </div>
                    <div class="modal-info">
                        <h3>${productName}</h3>
                        <p class="modal-price">${productPrice}</p>
                        <p class="modal-description">This beautiful plant makes a perfect gift for any occasion. Easy to care for and will bring life to any space.</p>
                        <button class="modal-add-to-cart">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .quick-view-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            
            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.1);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                z-index: 1;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: rgba(0, 0, 0, 0.2);
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 40px;
            }
            
            .modal-image img {
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: 15px;
            }
            
            .modal-info h3 {
                font-size: 1.8rem;
                color: #2d5a27;
                margin-bottom: 15px;
                font-family: 'Inter', sans-serif;
            }
            
            .modal-price {
                font-size: 1.5rem;
                font-weight: 700;
                color: #2d5a27;
                margin-bottom: 20px;
            }
            
            .modal-description {
                color: #6c757d;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            
            .modal-add-to-cart {
                background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
            }
            
            .modal-add-to-cart:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(45, 90, 39, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                    gap: 20px;
                    padding: 30px 20px;
                }
                
                .modal-image img {
                    height: 200px;
                }
            }
        `;
        
        document.head.appendChild(modalStyles);
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(modalStyles);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Add to cart from modal
        const modalAddToCart = modal.querySelector('.modal-add-to-cart');
        modalAddToCart.addEventListener('click', () => {
            this.addToCart(card);
            closeModal();
        });
    }
    
    toggleWishlist(btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fas')) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.color = '#6c757d';
            this.showNotification('Removed from wishlist', 'info');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.color = '#ef4444';
            this.showNotification('Added to wishlist', 'success');
        }
    }
    
    addToCart(card) {
        const productName = card.querySelector('h3').textContent;
        this.showNotification(`${productName} added to cart!`, 'success');
        
        // Add cart animation
        const cartBtn = document.querySelector('.cart-btn');
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #22c55e, #16a34a);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(notificationStyles);
        document.body.appendChild(notification);
        
        // Auto remove notification
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(notificationStyles);
            }, 300);
        }, 3000);
    }
    
    setupScrollEffects() {
        // Parallax effect for hero background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackground = document.querySelector('.page-hero .hero-background');
            
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
        
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.premium-card, .gift-guide, .newsletter-section');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlantGiftsPage();
});
