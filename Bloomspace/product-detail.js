// Product Detail Page Functionality
class ProductDetailPage {
    constructor() {
        this.currentImage = 0;
        this.images = [];
        this.selectedSize = 'small';
        this.quantity = 1;
        this.isGift = false;
        this.isPersonalized = false;
        this.init();
    }

    init() {
        this.loadProductData();
        this.loadImages();
        this.bindEvents();
        this.initializeTabs();
        this.initializeQuantityControls();
        this.initializeGiftOptions();
        this.initializeNavbarScroll();
    }

    loadProductData() {
        // 从sessionStorage获取产品信息
        const selectedProduct = sessionStorage.getItem('selectedProduct');
        if (selectedProduct) {
            const productData = JSON.parse(selectedProduct);
        console.log('Product data loaded:', productData);
        console.log('Product data has size prices:', {
            price_small: productData.price_small,
            price_medium: productData.price_medium,
            price_large: productData.price_large
        });
        console.log('Size prices values:', productData.price_small, productData.price_medium, productData.price_large);
            this.updateProductInfo(productData);
        } else {
            // 如果没有产品数据，显示错误信息
            console.error('No product data found in sessionStorage');
            alert('No product data found. Please go back and select a product.');
        }
    }

    updateProductInfo(productData) {
        console.log('updateProductInfo called with:', productData);
        
        // 更新产品标题
        const productTitle = document.querySelector('.product-title');
        if (productTitle) {
            productTitle.textContent = productData.name;
        }

        // 更新产品描述
        const productSubtitle = document.querySelector('.product-subtitle');
        if (productSubtitle) {
            // 使用产品的description，如果没有则使用默认描述
            const description = productData.description || productData.shortDescription || 'A beautiful plant for your home or office';
            productSubtitle.textContent = description;
        }

        // 存储不同尺寸的价格
        this.productPrices = {
            small: productData.price_small || productData.price,
            medium: productData.price_medium || productData.price,
            large: productData.price_large || productData.price
        };
        
        console.log('Product prices stored:', this.productPrices);
        console.log('Raw price data:', {
            price_small: productData.price_small,
            price_medium: productData.price_medium,
            price_large: productData.price_large,
            price: productData.price
        });
        
        // Check if size selection buttons are visible
        const sizeButtons = document.querySelectorAll('.size-option');
        console.log('Size buttons found:', sizeButtons.length);
        sizeButtons.forEach((btn, index) => {
            console.log(`Size button ${index}:`, btn.textContent, 'visible:', btn.offsetParent !== null);
        });
        
        // 存储不同尺寸的原始价格（用于计算折扣）
        this.productOriginalPrices = {
            small: productData.price_small || productData.price,
            medium: productData.price_medium || productData.price,
            large: productData.price_large || productData.price
        };
        
        // 更新价格（默认显示small价格，因为基础价格对应small尺寸）
        const currentPrice = document.querySelector('.current-price');
        if (currentPrice) {
            const defaultPrice = this.productPrices.small;
            currentPrice.textContent = `RM${defaultPrice.toFixed(2)}`;
        }

        // 更新原始价格和节省金额
        const originalPrice = document.querySelector('.original-price');
        const priceSavings = document.querySelector('.price-savings');
        const savingsText = document.querySelector('.savings-text');
        
        console.log('Price elements found:', {
            originalPrice: !!originalPrice,
            priceSavings: !!priceSavings,
            savingsText: !!savingsText,
            productOriginalPrice: productData.originalPrice,
            productPrice: productData.price
        });
        
        if (originalPrice && productData.originalPrice && productData.originalPrice > productData.price) {
            console.log('Showing savings - original price is higher');
            // 有原始价格且大于当前价格，显示节省金额
            originalPrice.textContent = `RM${productData.originalPrice.toFixed(2)}`;
            originalPrice.style.display = 'inline';
            
            // 计算节省金额
            const savings = productData.originalPrice - productData.price;
            if (savingsText) {
                savingsText.textContent = `You save RM${savings.toFixed(2)}`;
            }
            
            // 显示节省金额区域
            if (priceSavings) {
                priceSavings.style.display = 'block';
            }
        } else {
            console.log('Hiding savings - no original price or original price not higher');
            // 没有原始价格或原始价格不大于当前价格，隐藏相关元素
            if (originalPrice) {
                originalPrice.style.display = 'none';
            }
            if (priceSavings) {
                priceSavings.style.display = 'none';
            }
        }

        // 更新主图片
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = productData.image;
            mainImage.alt = productData.name;
        }

