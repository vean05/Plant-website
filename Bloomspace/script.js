// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.updateCartDisplay();
        this.bindEvents();
        this.checkUserRegistration();
    }

    // Check if user is registered (has completed signup)
    checkUserRegistration() {
        // Check if user has completed signup process
        const isRegistered = localStorage.getItem('bloomspaceUserRegistered') === 'true';
        const userEmail = localStorage.getItem('bloomspaceUserEmail');
        
        console.log('🔍 Checking user registration...');
        console.log('isRegistered:', isRegistered);
        console.log('userEmail:', userEmail);
        
        // Voucher functionality moved to checkout page
        // No longer showing voucher in cart
    }

    // Voucher functionality moved to checkout page
    // These methods are no longer needed in cart

    // Voucher functionality moved to checkout page

    bindEvents() {
        // Cart button click - bind to all cart buttons
        const cartBtns = document.querySelectorAll('.cart-btn');
        cartBtns.forEach(cartBtn => {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        });

        // Close cart button
        const closeCartBtn = document.getElementById('closeCart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Cart overlay click
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') && !e.target.disabled) {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    this.addToCart(productCard);
                }
            }
        });

        // Product card click events (for navigation to product detail)
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            // 检查是否点击了按钮（包括各种按钮类名）
            const isButton = e.target.classList.contains('add-to-cart') || 
                           e.target.classList.contains('premium-btn') ||
                           e.target.tagName === 'BUTTON' ||
                           e.target.closest('button');
            
            if (productCard && !isButton) {
                console.log('Product card clicked:', productCard);
                this.navigateToProductDetail(productCard);
            }
        });

        // Newsletter forms
        this.bindNewsletterForms();

    }

    addToCart(productCard) {
        console.log('🛒 ShoppingCart.addToCart called');
        
        try {
        // Validate product card
        if (!productCard) {
            console.error('Product card not found');
                this.showErrorMessage('Product card not found');
            return;
        }

        const productImage = productCard.querySelector('.product-image img, img');
        const productName = productCard.querySelector('h3, h2, .product-name')?.textContent?.trim();
        const productPrice = productCard.querySelector('.current-price, .price, .product-price')?.textContent?.trim();
        const productSize = productCard.querySelector('.size, .product-size')?.textContent?.trim() || '';
        const productQuantity = productCard.dataset.quantity ? parseInt(productCard.dataset.quantity) : 1;
        const productId = productCard.dataset.id || `product_${Date.now()}`;

        console.log('Product details:', { productId, productName, productPrice, productSize, productQuantity });

        if (!productName || !productPrice) {
            console.error('Missing product name or price');
            this.showErrorMessage('Unable to add item to cart - missing product information');
            return;
        }

        const price = parseFloat(productPrice.replace(/[^\d.-]/g, ''));
        if (isNaN(price) || price <= 0) {
            console.error('Invalid price:', productPrice);
            this.showErrorMessage('Invalid product price');
            return;
        }

        const image = productImage ? productImage.src : 'https://via.placeholder.com/200x200/2d5a27/ffffff?text=Plant';
        
        const item = {
            id: productId,
            name: productName,
            price: price,
            size: productSize,
            image: image,
            quantity: productQuantity
        };

        // Check if item already exists
        const existingItemIndex = this.items.findIndex(existingItem => 
            existingItem.name === item.name && existingItem.size === item.size
        );

        if (existingItemIndex > -1) {
            console.log('Item already exists, increasing quantity by', productQuantity);
            this.items[existingItemIndex].quantity += productQuantity;
        } else {
            console.log('New item, adding to cart with quantity', productQuantity);
            this.items.push(item);
        }

        console.log('Cart items after add:', this.items);

        this.updateTotal();
        this.saveToLocalStorage();
        this.updateCartDisplay();
        this.showAddToCartMessage(productName);
        
        // Add visual feedback to the button
            const addBtn = productCard.querySelector('.add-to-cart, .add-to-cart-btn');
        if (addBtn) {
            addBtn.style.transform = 'scale(0.95)';
            addBtn.style.backgroundColor = '#27ae60';
            addBtn.textContent = 'Added!';
            
            setTimeout(() => {
                addBtn.style.transform = '';
                addBtn.style.backgroundColor = '';
                addBtn.textContent = 'Add to Cart';
            }, 1000);
            }
        } catch (error) {
            console.error('Error in addToCart:', error);
            this.showErrorMessage('Failed to add item to cart. Please try again.');
        }
    }


    removeFromCart(itemId) {
        console.log('🗑️ Removing item from cart:', itemId);
        console.log('Items before removal:', this.items);
        
        try {
            // 确保 itemId 是字符串类型进行比较
            const stringItemId = String(itemId);
            
            const itemElement = document.querySelector(`[data-id="${stringItemId}"]`);
        if (itemElement) {
            itemElement.classList.add('removing');
            setTimeout(() => {
                    this.items = this.items.filter(item => String(item.id) !== stringItemId);
                console.log('Items after removal:', this.items);
                this.updateTotal();
                this.saveToLocalStorage();
                this.updateCartDisplay();
                    this.showAddToCartMessage('Item removed from cart');
            }, 300);
        } else {
                this.items = this.items.filter(item => String(item.id) !== stringItemId);
            console.log('Items after removal:', this.items);
            this.updateTotal();
            this.saveToLocalStorage();
            this.updateCartDisplay();
                this.showAddToCartMessage('Item removed from cart');
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            this.showErrorMessage('Failed to remove item from cart');
        }
    }

    updateQuantity(itemId, newQuantity) {
        try {
            const stringItemId = String(itemId);
            const item = this.items.find(item => String(item.id) === stringItemId);
        if (item) {
            if (newQuantity <= 0) {
                    this.removeFromCart(stringItemId);
            } else {
                item.quantity = newQuantity;
                this.updateTotal();
                this.saveToLocalStorage();
                this.updateCartDisplay();
            }
            } else {
                console.warn('Item not found for quantity update:', itemId);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showErrorMessage('Failed to update quantity');
        }
    }

    updateTotal() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.total = subtotal;
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <small>Add some plants to get started!</small>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image" onclick="cart.goToProductDetail('${item.name}', '${item.size}')">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details" onclick="cart.goToProductDetail('${item.name}', '${item.size}')">
                        <h4>${item.name}</h4>
                        <p class="cart-item-size">${item.size}</p>
                        <p class="cart-item-price">RM${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" onclick="event.stopPropagation(); cart.updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="event.stopPropagation(); cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="event.stopPropagation(); cart.removeFromCart('${item.id}')" title="Remove item">&times;</button>
                </div>
            `).join('');
        }

        // Update cart total
            cartTotal.textContent = `RM${this.total.toFixed(2)}`;

        // Update checkout button to redirect to checkout page
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                if (this.items.length === 0) {
                    this.showErrorMessage('Your cart is empty! Please add some items before checkout.');
                    return;
                }
                window.location.href = 'checkout.html';
            };
        }
        
        this.updateCartBadge();
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    showAddToCartMessage(productName) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'add-to-cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${productName} added to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showErrorMessage(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.cart-error-notification');
        if (existingError) {
            existingError.remove();
        }

        // Create error notification with better animation
        const notification = document.createElement('div');
        notification.className = 'cart-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-shopping-cart"></i>
                <span>${message}</span>
                <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    saveToLocalStorage() {
        localStorage.setItem('bloomspaceCart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('bloomspaceCart');
        if (savedCart) {
            const cartData = JSON.parse(savedCart);
            this.items = cartData.items || [];
            this.total = cartData.total || 0;
        }
    }

    updateCartBadge() {
        console.log('🛒 Updating cart badge...');
        const cartBtn = document.querySelector('.cart-btn');
        if (!cartBtn) {
            console.log('❌ Cart button not found');
            return;
        }

        let badge = cartBtn.querySelector('.cart-badge');
        const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        console.log('Cart items:', this.items);
        console.log('Item count:', itemCount);

        if (itemCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartBtn.appendChild(badge);
            }
            badge.textContent = itemCount > 99 ? '99+' : itemCount;
            badge.classList.remove('hidden');
            badge.style.display = 'block';
            
            console.log('✅ Badge updated:', badge.textContent);
            
            // Add pulse animation when count changes
            badge.classList.add('pulse');
            setTimeout(() => badge.classList.remove('pulse'), 600);
        } else {
            // Remove badge completely when cart is empty
            if (badge) {
                badge.remove();
                console.log('✅ Badge removed - cart is empty');
            }
        }
    }

    goToProductDetail(productName, productSize) {
        // Close cart first
        this.closeCart();
        
        // Create a simple product detail URL based on product name
        // In a real application, you would have proper product IDs
        const productSlug = productName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
        
        // Try to find existing product detail page
        const productDetailUrl = `product-detail.html?product=${encodeURIComponent(productSlug)}&size=${encodeURIComponent(productSize)}`;
        
        console.log(`Navigating to product detail: ${productDetailUrl}`);
        
        // Navigate to product detail page
        window.location.href = productDetailUrl;
    }

    bindNewsletterForms() {
        const newsletterForms = document.querySelectorAll('.newsletter-form, .footer-newsletter');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput.value;
                
                if (this.validateEmail(email)) {
                    this.showNewsletterSuccess();
                    emailInput.value = '';
                } else {
                    this.showNewsletterError();
                }
            });
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showNewsletterSuccess() {
        this.showNotification('Thank you for subscribing!', 'success');
    }

    showNewsletterError() {
        this.showNotification('Please enter a valid email address.', 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    navigateToProductDetail(productCard) {
        console.log('navigateToProductDetail called with:', productCard);
        
        // Extract product data from the card
        const productImage = productCard.querySelector('.product-image img');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.current-price').textContent;
        const productSize = productCard.querySelector('.product-size')?.textContent || 'Medium';
        const productBadge = productCard.querySelector('.product-badge')?.textContent || '';
        const productDescription = productCard.dataset.description || 'A beautiful plant for your home or office';
        
        // Extract size prices
        const priceSmall = parseFloat(productCard.dataset.priceSmall) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceMedium = parseFloat(productCard.dataset.priceMedium) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceLarge = parseFloat(productCard.dataset.priceLarge) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        
        console.log('Extracted data:', {
            productImage: productImage?.src,
            productName,
            productPrice,
            productSize,
            productBadge,
            productDescription,
            priceSmall,
            priceMedium,
            priceLarge
        });
        
        // Check for original price
        const originalPriceElement = productCard.querySelector('.original-price');
        let originalPrice = null;
        if (originalPriceElement) {
            const originalPriceText = originalPriceElement.textContent;
            originalPrice = parseFloat(originalPriceText.replace('RM', '').replace(',', ''));
        }

        // Parse current price
        const price = parseFloat(productPrice.replace('RM', '').replace(',', ''));

        // Create product data object
        const productData = {
            id: productCard.dataset.id || `product_${Date.now()}`,
            name: productName,
            price: price,
            originalPrice: originalPrice,
            size: productSize,
            image: productImage.src,
            badge: productBadge,
            description: productDescription,
            price_small: priceSmall,
            price_medium: priceMedium,
            price_large: priceLarge
        };

        console.log('Product data to store:', productData);

        // Store product data in sessionStorage
        sessionStorage.setItem('selectedProduct', JSON.stringify(productData));

        // Navigate to product detail page
        console.log('Navigating to product-detail.html');
        window.location.href = 'product-detail.html';
    }
}


// Smooth Scrolling
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Product Image Lazy Loading
class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observeImages();
        } else {
            this.loadAllImages();
        }
    }

    observeImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
        });
    }
}

// Mobile Menu Toggle
class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.bindEvents();
        this.setupAutoCompact();
    }

    createMobileMenu() {
        const header = document.querySelector('.header-main');
        if (!header) return;

        // Use existing button if present; otherwise create
        let mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (!mobileMenuBtn) {
            mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.setAttribute('aria-label', 'Toggle mobile menu');
            header.appendChild(mobileMenuBtn);
        }

        // Create menu only once
        let mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            document.body.appendChild(mobileMenu);
        }
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>Menu</h3>
                    <button class="close-mobile-menu">&times;</button>
                </div>
                <nav class="mobile-nav">
                    <ul>
                        <li><a href="#get-rm10">Get RM10</a></li>
                        <li><a href="#plant-gifts">Plant Gifts</a></li>
                        <li><a href="#new-arrivals">New Arrivals</a></li>
                        <li><a href="#artificial-plant">Artificial Plant</a></li>
                        <li><a href="#planters">Planters</a></li>
                        <li><a href="#care-tools">Care Tools</a></li>
                        <li><a href="#growlight">Growlight</a></li>
                        <li><a href="#events">Events</a></li>
                        <li class="mobile-login"><a href="#login"><i class="fas fa-user"></i> Login</a></li>
                    </ul>
                </nav>
            </div>
        `;

        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                font-size: 24px;
                color: #333;
                cursor: pointer;
                padding: 10px;
            }
            
            .mobile-menu {
                position: fixed;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 1002;
                transition: left 0.3s;
            }
            
            .mobile-menu.show {
                left: 0;
            }
            
            .mobile-menu-content {
                position: absolute;
                top: 0;
                left: 0;
                width: 82%;
                height: 100%;
                background: #fff;
                padding: 20px;
                overflow-y: auto;
            }
            
            .mobile-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .close-mobile-menu {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .mobile-nav ul {
                list-style: none;
            }
            
            .mobile-nav li {
                margin-bottom: 15px;
            }
            
            .mobile-nav a {
                text-decoration: none;
                color: #333;
                font-size: 18px;
                font-weight: 500;
                display: block;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block;
                }
                
                .header-nav {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const closeMobileMenu = document.querySelector('.close-mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeMobileMenu && mobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('show');
                document.body.style.overflow = '';
            });
        }

        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    mobileMenu.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    setupAutoCompact() {
        try {
            const container = document.querySelector('.header-main .container');
            const nav = document.querySelector('.header-nav');
            const searchBox = document.querySelector('.search-box');
            
            // 如果关键元素不存在，直接返回
            if (!container || !nav || !searchBox) {
                console.log('MobileMenu: Required elements not found, skipping auto-compact setup');
                return;
            }
            
            // 确保 container 是一个有效的 DOM 元素
            if (!(container instanceof Element)) {
                console.log('MobileMenu: Container is not a valid Element');
                return;
            }
            
            const evaluate = () => {
                if (!container || !nav || !searchBox) return;
                const containerWidth = container.clientWidth;
                const contentWidth = Array.from(container.children).reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
                const cramped = contentWidth + 24 > containerWidth;
                document.body.classList.toggle('compact-header', cramped);
                // collapse search when cramped
                if (cramped) searchBox.setAttribute('data-collapsed', 'true');
            };
            
            // 只有在 container 存在且是有效元素时才创建 ResizeObserver
            if (container && container instanceof Element) {
                const ro = new ResizeObserver(evaluate);
                ro.observe(container);
                window.addEventListener('resize', evaluate);
                evaluate();
            }

            // inline search expand/collapse
            const toggleBtn = document.querySelector('.search-toggle');
            if (toggleBtn && searchBox) {
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const collapsed = searchBox.getAttribute('data-collapsed') === 'true';
                    searchBox.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
                    const input = searchBox.querySelector('input');
                    if (collapsed && input) setTimeout(() => input.focus(), 10);
                });
            }
        } catch (error) {
            console.error('MobileMenu setupAutoCompact error:', error);
        }
    }
}

