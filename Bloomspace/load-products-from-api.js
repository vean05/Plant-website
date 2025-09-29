/**
 * Load Products from API
 * Replace hardcoded products with API-loaded products
 */

class APIProductLoader {
    constructor() {
        this.api = null;
        this.init();
    }
    
    async init() {
        // Wait for API integration to load
        if (typeof BloomspaceAPI !== 'undefined') {
            this.api = new BloomspaceAPI();
            console.log('✅ API loaded, ready to load products');
            await this.loadAllProducts();
        } else {
            console.log('⏳ Waiting for API to load...');
            // Retry after a short delay
            setTimeout(() => this.init(), 1000);
        }
    }
    
    async loadAllProducts() {
        try {
            console.log('🔄 Loading products from API...');
            
            // Load featured products for different sections
            const featuredProducts = await this.api.products.getProducts({
                featured: true,
                limit: 12
            });
            
            const allProducts = await this.api.products.getProducts({
                limit: 24
            });
            
            console.log('✅ Products loaded from API:', {
                featured: featuredProducts.data.products.length,
                total: allProducts.data.products.length
            });
            
            // Convert API products to display format
            const displayProducts = this.convertAPIProductsToDisplayFormat(allProducts.data.products);
            const featuredDisplayProducts = this.convertAPIProductsToDisplayFormat(featuredProducts.data.products);
            
            // Load products into different sections
            this.loadProductsIntoSections(displayProducts, featuredDisplayProducts);
            
        } catch (error) {
            console.error('❌ Failed to load products from API:', error);
            // Fallback to hardcoded products
            this.loadFallbackProducts();
        }
    }
    
    convertAPIProductsToDisplayFormat(apiProducts) {
        return apiProducts.map(product => ({
            id: product.id,
            name: product.name,
            size: 'Medium', // Default size
            currentPrice: product.formatted_price.replace('RM ', ''),
            originalPrice: product.formatted_sale_price ? product.formatted_sale_price.replace('RM ', '') : null,
            badgeType: this.getBadgeType(product),
            badgeText: this.getBadgeText(product),
            image: product.primary_image || 'https://via.placeholder.com/300x300?text=Plant',
            slug: product.slug,
            inStock: product.in_stock,
            isFeatured: product.is_featured
        }));
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
    
    loadProductsIntoSections(allProducts, featuredProducts) {
        // Split products for different sections
        const bundleProducts = allProducts.slice(0, 4);
        const bundleProducts2 = allProducts.slice(4, 8);
        const bestProducts = featuredProducts.slice(0, 4);
        const bestProducts2 = featuredProducts.slice(4, 8);
        const floralProducts = allProducts.filter(p => p.badgeType === 'eco').slice(0, 8);
        const artificialProducts = allProducts.slice(8, 16);
        
        // Load into grids
        if (window.productCardGenerator) {
            window.productCardGenerator.generateProductGrid('bundleGrid', bundleProducts);
            window.productCardGenerator.generateProductGrid('bundleGrid2', bundleProducts2);
            window.productCardGenerator.generateProductGrid('bestGrid', bestProducts);
            window.productCardGenerator.generateProductGrid('bestGrid2', bestProducts2);
            window.productCardGenerator.generateProductGrid('floralGrid', floralProducts);
            window.productCardGenerator.generateProductGrid('artificialGrid', artificialProducts);
            
            console.log('✅ Products loaded into all sections');
        } else {
            console.error('❌ ProductCardGenerator not available');
        }
    }
    
    loadFallbackProducts() {
        console.log('🔄 Loading fallback products...');
        // Use existing hardcoded products as fallback
        // This will be handled by the existing script.js
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing API Product Loader...');
    new APIProductLoader();
});

// Also initialize after a delay to ensure all scripts are loaded
setTimeout(() => {
    if (!window.apiProductLoader) {
        console.log('🔄 Retrying API Product Loader initialization...');
        window.apiProductLoader = new APIProductLoader();
    }
}, 2000);