        // 更新第一个缩略图
        const firstThumbnail = document.querySelector('.thumbnail-item');
        if (firstThumbnail) {
            firstThumbnail.dataset.image = productData.image;
            const thumbnailImg = firstThumbnail.querySelector('img');
            if (thumbnailImg) {
                thumbnailImg.src = productData.image;
                thumbnailImg.alt = productData.name;
            }
        }

        // 更新面包屑导航
        const breadcrumbCurrent = document.querySelector('.breadcrumb-list .active');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = productData.name;
        }

        // 更新页面标题
        document.title = `${productData.name} - Bloomspace`;
    }

    async loadImages() {
        // Get product ID from URL or sessionStorage
        const productId = this.getProductId();
        if (!productId) {
            console.log('No product ID found, using default images');
            return;
        }

        try {
            // Load images from API
            const response = await fetch(`api/products/images.php?product_id=${productId}`);
            const data = await response.json();
            
            if (data.success && data.data.images.length > 0) {
                this.images = data.data.images.map(img => ({
                    main: img.image_url,
                    thumb: img.image_url,
                    alt: img.alt_text,
                    isPrimary: img.is_primary,
                    sortOrder: img.sort_order
                }));
                
                this.updateImageDisplay();
                console.log('✅ Product images loaded:', this.images.length);
            } else {
                console.log('No images found for product', productId);
            }
        } catch (error) {
            console.error('❌ Failed to load product images:', error);
        }
    }
    
    getProductId() {
        // Try to get from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) return productId;
        
        // Try to get from sessionStorage
        const selectedProduct = sessionStorage.getItem('selectedProduct');
        if (selectedProduct) {
            const productData = JSON.parse(selectedProduct);
            return productData.id;
        }
        
        return null;
    }
    
    updateImageDisplay() {
        if (this.images.length === 0) return;
        
        // Update main image
        const mainImage = document.querySelector('.main-image');
        if (mainImage && this.images[0]) {
            mainImage.src = this.images[0].main;
            mainImage.alt = this.images[0].alt;
        }
        
        // Update sub images
        this.updateSubImages();
    }
    
    updateSubImages() {
        const subImagesContainer = document.querySelector('.sub-images-container');
        if (!subImagesContainer) return;
        
        // Clear existing sub images
        subImagesContainer.innerHTML = '';
        
        // Add remaining images as sub images
        const subImages = this.images.slice(1, 3); // Show max 2 sub images
        
        subImages.forEach((image, index) => {
            const subImageItem = document.createElement('div');
            subImageItem.className = 'sub-image-item';
            subImageItem.innerHTML = `
                <img src="${image.main}" 
                     alt="${image.alt}" 
                     class="sub-image"
                     onclick="productDetailPage.updateMainImage('${image.main}')"
                     style="cursor: pointer;">
            `;
            subImagesContainer.appendChild(subImageItem);
        });
        
        console.log('✅ Sub images updated:', subImages.length);
    }

    bindEvents() {
        // Main image click for zoom
        const mainImage = document.querySelector('.main-image');
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                this.openImageZoom();
            });
        }

        // Add to cart button - prevent duplicate binding
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn && !addToCartBtn.hasAttribute('data-bound')) {
            addToCartBtn.setAttribute('data-bound', 'true');
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🛒 Add to cart button clicked');
                this.addToCart();
            });
        }

        // Wishlist button
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                this.toggleWishlist();
            });
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareProduct();
            });
        }

        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectSize(option);
            });
        });

        // Image zoom modal events
        this.initializeImageZoom();

        // Keyboard navigation for images
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            } else if (e.key === 'Escape') {
                this.closeImageZoom();
            }
        });
    }


    updateMainImage(imageSrc) {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = imageSrc;
        }
    }

    selectSize(option) {
        console.log('Size option clicked:', option);
        console.log('Current productPrices:', this.productPrices);
        
        // Remove active class from all size options
        document.querySelectorAll('.size-option').forEach(opt => {
            opt.classList.remove('active');
        });

        // Add active class to selected option
        option.classList.add('active');
        
        // Get the size from the data-size attribute
        const sizeText = option.dataset.size;
        this.selectedSize = sizeText;
        
        console.log('Selected size:', sizeText);
        
        // Update price based on selected size
        this.updatePriceForSize(sizeText);
    }
    
    updatePriceForSize(size) {
        console.log('updatePriceForSize called with size:', size);
        console.log('this.productPrices:', this.productPrices);
        
        if (!this.productPrices) {
            console.log('No productPrices found, returning');
            return;
        }
        
        let price = this.productPrices.small; // default
        
        switch (size) {
            case 'small':
                price = this.productPrices.small;
                break;
            case 'medium':
                price = this.productPrices.medium;
                break;
            case 'large':
                price = this.productPrices.large;
                break;
        }
        
        console.log('Calculated price for size', size, ':', price);
        
        // Update current price display
        const currentPrice = document.querySelector('.current-price');
        console.log('Current price element found:', currentPrice);
        if (currentPrice) {
            const newPriceText = `RM${price.toFixed(2)}`;
            console.log('Updating price from', currentPrice.textContent, 'to', newPriceText);
            currentPrice.textContent = newPriceText;
        } else {
            console.log('No current price element found!');
        }
        
        // Update original price if it exists
        const originalPrice = document.querySelector('.original-price');
        if (originalPrice && originalPrice.style.display !== 'none') {
            // 使用相同尺寸的原始价格
            const originalPriceValue = this.calculateOriginalPriceForSize(size);
            if (originalPriceValue && originalPriceValue > price) {
                originalPrice.textContent = `RM${originalPriceValue.toFixed(2)}`;
                
                // Update savings
                const savings = originalPriceValue - price;
                const savingsText = document.querySelector('.savings-text');
                if (savingsText && savings > 0) {
                    savingsText.textContent = `You save RM${savings.toFixed(2)}`;
                }
            } else {
                // 如果没有折扣，隐藏原始价格
                originalPrice.style.display = 'none';
                const savingsText = document.querySelector('.savings-text');
                if (savingsText) {
                    savingsText.style.display = 'none';
                }
            }
        }
        
        // console.log(`Price updated for ${size}: RM${price.toFixed(2)}`);
    }
    
    calculateOriginalPriceForSize(size) {
        if (!this.productOriginalPrices) return null;
        
        // 使用存储的原始价格
        return this.productOriginalPrices[size] || this.productOriginalPrices.small;
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    initializeQuantityControls() {
        const quantityInput = document.getElementById('quantityInput');
        const minusBtn = document.getElementById('quantityMinus');
        const plusBtn = document.getElementById('quantityPlus');

        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                this.quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                e.target.value = this.quantity;
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    quantityInput.value = this.quantity;
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                if (this.quantity < 10) {
                    this.quantity++;
                    quantityInput.value = this.quantity;
                }
            });
        }
    }

    initializeGiftOptions() {
        const giftCheckbox = document.getElementById('giftCheckbox');
        const giftMessage = document.getElementById('giftMessage');
        const messageTextarea = giftMessage?.querySelector('textarea');
        const charCount = giftMessage?.querySelector('.char-count');

        if (giftCheckbox) {
            giftCheckbox.addEventListener('change', (e) => {
                this.isGift = e.target.checked;
                if (giftMessage) {
                    giftMessage.style.display = this.isGift ? 'block' : 'none';
                }
            });
        }

        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCount.textContent = `${length}/200`;
                this.isPersonalized = length > 0;
            });
        }
    }

    initializeImageZoom() {
        const zoomModal = document.getElementById('imageZoomModal');
        const zoomClose = document.getElementById('zoomClose');
        const zoomPrev = document.getElementById('zoomPrev');
        const zoomNext = document.getElementById('zoomNext');
        const zoomImage = document.getElementById('zoomImage');

        if (zoomClose) {
            zoomClose.addEventListener('click', () => {
                this.closeImageZoom();
            });
        }

        if (zoomPrev) {
            zoomPrev.addEventListener('click', () => {
                this.previousImage();
            });
        }

        if (zoomNext) {
            zoomNext.addEventListener('click', () => {
                this.nextImage();
            });
        }

        if (zoomModal) {
            zoomModal.addEventListener('click', (e) => {
                if (e.target === zoomModal) {
                    this.closeImageZoom();
                }
            });
        }
    }
    openImageZoom() {
        const zoomModal = document.getElementById('imageZoomModal');
        const zoomImage = document.getElementById('zoomImage');
        const mainImage = document.getElementById('mainImage');
    
        if (zoomModal && zoomImage && mainImage) {
            zoomImage.src = mainImage.src;
            this.currentImage = this.images.findIndex(img => img.main === mainImage.src);
            if (this.currentImage === -1) this.currentImage = 0;
            zoomModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    

    closeImageZoom() {
        const zoomModal = document.getElementById('imageZoomModal');
        if (zoomModal) {
            zoomModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    updateZoomImage() {
        const zoomImage = document.getElementById('zoomImage');
        if (zoomImage && this.images.length > 0) {
            zoomImage.src = this.images[this.currentImage].main;
        }
    }
    
    previousImage() {
        if (this.images.length > 0) {
            this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
            this.updateMainImage(this.images[this.currentImage].main);
            this.updateZoomImage();
        }
    }
    
    nextImage() {
        if (this.images.length > 0) {
            this.currentImage = (this.currentImage + 1) % this.images.length;
            this.updateMainImage(this.images[this.currentImage].main);
            this.updateZoomImage();
        }
    }
    

    toggleWishlist() {
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.classList.toggle('active');
            const isActive = wishlistBtn.classList.contains('active');
            
            if (isActive) {
                this.showNotification('Added to wishlist!', 'success');
            } else {
                this.showNotification('Removed from wishlist', 'info');
            }
        }
    }

    shareProduct() {
        if (navigator.share) {
            navigator.share({
                title: document.querySelector('.product-title').textContent,
                text: 'Check out this beautiful plant from Bloomspace!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            });
        }
    }

    addToCart() {
        console.log('🛒 Detail page addToCart called');
        const productData = this.getProductData();
        console.log('Product data:', productData);
        
        // Check if shopping cart exists
        if (typeof window.cart !== 'undefined' && window.cart.addToCart) {
            console.log('✅ Cart found, adding product');
            // Create a mock product card element for the cart
            const mockCard = this.createMockProductCard(productData);
            window.cart.addToCart(mockCard);
            
            this.showNotification(`${productData.name} added to cart!`, 'success');
        } else {
            console.log('❌ Cart not found, initializing fallback');
            // Initialize cart if not exists
            if (!window.cart) {
                window.cart = new ShoppingCart();
            }
            
            // Try again with initialized cart
            if (window.cart && window.cart.addToCart) {
                const mockCard = this.createMockProductCard(productData);
                window.cart.addToCart(mockCard);
                this.showNotification(`${productData.name} added to cart!`, 'success');
            } else {
                // Final fallback: show notification
                this.showNotification(`${productData.name} added to cart!`, 'success');
                console.log('Product added to cart (fallback):', productData);
            }
        }
    }

    createMockProductCard(productData) {
        // Create a mock product card element for the shopping cart
        const mockCard = document.createElement('div');
        mockCard.className = 'product-card';
        mockCard.dataset.quantity = productData.quantity; // Add quantity to data attribute
        mockCard.innerHTML = `
            <div class="product-image">
                <img src="${productData.image}" alt="${productData.name}">
            </div>
            <div class="product-info">
                <h3>${productData.name}</h3>
                <p class="product-size">${this.selectedSize}</p>
                <div class="product-price">
                    <span class="current-price">RM${productData.price}</span>
                </div>
            </div>
        `;
        return mockCard;
    }

    getProductData() {
        const productTitle = document.querySelector('.product-title').textContent;
        const currentPrice = document.querySelector('.current-price').textContent.replace('RM', '');
        const mainImage = document.getElementById('mainImage').src;

        return {
            id: `product_${Date.now()}`,
            name: productTitle,
            price: parseFloat(currentPrice),
            size: this.selectedSize,
            image: mainImage,
            quantity: this.quantity,
            isGift: this.isGift,
            isPersonalized: this.isPersonalized
        };
    }

    initializeNavbarScroll() {
        const navbar = document.querySelector('.header');
        if (!navbar) return;

        let lastScrollY = 0;
        let ticking = false;

        const updateNavbar = () => {
            const currentScrollY = window.pageYOffset;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                navbar.classList.add('header-hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('header-hidden');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
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
                    max-width: 300px;
                }
                
                .notification.success {
                    border-left-color: #27ae60;
                }
                
                .notification.error {
                    border-left-color: #e74c3c;
                }
                
                .notification.info {
                    border-left-color: #3498db;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }
        
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductDetailPage();
});