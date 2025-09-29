/**
 * Universal API Loader
 * Replace hardcoded product data with API-loaded data across all pages
 */

class UniversalAPILoader {
    constructor() {
        this.api = null;
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        // Wait for API integration to load
        if (typeof window.BloomspaceAPI !== 'undefined') {
            this.api = new window.BloomspaceAPI();
            this.isInitialized = true;
            console.log('✅ Universal API Loader initialized');
            await this.loadAllProducts();
        } else {
            console.log('⏳ Waiting for API to load...');
            // Retry after a short delay
            setTimeout(() => this.init(), 1000);
        }
    }
    
    async loadProducts() {
        if (!this.isInitialized) {
            console.log('❌ API not initialized yet');
            return [];
        }
        
        // If products already loaded, return them
        if (this.allProducts) {
            return this.allProducts;
        }
        
        return await this.loadAllProducts();
    }
    
    async loadAllProducts() {
        if (!this.isInitialized) {
            console.log('❌ API not initialized yet');
            return [];
        }
        
        try {
            console.log('🔄 Loading products from API...');
            
            // Load different types of products based on page
            const currentPage = this.getCurrentPageType();
            console.log('Current page type:', currentPage);
            
            const [bundleProducts, bestProducts, floralProducts, artificialProducts, pageSpecificProducts] = await Promise.all([
                this.api.products.getProducts({ category: 'bundle-deals', limit: 8 }),
                this.api.products.getProducts({ category: 'best-sellers', limit: 8 }),
                this.api.products.getProducts({ category: 'floral-plants', limit: 8 }),
                this.api.products.getProducts({ category: 'artificial-plants', limit: 8 }),
                this.loadPageSpecificProducts(currentPage)
            ]);
            
            console.log('✅ Products loaded from API:', {
                bundle: bundleProducts.data.products.length,
                best: bestProducts.data.products.length,
                floral: floralProducts.data.products.length,
                artificial: artificialProducts.data.products.length,
                pageSpecific: pageSpecificProducts.data.products.length
            });
            
            // Convert API products to display format
            const bundleDisplayProducts = this.convertAPIProductsToDisplayFormat(bundleProducts.data.products);
            const bestDisplayProducts = this.convertAPIProductsToDisplayFormat(bestProducts.data.products);
            const floralDisplayProducts = this.convertAPIProductsToDisplayFormat(floralProducts.data.products);
            const artificialDisplayProducts = this.convertAPIProductsToDisplayFormat(artificialProducts.data.products);
            const pageDisplayProducts = this.convertAPIProductsToDisplayFormat(pageSpecificProducts.data.products);
            
            // Combine all products
            this.allProducts = [
                ...bundleDisplayProducts,
                ...bestDisplayProducts,
                ...floralDisplayProducts,
                ...artificialDisplayProducts,
                ...pageDisplayProducts
            ];
            
            // Load products into different sections
            this.loadProductsIntoSections(bundleDisplayProducts, bestDisplayProducts, floralDisplayProducts, artificialDisplayProducts, pageDisplayProducts);
            
            // Load additional images for products with multiple images
            this.loadAdditionalImages(bundleDisplayProducts, bestDisplayProducts, floralDisplayProducts, artificialDisplayProducts, pageDisplayProducts);
            
            return this.allProducts;
            
        } catch (error) {
            console.error('❌ Failed to load products from API:', error);
            // Fallback to hardcoded products
            this.loadFallbackProducts();
            return this.allProducts || [];
        }
    }
    
    getCurrentPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        const pageTypes = {
            'index': 'homepage',
            'plant-gifts': 'plant-gifts',
            'care-tools': 'care-tools',
            'artificial-plant': 'artificial-plants',
            'new-arrivals': 'new-arrivals',
            'growlight': 'grow-lights',
            'planters': 'planters',
            'events': 'events'
        };
        