// Hero Cards Automatic Movement Animation
class HeroCardAnimator {
    constructor() {
        this.cards = document.querySelectorAll('.hero-card');
        this.init();
    }
    
    init() {
        // Add different animation delays and patterns
        this.cards.forEach((card, index) => {
            // Different animation patterns for each card
            if (index === 0) {
                card.style.animation = 'float1 8s ease-in-out infinite';
            } else if (index === 1) {
                card.style.animation = 'float2 10s ease-in-out infinite 1s';
            } else {
                card.style.animation = 'float3 12s ease-in-out infinite 2s';
            }
            
            // Add subtle rotation and scale variations
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.05) rotate(2deg)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }
}

// Smart Navigation Hide/Show System
class SmartNavigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollTop = 0;
        this.scrollThreshold = 10; // Minimum scroll distance to trigger hide/show (更敏感)
        this.hideThreshold = 30; // Scroll position to start hiding (更快触发)
        this.isScrolling = false;
        this.scrollTimer = null;
        this.init();
    }
    
    init() {
        if (!this.header) {
            return;
        }
        
        // Bind scroll event with throttling
        window.addEventListener('scroll', this.throttleScroll.bind(this), { passive: true });
        
        // Add initial classes
        this.header.classList.add('header-visible');
    }
    
    throttleScroll() {
        if (!this.isScrolling) {
            window.requestAnimationFrame(() => {
                this.handleScroll();
                this.isScrolling = false;
            });
            this.isScrolling = true;
        }
        
        // Clear existing timer
        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }
        
        // Set timer to detect scroll end
        this.scrollTimer = setTimeout(() => {
            this.handleScrollEnd();
        }, 50); // 减少延迟，更快响应
    }
    
    handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = currentScrollTop > this.lastScrollTop ? 'down' : 'up';
        const scrollDistance = Math.abs(currentScrollTop - this.lastScrollTop);
        const isMobile = window.innerWidth <= 768;
        
        // Add scrolled class when not at top
        if (currentScrollTop > 50) {
            this.header.classList.add('header-scrolled');
        } else {
            this.header.classList.remove('header-scrolled');
        }
        
        // Mobile模式下更激进的隐藏策略，桌面模式下保持原来的行为
        const activeThreshold = isMobile ? 5 : this.scrollThreshold;
        const activeHideThreshold = isMobile ? 20 : this.hideThreshold;
        
        // 更敏感的隐藏/显示逻辑
        if (scrollDistance > activeThreshold) {
            if (scrollDirection === 'down' && currentScrollTop > activeHideThreshold) {
                this.hideHeader();
            } else if (scrollDirection === 'up') {
                this.showHeader();
            }
        }
        
        // 在顶部附近始终显示，不管滚动距离
        if (currentScrollTop <= activeHideThreshold) {
            this.showHeader();
        }
        
        this.lastScrollTop = currentScrollTop;
    }
    
    handleScrollEnd() {
        // Optional: Add any logic for when scrolling stops
        // For example, could ensure header is always visible after scrolling stops
    }
    
    hideHeader() {
        if (!this.header.classList.contains('header-hidden')) {
            this.header.classList.add('header-hidden');
            this.header.classList.remove('header-visible');
        }
    }
    
    showHeader() {
        if (!this.header.classList.contains('header-visible')) {
            this.header.classList.remove('header-hidden');
            this.header.classList.add('header-visible');
        }
    }
    
    // Public method to force show header (useful for mobile menu, etc.)
    forceShow() {
        this.showHeader();
    }
    
    // Public method to temporarily disable auto-hide (useful for modals, etc.)
    disable() {
        this.showHeader();
        window.removeEventListener('scroll', this.throttleScroll.bind(this));
    }
    
    // Public method to re-enable auto-hide
    enable() {
        window.addEventListener('scroll', this.throttleScroll.bind(this), { passive: true });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const smoothScroll = new SmoothScroll();
    const lazyLoader = new LazyLoader();
    // MobileMenu is now handled by navigation-loader.js
    // const mobileMenu = new MobileMenu();

    // Search functionality is now handled by navigation-loader.js
    // Removed duplicate search code to prevent conflicts
    
    // Initialize cart after navigation is loaded
    initializeCartAfterNavigation();

    // Clone products to show 12 items per section
    const sections = document.querySelectorAll('.products-grid');
    sections.forEach(grid => {
        const cards = Array.from(grid.children);
        if (cards.length === 0) return;
        let i = 0;
        while (grid.children.length < 12) {
            const clone = cards[i % cards.length].cloneNode(true);
            grid.appendChild(clone);
            i++;
        }
    });

    // Enable mobile-only carousel behavior
    function applyCarousel() {
        const isMobile = window.innerWidth <= 1024;
        document.querySelectorAll('.products-section .products-grid').forEach(grid => {
            if (isMobile) {
                grid.classList.add('carousel');
                // Ensure proper flex layout
                grid.style.display = 'flex';
                grid.style.flexWrap = 'nowrap';
            } else {
                grid.classList.remove('carousel');
                grid.style.display = 'grid';
                grid.style.flexWrap = '';
                grid.scrollTo({ left: 0 });
            }
        });
    }
    applyCarousel();
    window.addEventListener('resize', applyCarousel);

    // Dynamic pagination with smooth scrolling
    function updatePaginationNumbers() {
        document.querySelectorAll('.products-grid.carousel').forEach(grid => {
            const pagination = document.querySelector(`[data-target="#${grid.id}"]`).closest('.products-pagination');
            if (!pagination) return;
            
            const card = grid.querySelector('.product-card');
            if (!card) return;
            
            const cardWidth = card.offsetWidth;
            const gap = 16;
            const step = cardWidth + gap;
            const currentScroll = grid.scrollLeft;
            const currentPage = Math.round(currentScroll / step) + 1;
            const totalPages = Math.ceil(grid.scrollWidth / step);
            
            const pageInfo = pagination.querySelector('.pagination-info');
            if (pageInfo) {
                pageInfo.textContent = `${currentPage}/${totalPages}`;
            }
        });
    }

    // Pagination controls with improved performance
    document.querySelectorAll('.products-pagination button').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSel = btn.getAttribute('data-target');
            const grid = document.querySelector(targetSel);
            if (!grid) return;
            
            const card = grid.querySelector('.product-card');
            if (!card) return;
            
            const cardWidth = card.offsetWidth;
            const gap = 16;
            const step = cardWidth + gap;
            const dir = btn.classList.contains('prev-page') ? -1 : 1;
            
            // Smooth scroll with better performance
            const targetScroll = grid.scrollLeft + (dir * step);
            grid.scrollTo({ 
                left: targetScroll, 
                behavior: 'smooth' 
            });
            
            // Update pagination numbers after scroll
            setTimeout(updatePaginationNumbers, 300);
        });
    });

    // High-performance touch/swipe support
    document.querySelectorAll('.products-grid.carousel').forEach(grid => {
        let startX = 0;
        let scrollLeft = 0;
        let isScrolling = false;
        let animationFrame = null;

        const handleScroll = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(() => {
                updatePaginationNumbers();
            });
        };

        grid.addEventListener('scroll', handleScroll, { passive: true });

        grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            isScrolling = false;
        }, { passive: true });

        grid.addEventListener('touchmove', (e) => {
            if (!startX) return;
            const x = e.touches[0].pageX - grid.offsetLeft;
            const walk = (x - startX) * 1.2; // Optimized sensitivity
            
            // Use transform for better performance
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animationFrame = requestAnimationFrame(() => {
                grid.scrollLeft = scrollLeft - walk;
            });
            
            isScrolling = true;
        }, { passive: true });

        grid.addEventListener('touchend', () => {
            startX = 0;
            if (isScrolling && animationFrame) {
                cancelAnimationFrame(animationFrame);
                
                // Snap to nearest card with smooth animation
                const card = grid.querySelector('.product-card');
                if (card) {
                    const cardWidth = card.offsetWidth;
                    const gap = 16;
                    const step = cardWidth + gap;
                    const currentScroll = grid.scrollLeft;
                    const targetScroll = Math.round(currentScroll / step) * step;
                    
                    grid.scrollTo({ 
                        left: targetScroll, 
                        behavior: 'smooth' 
                    });
                }
            }
        }, { passive: true });
    });

    // Initial pagination numbers
    setTimeout(updatePaginationNumbers, 100);



    // Initialize hero card dragger
    new HeroCardAnimator();

    // Note: SmartNavigation is initialized after navigation loads
});

