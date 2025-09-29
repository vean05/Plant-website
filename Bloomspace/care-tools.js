// Care Tools Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page features
    initializeScrollAnimations();
    addFloatingAnimation();
    
    // Add same product card interactions as homepage
    initializeProductCards();
});

// Initialize product card interactions (same as homepage)
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Add quick view on click (same as homepage)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart')) {
                // Quick view or product details (if implemented)
                console.log('Product clicked:', this.querySelector('h3').textContent);
            }
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '1';
        });
    });
}

// Note: Add to cart functionality is automatically handled by script.js shopping cart system
// The cart button clicks are handled by the global cart event listener in script.js

// Scroll animations
function initializeScrollAnimations() {
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
    
    // Animate product cards on scroll
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(header);
    });
}

// Add floating animation to hero card
function addFloatingAnimation() {
    const floatingCard = document.querySelector('.floating-card');
    if (floatingCard) {
        // Add subtle mouse movement effect
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 10 - 5;
            const y = (e.clientY / window.innerHeight) * 10 - 5;
            
            floatingCard.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.closest('a').getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Ripple effect is handled by global CSS and script.js

// CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .toast-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);