        return pageTypes[filename] || 'homepage';
    }
    
    async loadPageSpecificProducts(pageType) {
        const categoryMap = {
            'plant-gifts': 'plant-gift-collections',
            'care-tools': 'care-tools',
            'artificial-plants': 'artificial-plants',
            'new-arrivals': 'new-arrivals',
            'grow-lights': 'grow-lights',
            'planters': 'planters',
            'events': 'gift-plants'
        };
        
        const category = categoryMap[pageType] || 'indoor-plants';
        return await this.api.products.getProducts({ category: category, limit: 12 });
    }
    
    convertAPIProductsToDisplayFormat(apiProducts) {
        return apiProducts.map(product => {
            const displayProduct = {
                id: product.id,
                name: product.name,
                size: this.getSizeFromProduct(product),
                currentPrice: product.formatted_price.replace('RM ', ''),
                originalPrice: product.formatted_sale_price ? product.formatted_sale_price.replace('RM ', '') : null,
                badgeType: this.getBadgeType(product),
                badgeText: this.getBadgeText(product),
                image: product.primary_image || 'https://via.placeholder.com/300x300?text=Plant',
                hoverImage: product.primary_image || 'https://via.placeholder.com/300x300?text=Plant', // Will be updated with second image
                slug: product.slug,
                inStock: product.in_stock,
                isFeatured: product.is_featured,
                description: product.description,
                sku: product.sku,
                price_small: product.price_small,
                price_medium: product.price_medium,
                price_large: product.price_large
            };
            
            console.log('Converting product:', product.name, 'Size prices:', {
                price_small: product.price_small,
                price_medium: product.price_medium,
                price_large: product.price_large
            });
            console.log('Raw API product data for', product.name, ':', {
                id: product.id,
                price_small: product.price_small,
                price_medium: product.price_medium,
                price_large: product.price_large,
                price: product.price
            });
            
            return displayProduct;
        });
    }
    
    getSizeFromProduct(product) {
        // Determine size based on product characteristics
        if (product.stock_quantity > 20) return 'Large';
        if (product.stock_quantity > 10) return 'Medium';
        return 'Small';
    }
    
    getBadgeType(product) {
        if (product.is_featured) return 'bestseller';
        if (product.sale_price) return 'sale';
        if (product.air_purifying) return 'eco';
        return 'new';
    }
    
    getBadgeText(product) {
        if (product.is_featured) return 'Featured';
        if (product.sale_price) return 'Sale';
        if (product.air_purifying) return 'Air Purifying';
        return 'New';
    }
    
    loadProductsIntoSections(bundleProducts, bestProducts, floralProducts, artificialProducts, pageSpecificProducts) {
        // Wait for ProductCardGenerator to be available
        const waitForProductCardGenerator = () => {
            if (window.productCardGenerator) {
                // Homepage sections
                this.loadIntoGrid('bundleGrid', bundleProducts.slice(0, 4));
                this.loadIntoGrid('bundleGrid2', bundleProducts.slice(4, 8));
                this.loadIntoGrid('bestGrid', bestProducts.slice(0, 4));
                this.loadIntoGrid('bestGrid2', bestProducts.slice(4, 8));
                this.loadIntoGrid('floralGrid', floralProducts);
                this.loadIntoGrid('artificialGrid', artificialProducts);
                
                // Page-specific sections
                this.loadIntoGrid('plantGiftsGrid', pageSpecificProducts);
                this.loadIntoGrid('growLightsGrid', pageSpecificProducts);
                this.loadIntoGrid('careToolsGrid', pageSpecificProducts);
                this.loadIntoGrid('newArrivalsGrid', pageSpecificProducts);
                this.loadIntoGrid('artificialPlantsGrid', pageSpecificProducts);
                
                console.log('✅ Products loaded into all sections');
            } else {
                console.log('⏳ Waiting for ProductCardGenerator...');
                setTimeout(waitForProductCardGenerator, 100);
            }
        };
        
        waitForProductCardGenerator();
    }
    
    async loadAdditionalImages(bundleProducts, bestProducts, floralProducts, artificialProducts, pageSpecificProducts) {
        // Collect all unique product IDs
        const allProducts = [...bundleProducts, ...bestProducts, ...floralProducts, ...artificialProducts, ...pageSpecificProducts];
        const uniqueProductIds = [...new Set(allProducts.map(p => p.id))];
        
        console.log('🖼️ Loading additional images for products:', uniqueProductIds);
        
        // Load images for each product
        for (const productId of uniqueProductIds) {
            try {
                const response = await fetch(`api/products/images.php?product_id=${productId}`);
                const data = await response.json();
                
                if (data.success && data.data.images.length > 1) {
                    // Find the product in all arrays and update hover image
                    const secondImage = data.data.images.find(img => img.sort_order === 2);
                    if (secondImage) {
                        this.updateProductHoverImage(allProducts, productId, secondImage.image_url);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to load images for product ${productId}:`, error);
            }
        }
        
        console.log('✅ Additional images loaded');
    }
    
    updateProductHoverImage(products, productId, hoverImageUrl) {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.hoverImage = hoverImageUrl;
            console.log(`🖼️ Updated hover image for product ${productId}: ${hoverImageUrl}`);
            
            // Re-render the product card with updated image
            this.rerenderProductCard(productId, product);
        }
    }
    
    rerenderProductCard(productId, product) {
        // Find all product cards with this ID and update them
        const productCards = document.querySelectorAll(`[data-id="${productId}"]`);
        productCards.forEach(card => {
            if (window.productCardGenerator) {
                const newCardHTML = window.productCardGenerator.createProductCard(product);
                card.outerHTML = newCardHTML;
            }
        });
    }
    
    loadIntoGrid(gridId, products) {
        const container = document.getElementById(gridId);
        if (!container) return;
        
        console.log('Loading into grid:', gridId, 'ProductCardGenerator available:', !!window.productCardGenerator);
        
        if (window.productCardGenerator) {
            console.log('Using ProductCardGenerator for grid:', gridId);
            console.log('First product data for ProductCardGenerator:', products[0]);
            window.productCardGenerator.generateProductGrid(gridId, products);
            
            // Add our own click event listeners to ensure size prices work
            setTimeout(() => {
                this.addProductCardClickListeners(container);
            }, 100);
        } else {
            console.log('Using fallback method for grid:', gridId);
            console.log('First product data for fallback:', products[0]);
            // Fallback: generate HTML manually
            const productsHTML = products.map(product => this.createProductCardHTML(product)).join('');
            container.innerHTML = productsHTML;
            
            // Add click event listeners for product cards
            this.addProductCardClickListeners(container);
        }
    }
    
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
    
    handleProductCardClick(productCard) {
        console.log('UniversalAPILoader: Product card clicked:', productCard);
        console.log('UniversalAPILoader: Card dataset:', productCard.dataset);
        
        // Extract product data from the card
        const productImage = productCard.querySelector('.product-image img');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = productCard.querySelector('.current-price').textContent;
        const productSize = productCard.querySelector('.product-size')?.textContent || 'Small';
        const productBadge = productCard.querySelector('.product-badge')?.textContent || '';
        const productDescription = productCard.dataset.description || 'A beautiful plant for your home or office';
        
        // Extract size prices
        const priceSmall = parseFloat(productCard.dataset.priceSmall) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceMedium = parseFloat(productCard.dataset.priceMedium) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        const priceLarge = parseFloat(productCard.dataset.priceLarge) || parseFloat(productPrice.replace('RM', '').replace(',', ''));
        
        console.log('UniversalAPILoader: Extracted data:', {
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
    
    createProductCardHTML(product) {
        // Escape quotes in product name for onclick
        const escapedName = product.name.replace(/'/g, "\\'");
        
        // Escape quotes in description for onclick
        const escapedDescription = (product.description || 'A beautiful plant for your home or office').replace(/'/g, "\\'");
        
        return `
            <div class="product-card" data-id="${product.id}" data-description="${escapedDescription}" 
                 data-price-small="${product.price_small || product.price}" 
                 data-price-medium="${product.price_medium || product.price}" 
                 data-price-large="${product.price_large || product.price}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-badge ${product.badgeType}">${product.badgeText}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-size">${product.size}</p>
                    <div class="product-price">
                        <span class="current-price">RM ${product.currentPrice}</span>
                        ${product.originalPrice ? `<span class="original-price">RM ${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                </div>
            </div>
        `;
    }
    
    loadFallbackProducts() {
        console.log('🔄 Loading fallback products...');
        // This will be handled by the existing hardcoded data in script.js
    }
    
    // Method to refresh products (useful for search, filters, etc.)
    async refreshProducts(filters = {}) {
        if (!this.isInitialized) return;
        
        try {
            const response = await this.api.products.getProducts(filters);
            const products = this.convertAPIProductsToDisplayFormat(response.data.products);
            
            // Update all grids with new products
            const grids = ['bundleGrid', 'bundleGrid2', 'bestGrid', 'bestGrid2', 'floralGrid', 'artificialGrid'];
            grids.forEach(gridId => {
                this.loadIntoGrid(gridId, products);
            });
            
        } catch (error) {
            console.error('❌ Failed to refresh products:', error);
        }
    }
}

// Expose UniversalAPILoader to global scope
window.UniversalAPILoader = UniversalAPILoader;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Universal API Loader...');
    window.universalAPILoader = new UniversalAPILoader();
});

// Also initialize after a delay to ensure all scripts are loaded
setTimeout(() => {
    if (!window.universalAPILoader) {
        console.log('🔄 Retrying Universal API Loader initialization...');
        window.universalAPILoader = new UniversalAPILoader();
    }
}, 2000);