// Add CSS for notifications and search results
const additionalStyles = `
    .add-to-cart-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1003;
        transform: translateX(100%);
        transition: transform 0.3s;
    }
    
    .add-to-cart-notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 20px;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        color: #333;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1003;
        transform: translateX(100%);
        transition: transform 0.3s;
        border-left: 4px solid;
    }
    
    .notification.success {
        border-left-color: #27ae60;
    }
    
    .notification.error {
        border-left-color: #e74c3c;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .search-results-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1004;
        display: none;
        align-items: center;
        justify-content: center;
    }
    
    .search-results-modal.show {
        display: flex;
    }
    
    .search-results-content {
        background: #fff;
        border-radius: 15px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
    }
    
    .search-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .close-search-results {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .search-results-body {
        padding: 20px;
    }
    
    .search-results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    
    .search-result-item {
        text-align: center;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
    }
    
    .search-result-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 10px;
    }
    
    .search-result-item h4 {
        font-size: 16px;
        margin-bottom: 8px;
        color: #333;
    }
    
    .search-result-item .price {
        color: #2d5a27;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
    }
    
    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .cart-item-details h4 {
        font-size: 16px;
        margin-bottom: 5px;
        color: #333;
    }
    
    .cart-item-size {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
    }
    
    .cart-item-price {
        font-weight: 600;
        color: #2d5a27;
        margin-bottom: 10px;
    }
    
    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .quantity-btn {
        background: #f0f0f0;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        font-weight: 600;
        color: #333;
    }
    
    .quantity-btn:hover {
        background: #e0e0e0;
    }
    
    .remove-item {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #e74c3c;
        padding: 5px;
    }
    
    .remove-item:hover {
        color: #c0392b;
    }
    
    .empty-cart {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px 20px;
    }
    
    body.loaded .header {
        animation: slideDown 0.5s ease-out;
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
        }
        to {
            transform: translateY(0);
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ===== 通用产品卡片生成系统 =====
class ProductCardGenerator {
    constructor() {
        this.imagePool = [
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
        ];
    }

    // 生成随机图片对（默认图片 + 悬停图片）
    getRandomImagePair() {
        const shuffled = [...this.imagePool].sort(() => 0.5 - Math.random());
        return {
            default: shuffled[0],
            hover: shuffled[1]
        };
    }

    // 创建产品卡片HTML
    createProductCard(product) {
        // Use product image if available, otherwise use random image
        let productImage = product.image || this.getRandomImagePair().default;
        let hoverImage = product.hoverImage;
        
        // Fix image URLs - ensure they are valid
        productImage = this.getValidImageUrl(productImage);
        
        // Determine hover image: use secondary if available and different, otherwise use same as primary
        if (hoverImage && hoverImage.trim() !== '' && hoverImage !== productImage) {
            // Use secondary image if it exists and is different from primary
            hoverImage = this.getValidImageUrl(hoverImage);
        } else {
            // Use same image as primary for hover effect
            hoverImage = productImage;
        }
        
        // Escape quotes in product name for onclick
        const escapedName = product.name.replace(/'/g, "\\'");
        
        // Escape quotes in description for onclick
        const escapedDescription = (product.description || 'A beautiful plant for your home or office').replace(/'/g, "\\'");
        
        console.log('Creating product card for:', product.name);
        console.log('Product description:', product.description);
        console.log('Escaped description:', escapedDescription);
        
        return `
            <div class="product-card" data-id="${product.id}" data-description="${escapedDescription}" 
                 data-price-small="${product.price_small || product.price}" 
                 data-price-medium="${product.price_medium || product.price}" 
                 data-price-large="${product.price_large || product.price}">
                <div class="product-image">
                    <img src="${productImage}" alt="${product.name}" class="default-image" 
                         onerror="this.src='https://via.placeholder.com/300x300?text=Image+Not+Found'"
                         onload="console.log('✅ Image loaded:', '${productImage}')"
                         onerror="console.log('❌ Image failed:', '${productImage}')">
                    <img src="${hoverImage}" alt="${product.name}" class="hover-image" 
                         onerror="this.src='https://via.placeholder.com/300x300?text=Image+Not+Found'">
                    <div class="product-badge ${product.badgeType}">${product.badgeText}</div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-size">${product.size}</p>
                    <div class="product-price">
                        <span class="current-price">RM ${product.currentPrice}</span>
                        ${product.originalPrice ? `<span class="original-price">RM ${product.originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product.id}')">Add to Cart</button>
                </div>
            </div>
        `;
    }

    // 批量生成产品卡片
    generateProductGrid(containerId, products) {
        const container = document.getElementById(containerId);
        if (!container) return;

        console.log('ProductCardGenerator: Generating grid for', containerId, 'with', products.length, 'products');
        console.log('First product data:', products[0]);

        const productsHTML = products.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHTML;
        
        // Add click event listeners for product cards
        this.addProductCardClickListeners(container);
        
        console.log('ProductCardGenerator: Grid generated and event listeners added');
    }
    
    // 添加产品卡片点击事件监听器
    addProductCardClickListeners(container) {
        const productCards = container.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                // Check if click is on a button
                const isButton = e.target.tagName === 'BUTTON' || 
                                e.target.closest('button') ||
                                e.target.classList.contains('product-badge');
                
                if (!isButton) {
                    this.handleProductCardClick(card);
                }
            });
        });
    }
    
    // 处理产品卡片点击
    handleProductCardClick(productCard) {
        // Extract product data from the card
        const productImage = productCard.querySelector('.product-image img');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.current-price').textContent;
        const productSize = productCard.querySelector('.product-size')?.textContent || 'Small';
        const productBadge = productCard.querySelector('.product-badge')?.textContent || '';
        const productDescription = productCard.dataset.description || 'A beautiful plant for your home or office';
        
        // Extract size prices
        const priceSmall = parseFloat(productCard.dataset.priceSmall) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceMedium = parseFloat(productCard.dataset.priceMedium) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceLarge = parseFloat(productCard.dataset.priceLarge) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        
        // Check for original price
        const originalPriceElement = productCard.querySelector('.original-price');
        let originalPrice = null;
        if (originalPriceElement) {
            const originalPriceText = originalPriceElement.textContent;
            originalPrice = parseFloat(originalPriceText.replace('RM', '').replace(',', ''));
        }

        // Parse current price
        const price = parseFloat(productPrice.replace('RM', '').replace(',', ''));

        // Create product data object
        const productData = {
            id: productCard.dataset.id || `product_${Date.now()}`,
            name: productName,
            price: price,
            originalPrice: originalPrice,
            size: productSize,
            image: productImage.src,
            badge: productBadge,
            description: productDescription,
            price_small: priceSmall,
            price_medium: priceMedium,
            price_large: priceLarge
        };

        console.log('Product data to store:', productData);

        // Store product data in sessionStorage
        sessionStorage.setItem('selectedProduct', JSON.stringify(productData));

        // Navigate to product detail page
        console.log('Navigating to product-detail.html');
        window.location.href = 'product-detail.html';
    }

    // 添加单个产品到网格
    addProductToGrid(containerId, product) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const productHTML = this.createProductCard(product);
        container.insertAdjacentHTML('beforeend', productHTML);
    }

    // 从数据库数据创建产品对象
    createProductFromData(dbData) {
        return {
            id: dbData.id || `product_${Date.now()}`,
            name: dbData.name || 'Plant Product',
            size: dbData.size || 'Medium',
            currentPrice: dbData.currentPrice || '99.00',
            originalPrice: dbData.originalPrice || null,
            badgeType: dbData.badgeType || 'sale',
            badgeText: dbData.badgeText || 'Sale'
        };
    }
    
    // 获取有效的图片URL
    getValidImageUrl(imageUrl) {
        // If no image URL provided, use placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            return 'https://via.placeholder.com/300x300?text=Plant';
        }
        
        // If image URL is already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If image URL is relative, make it absolute
        if (imageUrl.startsWith('/')) {
            return window.location.origin + imageUrl;
        }
        
        // If image URL is just a filename, assume it's in images folder
        if (!imageUrl.includes('/')) {
            return window.location.origin + '/images/' + imageUrl;
        }
        
        // For any other case, try to construct a valid URL
        return window.location.origin + '/' + imageUrl;
    }
}

// 创建全局实例
window.productCardGenerator = new ProductCardGenerator();

// 处理产品卡片点击事件
function handleProductClick(productId, productName, productImage, currentPrice, originalPrice, description) {
    console.log('Product clicked:', productId, productName);
    console.log('Description received:', description);
    console.log('All arguments:', arguments);
    
    // 存储产品数据到sessionStorage
    const productData = {
        id: productId,
        name: productName,
        image: productImage,
        price: parseFloat(currentPrice),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        description: description || 'A beautiful plant for your home or office'
    };
    
    console.log('Product data to store:', productData);
    sessionStorage.setItem('selectedProduct', JSON.stringify(productData));
    
    // 导航到产品详情页
    window.location.href = 'product-detail.html';
}

// 处理添加到购物车事件
function addToCart(productId) {
    console.log('🛒 Global addToCart called with productId:', productId);
    
    try {
    // 确保购物车已初始化
    if (!window.cart) {
        console.log('❌ Cart not initialized, creating new cart');
        window.cart = new ShoppingCart();
    }
    
    // 查找产品卡片
    const productCard = document.querySelector(`[data-id="${productId}"]`);
    if (productCard) {
        console.log('✅ Product card found, adding to cart');
        window.cart.addToCart(productCard);
    } else {
        console.log('❌ Product card not found for ID:', productId);
            
        // 尝试从产品数据中创建虚拟卡片
        const productData = getProductDataById(productId);
        if (productData) {
            console.log('✅ Product data found, creating virtual card');
            const virtualCard = createVirtualProductCard(productData);
            window.cart.addToCart(virtualCard);
        } else {
            console.log('❌ No product data found for ID:', productId);
                
                // 显示用户友好的错误消息
                if (window.cart && window.cart.showErrorMessage) {
                    window.cart.showErrorMessage('Product not found! Please try refreshing the page.');
                } else {
                    alert('Product not found! Please try refreshing the page.');
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in addToCart:', error);
        
        // 显示错误消息
        if (window.cart && window.cart.showErrorMessage) {
            window.cart.showErrorMessage('Failed to add item to cart. Please try again.');
        } else {
            alert('Failed to add item to cart. Please try again.');
        }
    }
}

// 根据产品ID获取产品数据
function getProductDataById(productId) {
    // 这里可以从API或本地数据中获取产品信息
    // 暂时返回null，让购物车系统处理
    return null;
}

// 创建虚拟产品卡片
function createVirtualProductCard(productData) {
    const virtualCard = document.createElement('div');
    virtualCard.className = 'product-card';
    virtualCard.setAttribute('data-id', productData.id);
    
    // 创建产品信息元素
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';
    
    const productName = document.createElement('h3');
    productName.textContent = productData.name;
    productName.className = 'product-name';
    
    const productPrice = document.createElement('div');
    productPrice.className = 'product-price';
    const currentPrice = document.createElement('span');
    currentPrice.textContent = `RM ${productData.price}`;
    currentPrice.className = 'current-price';
    productPrice.appendChild(currentPrice);
    
    const productSize = document.createElement('p');
    productSize.textContent = productData.size || 'Medium';
    productSize.className = 'product-size';
    
    productInfo.appendChild(productName);
    productInfo.appendChild(productSize);
    productInfo.appendChild(productPrice);
    
    virtualCard.appendChild(productInfo);
    
    return virtualCard;
}

// 添加全局测试函数
window.testProductClick = function() {
    console.log('Testing product click functionality...');
    const productCards = document.querySelectorAll('.product-card');
    console.log('Found product cards:', productCards.length);
    
    if (productCards.length > 0) {
        const firstCard = productCards[0];
        console.log('First product card:', firstCard);
        console.log('Card HTML:', firstCard.outerHTML);
        
        // 检查点击事件监听器
        console.log('Checking if click event listeners are attached...');
        
        // 模拟点击
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        firstCard.dispatchEvent(event);
    } else {
        console.log('No product cards found!');
    }
};

// 添加全局函数来测试点击事件
window.testClickEvent = function() {
    console.log('Testing click event binding...');
    
    // 手动触发点击事件
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        // 检查是否点击了按钮（包括各种按钮类名）
        const isButton = e.target.classList.contains('add-to-cart') || 
                       e.target.classList.contains('premium-btn') ||
                       e.target.tagName === 'BUTTON' ||
                       e.target.closest('button');
        
        if (productCard && !isButton) {
            console.log('Click event triggered!', productCard);
            // 直接调用 navigateToProductDetail
            if (window.cart && window.cart.navigateToProductDetail) {
                window.cart.navigateToProductDetail(productCard);
            } else {
                console.log('cart.navigateToProductDetail not available');
            }
        }
    });
    
    console.log('Click event listener added');
};

// ===== 页面初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    // 加载导航组件
    loadNavigation();
    
    // 检查是否使用API加载器
    // 直接加载API产品，不再等待universalAPILoader
    console.log('🔄 Loading products from API...');
    
    // API产品加载函数
    function loadProductsFromAPI() {
        console.log('🔄 Loading products from API...');
        
        fetch('http://localhost/Plant%20Testing3/api/products/list.php?limit=50')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("✅ API products loaded:", data);
                
                // 检查API响应格式
                let products = [];
                if (data && data.data && data.data.products && Array.isArray(data.data.products)) {
                    products = data.data.products;
                } else if (data && data.products && Array.isArray(data.products)) {
                    products = data.products;
                } else if (Array.isArray(data)) {
                    products = data;
                } else {
                    throw new Error('Invalid API response format');
                }
                
                if (products.length > 0) {
                    // 转换API数据格式为显示格式
                    const displayProducts = products.map(product => ({
                        id: product.id,
                        name: product.name,
                        size: product.size || 'Medium',
                        currentPrice: product.price_small ? product.price_small.toString() : product.price ? product.price.toString() : '99.00',
                        originalPrice: product.sale_price ? product.sale_price.toString() : null,
                        badgeType: product.is_featured ? 'featured' : 'new',
                        badgeText: product.is_featured ? 'Featured' : 'New',
                        image: product.primary_image || 'https://via.placeholder.com/300x300?text=Plant',
                        hoverImage: product.secondary_image || product.primary_image || 'https://via.placeholder.com/300x300?text=Plant+Hover',
                        category: product.categories && product.categories.length > 0 ? product.categories[0].toLowerCase().replace(/\s+/g, '-') : 'indoor-plants',
                        dateAdded: product.created_at || new Date().toISOString().split('T')[0],
                        inStock: product.in_stock !== false,
                        isFeatured: product.is_featured || false,
                        description: product.description || product.short_description || 'A beautiful plant for your home or office',
                        sku: product.sku || `SKU-${product.id}`,
                        price_small: parseFloat(product.price_small) || parseFloat(product.price) || 99.00,
                        price_medium: parseFloat(product.price_medium) || parseFloat(product.price) || 99.00,
                        price_large: parseFloat(product.price_large) || parseFloat(product.price) || 99.00
                    }));
                    
                    console.log(`✅ Converted ${displayProducts.length} API products to display format`);
                    
                    // 生成产品网格
                    generateAllProductGrids(displayProducts);
                    
                } else {
                    console.warn('⚠️ No products found in API response');
                    // 显示空状态消息
                    const containers = ['bundleGrid', 'bestGrid', 'floralGrid', 'artificialGrid'];
                    containers.forEach(containerId => {
                        const container = document.getElementById(containerId);
                        if (container) {
                            container.innerHTML = '<div class="empty-state"><p>No products available at the moment.</p></div>';
                        }
                    });
            }
            })
            .catch(error => {
                console.error("❌ Failed to load products from API:", error);
                // 显示错误状态消息
                const containers = ['bundleGrid', 'bestGrid', 'floralGrid', 'artificialGrid'];
                containers.forEach(containerId => {
                    const container = document.getElementById(containerId);
                    if (container) {
                        container.innerHTML = '<div class="empty-state"><p>Unable to load products. Please try again later.</p></div>';
                    }
                });
            });
    }
    
    // 生成所有产品网格的函数
    function generateAllProductGrids(products) {
        console.log('🔄 Generating product grids with', products.length, 'products');
        
        // 按类别分组产品
        const bundleProducts = products.filter(p => p.category === 'bundle-deals').slice(0, 8);
        const bestProducts = products.filter(p => p.category === 'best-sellers').slice(0, 8);
        const floralProducts = products.filter(p => p.category === 'floral-plants').slice(0, 8);
        const artificialProducts = products.filter(p => p.category === 'artificial-plants').slice(0, 8);
        
        // 调试：显示所有产品的类别
        console.log('All product categories:', products.map(p => ({ name: p.name, category: p.category })));
        
        console.log('Product counts by category:', {
            bundle: bundleProducts.length,
            best: bestProducts.length,
            floral: floralProducts.length,
            artificial: artificialProducts.length
        });
        
        // 如果某些类别没有产品，用其他产品填充
        if (bundleProducts.length === 0 && products.length > 0) {
            bundleProducts.push(...products.slice(0, 2));
            console.log('⚠️ No bundle products found, using first 2 products');
        }
        if (bestProducts.length === 0 && products.length > 2) {
            bestProducts.push(...products.slice(2, 4));
            console.log('⚠️ No best products found, using products 2-4');
        }
        if (floralProducts.length === 0 && products.length > 4) {
            floralProducts.push(...products.slice(4, 6));
            console.log('⚠️ No floral products found, using products 4-6');
        }
        if (artificialProducts.length === 0 && products.length > 6) {
            artificialProducts.push(...products.slice(6, 8));
            console.log('⚠️ No artificial products found, using products 6-8');
        }
        
        // 生成产品网格
        if (bundleProducts.length > 0) {
            productCardGenerator.generateProductGrid('bundleGrid', bundleProducts);
            console.log('✅ Generated bundle products grid');
        }
        
        if (bestProducts.length > 0) {
            productCardGenerator.generateProductGrid('bestGrid', bestProducts);
            console.log('✅ Generated best products grid');
        }
        
        if (floralProducts.length > 0) {
            productCardGenerator.generateProductGrid('floralGrid', floralProducts);
            console.log('✅ Generated floral products grid');
        }
        
        if (artificialProducts.length > 0) {
            productCardGenerator.generateProductGrid('artificialGrid', artificialProducts);
            console.log('✅ Generated artificial products grid');
        }
        
        // 调试：检查产品卡片是否正确生成
        setTimeout(() => {
            const productCards = document.querySelectorAll('.product-card');
            console.log('Total product cards found:', productCards.length);
            if (productCards.length > 0) {
                console.log('First product card:', productCards[0]);
                console.log('Product card HTML:', productCards[0].outerHTML);
            }
        }, 1000);
    }
    
    // 直接调用API加载
    loadProductsFromAPI();
    
    // 硬编码数据已删除 - 现在只使用API数据
});

// ===== NEW ARRIVALS PAGE FUNCTIONALITY =====

class NewArrivalsPage {
    constructor() {
        this.allProducts = [];
        this.filteredProducts = [];
        this.displayedProducts = [];
        this.productsPerPage = 12;
        this.currentPage = 1;
        this.filters = {
            category: ['all'],
            price: ['all'],
            size: ['all']
        };
        this.sortBy = 'newest';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        await this.loadAllProducts();
        this.bindEvents();
        this.setupFilters();
        this.isInitialized = true;
        console.log('✅ NewArrivalsPage initialized with database products');
        
        // Debug: Check if filter elements exist
        this.debugFilterElements();
    }

    async loadAllProducts() {
        console.log('🔄 Loading products from database...');
        
        try {
            // Load products from API - all products for now (will filter by category later)
            const response = await fetch('api/products/list.php?limit=100&sort=created_at&order=DESC');
            const data = await response.json();
            
            if (data.success && data.data.products) {
                console.log(`✅ Loaded ${data.data.products.length} products from database`);
                
                // Convert API products to display format
                this.allProducts = data.data.products.map(product => ({
                    id: product.id,
                    name: product.name,
                    size: this.getSizeFromProduct(product),
                    currentPrice: product.formatted_price.replace('RM ', ''),
                    originalPrice: product.formatted_sale_price ? product.formatted_sale_price.replace('RM ', '') : null,
                    badgeType: this.getBadgeType(product),
                    badgeText: this.getBadgeText(product),
                    image: this.getValidImageUrl(product.primary_image),
                    hoverImage: this.getHoverImageUrl(product.primary_image, product.secondary_image),
                    category: this.getCategoryFromProduct(product),
                    category_ids: product.category_ids || [],
                    dateAdded: product.created_at || new Date().toISOString().split('T')[0],
                    inStock: product.in_stock,
                    isFeatured: product.is_featured,
                    description: product.description,
                    sku: product.sku,
                    price_small: product.price_small,
                    price_medium: product.price_medium,
                    price_large: product.price_large
                }));
                
                console.log(`✅ Converted ${this.allProducts.length} products to display format`);
            } else {
                console.warn('⚠️ No products loaded from API, using fallback data');
                this.loadFallbackProducts();
            }
        } catch (error) {
            console.error('❌ Error loading products from API:', error);
            console.log('🔄 Using fallback products...');
            this.loadFallbackProducts();
        }
        
        this.filteredProducts = [...this.allProducts];
        this.displayAllFilteredProducts();
        this.updateProductCount();
    }
    
    loadFallbackProducts() {
        console.log('🔄 Loading fallback products...');
        
        // Fallback products if API fails
        const fallbackProducts = [
            { 
                id: 'fallback1', 
                name: 'Sample Plant 1', 
                size: 'Medium', 
                currentPrice: '99.00', 
                originalPrice: '128.00', 
                badgeType: 'sale', 
                badgeText: 'Sale', 
                category: 'indoor-plants', 
                dateAdded: '2024-01-15',
                image: 'https://via.placeholder.com/300x300?text=Sample+Plant+1',
                hoverImage: 'https://via.placeholder.com/300x300?text=Sample+Plant+1+Hover',
                inStock: true,
                isFeatured: false,
                description: 'A beautiful sample plant for testing',
                sku: 'FALLBACK001',
                price_small: 89.00,
                price_medium: 99.00,
                price_large: 119.00
            },
            { 
                id: 'fallback2', 
                name: 'Sample Plant 2', 
                size: 'Large', 
                currentPrice: '159.00', 
                originalPrice: '188.00', 
                badgeType: 'bestseller', 
                badgeText: 'Best Seller', 
                category: 'outdoor-plants', 
                dateAdded: '2024-01-14',
                image: 'https://via.placeholder.com/300x300?text=Sample+Plant+2',
                hoverImage: 'https://via.placeholder.com/300x300?text=Sample+Plant+2+Hover',
                inStock: true,
                isFeatured: true,
                description: 'A beautiful sample plant for testing',
                sku: 'FALLBACK002',
                price_small: 139.00,
                price_medium: 159.00,
                price_large: 179.00
            },
            { 
                id: 'fallback3', 
                name: 'Sample Plant 3', 
                size: 'Small', 
                currentPrice: '79.00', 
                originalPrice: '98.00', 
                badgeType: 'new', 
                badgeText: 'New', 
                category: 'succulents', 
                dateAdded: '2024-01-13',
                image: 'https://via.placeholder.com/300x300?text=Sample+Plant+3',
                hoverImage: 'https://via.placeholder.com/300x300?text=Sample+Plant+3+Hover',
                inStock: true,
                isFeatured: false,
                description: 'A beautiful sample plant for testing',
                sku: 'FALLBACK003',
                price_small: 79.00,
                price_medium: 89.00,
                price_large: 99.00
            },
            { 
                id: 'fallback4', 
                name: 'Ceramic Planter', 
                size: 'Medium', 
                currentPrice: '45.00', 
                originalPrice: '65.00', 
                badgeType: 'sale', 
                badgeText: 'Sale', 
                category: 'pots', 
                dateAdded: '2024-01-12',
                image: 'https://via.placeholder.com/300x300?text=Ceramic+Planter',
                hoverImage: 'https://via.placeholder.com/300x300?text=Ceramic+Planter+Hover',
                inStock: true,
                isFeatured: false,
                description: 'A beautiful ceramic planter for your plants',
                sku: 'FALLBACK004',
                price_small: 35.00,
                price_medium: 45.00,
                price_large: 55.00
            },
            { 
                id: 'fallback5', 
                name: 'Terracotta Pot Set', 
                size: 'Small', 
                currentPrice: '35.00', 
                originalPrice: null, 
                badgeType: 'new', 
                badgeText: 'New', 
                category: 'pots', 
                dateAdded: '2024-01-11',
                image: 'https://via.placeholder.com/300x300?text=Terracotta+Pot+Set',
                hoverImage: 'https://via.placeholder.com/300x300?text=Terracotta+Pot+Set+Hover',
                inStock: true,
                isFeatured: false,
                description: 'A set of terracotta pots for small plants',
                sku: 'FALLBACK005',
                price_small: 35.00,
                price_medium: 45.00,
                price_large: 55.00
            }
        ];
        
        this.allProducts = fallbackProducts;
    }
    
    getSizeFromProduct(product) {
        // Determine size based on product characteristics
        if (product.stock_quantity > 20) return 'Large';
        if (product.stock_quantity > 10) return 'Medium';
        return 'Small';
    }
    
    getBadgeType(product) {
        if (product.is_featured) return 'bestseller';
        if (product.sale_price && product.sale_price < product.price) return 'sale';
        if (!product.in_stock) return 'sold-out';
        return 'new';
    }
    
    getBadgeText(product) {
        if (product.is_featured) return 'Best Seller';
        if (product.sale_price && product.sale_price < product.price) return 'Sale';
        if (!product.in_stock) return 'Sold Out';
        return 'New';
    }
    
    getCategoryFromProduct(product) {
        // Extract category from categories array or use default
        if (product.categories && product.categories.length > 0) {
            let category = product.categories[0].toLowerCase().replace(/\s+/g, '-');
            
            // Handle specific category mappings
            if (category.includes('pots') || category.includes('planters')) {
                return 'pots';
            }
            if (category.includes('indoor')) {
                return 'indoor-plants';
            }
            if (category.includes('outdoor')) {
                return 'outdoor-plants';
            }
            if (category.includes('succulent')) {
                return 'succulents';
            }
            if (category.includes('tool')) {
                return 'tools';
            }
            
            return category;
        }
        return 'indoor-plants';
    }
    
    getValidImageUrl(imageUrl) {
        // If no image URL provided, use placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            return 'https://via.placeholder.com/300x300?text=Plant';
        }
        
        // If image URL is already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If image URL is relative, make it absolute
        if (imageUrl.startsWith('/')) {
            return window.location.origin + imageUrl;
        }
        
        // If image URL is just a filename, assume it's in images folder
        if (!imageUrl.includes('/')) {
            return window.location.origin + '/images/' + imageUrl;
        }
        
        // For any other case, try to construct a valid URL
        return window.location.origin + '/' + imageUrl;
    }
    
    getHoverImageUrl(primaryImageUrl, secondaryImageUrl) {
        // Priority 1: Use secondary image if available and different from primary
        if (secondaryImageUrl && secondaryImageUrl.trim() !== '' && secondaryImageUrl !== primaryImageUrl) {
            const validSecondaryImage = this.getValidImageUrl(secondaryImageUrl);
            console.log('✅ Using secondary image for hover:', validSecondaryImage);
            return validSecondaryImage;
        }
        
        // Priority 2: If no secondary image, use same as primary for hover effect
        const validPrimaryImage = this.getValidImageUrl(primaryImageUrl);
        console.log('ℹ️ No secondary image available, using same image for hover:', validPrimaryImage);
        return validPrimaryImage;
    }
    
    generateHoverImageFromPrimary(primaryImageUrl) {
        // Try different strategies to generate a hover image
        
        // Strategy 1: If it's a placeholder, use a different placeholder
        if (primaryImageUrl.includes('placeholder.com')) {
            return 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop';
        }
        
        // Strategy 2: If it's an Unsplash image, try to get a related one
        if (primaryImageUrl.includes('unsplash.com')) {
            // Use a different plant image from Unsplash
            return 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop';
        }
        
        // Strategy 3: If it's a local image, try to find a hover version
        if (primaryImageUrl.includes('/images/')) {
            // Try to find a hover version by adding _hover or _2 to the filename
            const baseUrl = primaryImageUrl.replace(/\.[^/.]+$/, '');
            const extension = primaryImageUrl.match(/\.[^/.]+$/)?.[0] || '.jpg';
            return baseUrl + '_hover' + extension;
        }
        
        // Strategy 4: If it's any other image, use a random plant image
        return this.getRandomHoverImage();
    }
    
    getRandomHoverImage() {
        // Array of different plant images for hover effect
        const hoverImages = [
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop'
        ];
        
        // Return a random hover image
        return hoverImages[Math.floor(Math.random() * hoverImages.length)];
    }

    bindEvents() {
        // Filter sidebar toggle
        const filterToggle = document.getElementById('filterToggle');
        const filterSidebar = document.getElementById('filterSidebar');
        const filterClose = document.getElementById('filterClose');
        const filterOverlay = document.getElementById('filterOverlay');
        
        if (filterToggle && filterSidebar) {
            filterToggle.addEventListener('click', () => {
                this.openFilterSidebar();
            });
        }

        if (filterClose && filterSidebar) {
            filterClose.addEventListener('click', () => {
                this.closeFilterSidebar();
            });
        }

        if (filterOverlay && filterSidebar) {
            filterOverlay.addEventListener('click', () => {
                this.closeFilterSidebar();
            });
        }

        // ESC key to close sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filterSidebar && filterSidebar.classList.contains('open')) {
                this.closeFilterSidebar();
            }
        });

        // Filter checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name) {
                this.handleFilterChange(e.target);
                // Auto-apply filters on change
                setTimeout(() => {
                    this.applyFilters();
                }, 100);
            }
        });

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Apply filters
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyFilters();
                this.closeFilterSidebar();
            });
        }

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }
    }

    openFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterSidebar) {
            // 保存当前滚动位置
            this.scrollPosition = window.pageYOffset;
            
            // 禁止页面滚动
            document.body.classList.add('no-scroll');
            document.body.style.top = `-${this.scrollPosition}px`;
            
            filterSidebar.classList.add('open');
            
            // 显示导航栏当打开过滤器时
            if (window.smartNavigation) {
                window.smartNavigation.forceShow();
            }
        }
    }

    closeFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterSidebar) {
            filterSidebar.classList.remove('open');
            
            // 恢复页面滚动
            document.body.classList.remove('no-scroll');
            document.body.style.top = '';
            
            // 恢复滚动位置
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
        }
    }

    setupFilters() {
        // Initialize filter states
        this.updateFilterDisplay();
        // Don't apply filters initially, just display all products
        this.displayAllFilteredProducts();
        this.updateProductCount();
    }

    handleFilterChange(checkbox) {
        const { name, value, checked } = checkbox;
        
        if (value === 'all') {
            // If "All" is checked, uncheck others and set to all
            if (checked) {
                this.filters[name] = ['all'];
                // Uncheck other checkboxes in this group
                document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
                    if (cb.value !== 'all') {
                        cb.checked = false;
                    }
                });
            }
        } else {
            // If specific option is checked, uncheck "All"
            if (checked) {
                // Remove 'all' from filters
                this.filters[name] = this.filters[name].filter(f => f !== 'all');
                // Add this filter
                if (!this.filters[name].includes(value)) {
                    this.filters[name].push(value);
                }
                // Uncheck "All"
                const allCheckbox = document.querySelector(`input[name="${name}"][value="all"]`);
                if (allCheckbox) allCheckbox.checked = false;
            } else {
                // Remove this filter
                this.filters[name] = this.filters[name].filter(f => f !== value);
                // If no filters left, set to all
                if (this.filters[name].length === 0) {
                    this.filters[name] = ['all'];
                    const allCheckbox = document.querySelector(`input[name="${name}"][value="all"]`);
                    if (allCheckbox) allCheckbox.checked = true;
                }
            }
        }
    }

    applyFilters() {
        console.log('🔍 Applying filters:', this.filters);
        console.log('🔍 Total products to filter:', this.allProducts.length);
        
        this.filteredProducts = this.allProducts.filter(product => {
            // Category filter - check both category name and category ID
            if (!this.filters.category.includes('all')) {
                const categoryMatch = this.filters.category.some(categoryFilter => {
                    // Check category name
                    if (product.category === categoryFilter) {
                        console.log(`✅ Category name match: ${product.name} -> ${categoryFilter}`);
                        return true;
                    }
                    
                    // Check category ID for specific mappings
                    if (product.category_ids && Array.isArray(product.category_ids)) {
                        console.log(`🔍 Checking category IDs for ${product.name}:`, product.category_ids);
                        
                        switch (categoryFilter) {
                            case 'succulents':
                                const isSucculent = product.category_ids.includes(22);
                                if (isSucculent) {
                                    console.log(`✅ Succulent ID match: ${product.name} -> category 22`);
                                }
                                return isSucculent;
                            case 'pots':
                                return product.category_ids.includes(18);
                            case 'grow-lights':
                                return product.category_ids.includes(16);
                            case 'artificial-plants':
                                return product.category_ids.includes(31);
                            case 'new-arrivals':
                                return product.category_ids.includes(19);
                            default:
                return false;
                        }
                    }
                    
                    return false;
                });
                
                if (!categoryMatch) {
                    return false;
                }
            }

            // Price filter
            if (!this.filters.price.includes('all')) {
                const price = parseFloat(product.currentPrice);
                const priceMatch = this.filters.price.some(priceRange => {
                    switch (priceRange) {
                        case 'under-25': return price < 25;
                        case '25-50': return price >= 25 && price <= 50;
                        case '50-100': return price >= 50 && price <= 100;
                        case 'over-100': return price > 100;
                        default: return true;
                    }
                });
                if (!priceMatch) return false;
            }

            // Size filter
            if (!this.filters.size.includes('all')) {
                const sizeMatch = this.filters.size.some(sizeFilter => {
                    return product.size.toLowerCase().includes(sizeFilter.toLowerCase());
                });
                if (!sizeMatch) return false;
            }

            return true;
        });

        this.sortProducts();
        this.resetPagination();
        this.updateProductCount();
        
        // Display all filtered products immediately (no pagination)
        this.displayAllFilteredProducts();
    }

    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            switch (this.sortBy) {
                case 'newest':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'price-low':
                    return parseFloat(a.currentPrice) - parseFloat(b.currentPrice);
                case 'price-high':
                    return parseFloat(b.currentPrice) - parseFloat(a.currentPrice);
                case 'popular':
                    // Sort by badge type (bestseller first)
                    if (a.badgeType === 'bestseller' && b.badgeType !== 'bestseller') return -1;
                    if (b.badgeType === 'bestseller' && a.badgeType !== 'bestseller') return 1;
                    return 0;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }

    resetPagination() {
        this.currentPage = 1;
        this.displayedProducts = [];
    }

    loadMoreProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const newProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        this.displayedProducts = [...this.displayedProducts, ...newProducts];
        this.currentPage++;
        
        this.displayProducts();
        this.updateLoadMoreButton();
    }

    displayProducts() {
        const grid = document.getElementById('allProductsGrid');
        if (!grid) {
            console.error('❌ allProductsGrid not found');
            return;
        }

        console.log(`🔄 Displaying ${this.displayedProducts.length} products`);

        if (this.displayedProducts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                </div>
            `;
            return;
        }

        // Generate product cards
        const productsHTML = this.displayedProducts.map(product => 
            window.productCardGenerator.createProductCard(product)
        ).join('');
        
        grid.innerHTML = productsHTML;
        
        // Force visibility for New Arrivals page
        const productCards = grid.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            // Add force-visible class to override CSS animation
            card.classList.add('force-visible');
            
            // Also set inline styles as backup
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.animation = 'none';
        });
        
        console.log(`✅ Displayed ${productCards.length} product cards`);
        this.updateLoadMoreButton();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const totalProducts = this.filteredProducts.length;
        const displayedCount = this.displayedProducts.length;
        
        if (displayedCount >= totalProducts) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'flex';
            const remaining = totalProducts - displayedCount;
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                Load More Products (${remaining} remaining)
            `;
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            const total = this.filteredProducts.length;
            if (total === this.allProducts.length) {
                countElement.textContent = `Showing all ${total} products`;
            } else {
                countElement.textContent = `Showing ${total} of ${this.allProducts.length} products`;
            }
        }
    }

    displayAllFilteredProducts() {
        const grid = document.getElementById('allProductsGrid');
        if (!grid) {
            console.error('❌ allProductsGrid not found');
            return;
        }

        console.log(`🔄 Displaying all ${this.filteredProducts.length} filtered products`);

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                </div>
            `;
            return;
        }

        // Generate product cards for all filtered products
        const productsHTML = this.filteredProducts.map(product => 
            window.productCardGenerator.createProductCard(product)
        ).join('');
        
        grid.innerHTML = productsHTML;
        
        // Force visibility for New Arrivals page
        const productCards = grid.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            // Add force-visible class to override CSS animation
            card.classList.add('force-visible');
            
            // Also set inline styles as backup
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.animation = 'none';
        });
        
        console.log(`✅ Displayed all ${productCards.length} filtered product cards`);
    }

    clearAllFilters() {
        // Reset filters
        this.filters = {
            category: ['all'],
            price: ['all'],
            size: ['all']
        };
        
        // Reset checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.value === 'all';
        });
        
        // Reset sort
        this.sortBy = 'newest';
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'newest';
        
        this.applyFilters();
    }

    updateFilterDisplay() {
        // Update checkboxes based on current filters
        Object.keys(this.filters).forEach(filterType => {
            const values = this.filters[filterType];
            document.querySelectorAll(`input[name="${filterType}"]`).forEach(checkbox => {
                checkbox.checked = values.includes(checkbox.value);
            });
        });
    }

    debugFilterElements() {
        console.log('🔍 Debugging filter elements...');
        
        // Check filter sidebar
        const filterSidebar = document.getElementById('filterSidebar');
        console.log('Filter sidebar:', filterSidebar ? 'Found' : 'Not found');
        
        // Check filter toggle button
        const filterToggle = document.getElementById('filterToggle');
        console.log('Filter toggle button:', filterToggle ? 'Found' : 'Not found');
        
        // Check filter checkboxes
        const filterTypes = ['category', 'price', 'size'];
        filterTypes.forEach(filterType => {
            const checkboxes = document.querySelectorAll(`input[name="${filterType}"]`);
            console.log(`${filterType} checkboxes: ${checkboxes.length} found`);
        });
        
        // Check if filter sidebar is visible
        if (filterSidebar) {
            const isVisible = filterSidebar.offsetWidth > 0 || filterSidebar.offsetHeight > 0;
            console.log('Filter sidebar visible:', isVisible);
            console.log('Filter sidebar classes:', filterSidebar.className);
        }
        
        // Test filter toggle (without actually opening)
        if (filterToggle) {
            console.log('Filter toggle button ready for use');
        }
    }
}

// Initialize New Arrivals page functionality
function initializeNewArrivalsPage() {
    console.log('🔄 initializeNewArrivalsPage called');
    
    // Only initialize if we're on the new arrivals page and not already initialized
    if (document.getElementById('allProductsGrid') && !window.newArrivalsPage) {
        console.log('🔄 Creating NewArrivalsPage instance...');
        
        try {
        window.newArrivalsPage = new NewArrivalsPage();
            console.log('✅ NewArrivalsPage created successfully');
        
        // Load initial products
        setTimeout(() => {
                if (window.newArrivalsPage) {
            window.newArrivalsPage.loadMoreProducts();
                    console.log('✅ Initial products loaded via initializeNewArrivalsPage');
                }
        }, 500);
        } catch (error) {
            console.error('❌ Error in initializeNewArrivalsPage:', error);
        }
    } else if (window.newArrivalsPage) {
        console.log('ℹ️ NewArrivalsPage already initialized');
    } else {
        console.log('ℹ️ Not on New Arrivals page or allProductsGrid not found');
    }
}

// ===== 示例使用方法 =====
// 1. 从数据库获取数据后使用：
/*
const dbProducts = [
    { id: 1, name: "Monstera Deliciosa", size: "Large", currentPrice: "159.00", originalPrice: "178.00", badgeType: "bestseller", badgeText: "Best Seller" },
    { id: 2, name: "Snake Plant", size: "Medium", currentPrice: "89.00", originalPrice: "108.00", badgeType: "sale", badgeText: "Sale" }
];

// 生成产品网格
productCardGenerator.generateProductGrid('bundleGrid', dbProducts);

// 或者逐个添加
dbProducts.forEach(product => {
    productCardGenerator.addProductToGrid('bundleGrid', product);
});
*/

// 2. 动态添加新产品：
/*
const newProduct = productCardGenerator.createProductFromData({
    name: "New Plant",
    size: "Small",
    currentPrice: "49.00",
    badgeType: "new",
    badgeText: "New"
});

productCardGenerator.addProductToGrid('bundleGrid', newProduct);
*/

// ===== 导航组件加载 =====
async function loadNavigation() {
    try {
        const response = await fetch('navigation.html');
        const navigationHTML = await response.text();
        
        // 将navigation插入到body的开头
        document.body.insertAdjacentHTML('afterbegin', navigationHTML);
        
        // 添加移动端overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-sidebar-overlay';
        document.body.appendChild(overlay);
        
        // 导航加载完成后初始化智能导航
        if (!window.smartNavigation) {
            window.smartNavigation = new SmartNavigation();
            
            // Navigation initialized successfully
        }
        
    } catch (error) {
        console.error('Failed to load navigation:', error);
    }
}

// Initialize cart after navigation is loaded
function initializeCartAfterNavigation() {
    // Wait for navigation to load, then initialize cart
    const checkForNavigation = () => {
        const cartBtn = document.querySelector('.cart-btn');
        const cartSidebar = document.getElementById('cartSidebar');
        
        if (cartBtn && cartSidebar) {
            console.log('✅ Navigation and cart sidebar loaded, initializing cart...');
            if (!window.cart) {
                window.cart = new ShoppingCart();
                // Re-check user registration after cart is fully initialized
                setTimeout(() => {
                    window.cart.checkUserRegistration();
                }, 200);
            }
        } else {
            // If navigation not loaded yet, try again in 100ms
            setTimeout(checkForNavigation, 100);
        }
    };
    
    // Start checking after a short delay
    setTimeout(checkForNavigation, 100);
}

// Global logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('authToken');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('phone');
        localStorage.removeItem('dateOfBirth');
        localStorage.removeItem('gender');
        localStorage.removeItem('bloomspaceUserRegistered');
        localStorage.removeItem('bloomspaceUserEmail');
        localStorage.removeItem('bloomspaceUserData');
        
        // Clear cart data
        localStorage.removeItem('cart');
        
        // Show logout message
        alert('You have been logged out successfully!');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Global function to navigate to product detail
function navigateToProductDetail(productId) {
    // 存储选中的产品ID到sessionStorage
    sessionStorage.setItem('selectedProductId', productId);
    
    // 跳转到产品详情页面
    window.location.href = 'product-detail.html';
}




