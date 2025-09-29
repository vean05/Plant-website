/**
 * API Integration for Bloomspace E-commerce
 * Frontend JavaScript to integrate with PHP backend
 */

class BloomspaceAPI {
    constructor() {
        this.baseURL = 'api';
        this.cart = new ShoppingCartAPI();
        this.auth = new AuthAPI();
        this.products = new ProductsAPI();
        this.orders = new OrdersAPI();
    }
}

class AuthAPI {
    constructor() {
        this.baseURL = 'api/auth';
    }
    
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${this.baseURL}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    remember_me: rememberMe
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store user data in localStorage
            localStorage.setItem('bloomspaceUser', JSON.stringify(data.data));
            localStorage.setItem('bloomspaceUserRegistered', 'true');
            localStorage.setItem('bloomspaceUserEmail', data.data.email);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/logout.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            // Clear local storage
            localStorage.removeItem('bloomspaceUser');
            localStorage.removeItem('bloomspaceUserRegistered');
            localStorage.removeItem('bloomspaceUserEmail');
            
            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
    
    isLoggedIn() {
        return localStorage.getItem('bloomspaceUser') !== null;
    }
    
    getCurrentUser() {
        const user = localStorage.getItem('bloomspaceUser');
        return user ? JSON.parse(user) : null;
    }
}

class ProductsAPI {
    constructor() {
        this.baseURL = 'api/products';
    }
    
    async getProducts(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseURL}/list-fixed.php?${queryString}`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products');
            }
            
            return data;
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    }
    
    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseURL}/detail.php?id=${id}`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch product');
            }
            
            return data;
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }
    
}

class ShoppingCartAPI {
    constructor() {
        this.baseURL = 'api/cart';
        this.items = [];
        this.total = 0;
    }
    
    async addItem(productId, quantity = 1) {
        try {
            const response = await fetch(`${this.baseURL}/add.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add item to cart');
            }
            
            // Update cart display
            this.updateCartDisplay(data.data);
            
            return data;
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    }
    
    async getCart() {
        try {
            const response = await fetch(`${this.baseURL}/get.php`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch cart');
            }
            
            this.items = data.data.items || [];
            this.total = data.data.total || 0;
            
            return data;
        } catch (error) {
            console.error('Get cart error:', error);
            throw error;
        }
    }
    
    async updateItem(cartItemId, quantity) {
        try {
            const response = await fetch(`${this.baseURL}/update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart_item_id: cartItemId,
                    quantity: quantity
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update cart item');
            }
            
            return data;
        } catch (error) {
            console.error('Update cart item error:', error);
            throw error;
        }
    }
    
    async removeItem(cartItemId) {
        try {
            const response = await fetch(`${this.baseURL}/remove.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart_item_id: cartItemId
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove cart item');
            }
            
            return data;
        } catch (error) {
            console.error('Remove cart item error:', error);
            throw error;
        }
    }
    
    updateCartDisplay(cartData) {
        // Update cart count in navigation
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cartData.cart_count || 0;
        });
        
        // Update cart total
        const cartTotalElements = document.querySelectorAll('.cart-total');
        cartTotalElements.forEach(element => {
            element.textContent = cartData.formatted_total || 'RM 0.00';
        });
        
        // Show/hide cart badge
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            if (cartData.cart_count > 0) {
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });
    }
}

class OrdersAPI {
    constructor() {
        this.baseURL = 'api/orders';
    }
    
    async createOrder(orderData) {
        try {
            const response = await fetch(`${this.baseURL}/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }
            
            return data;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }
    
    async getOrder(orderId) {
        try {
            const response = await fetch(`${this.baseURL}/get.php?id=${orderId}`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch order');
            }
            
            return data;
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }
    
    async getUserOrders() {
        try {
            const response = await fetch(`${this.baseURL}/user-orders.php`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }
            
            return data;
        } catch (error) {
            console.error('Get user orders error:', error);
            throw error;
        }
    }
}

// Enhanced Shopping Cart class with API integration
class EnhancedShoppingCart {
    constructor() {
        this.api = null; // Will be set when needed
    }
    
    getAPI() {
        if (!this.api) {
            this.api = new BloomspaceAPI().cart;
        }
        return this.api;
    }
    
    loadFromLocalStorage() {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('bloomspaceCart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                this.items = cartData.items || [];
                this.total = cartData.total || 0;
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                this.items = [];
                this.total = 0;
            }
        } else {
            this.items = [];
            this.total = 0;
        }
    }
    
    updateCartDisplay(data = null) {
        // Update cart display in UI
        if (data) {
            this.items = data.items || [];
            this.total = data.total || 0;
        }
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.length;
        }
        
        // Update cart total
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.textContent = `RM ${this.total.toFixed(2)}`;
        }
    }
    
    async addToCart(productId, quantity = 1) {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Add to cart via API
            const result = await this.getAPI().addItem(productId, quantity);
            
            // Update local cart
            this.loadFromLocalStorage();
            this.updateCartDisplay();
            
            // Show success message
            this.showSuccessMessage('Item added to cart successfully!');
            
            return result;
        } catch (error) {
            console.error('Add to cart error:', error);
            this.showErrorMessage('Failed to add item to cart. Please try again.');
        } finally {
            this.hideLoadingState();
        }
    }
    
    async loadCartFromAPI() {
        try {
            const result = await this.getAPI().getCart();
            
            // Update local cart with API data
            this.items = result.data.items || [];
            this.total = result.data.total || 0;
            
            // Update display
            this.updateCartDisplay();
            
            return result;
        } catch (error) {
            console.error('Load cart from API error:', error);
            // Fallback to local storage
            this.loadFromLocalStorage();
            this.updateCartDisplay();
        }
    }
    
    showLoadingState() {
        // Add loading spinner to add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        });
    }
    
    hideLoadingState() {
        // Remove loading spinner from add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        });
    }
    
    showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showErrorMessage(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Export for global use first
console.log('About to export BloomspaceAPI...');
window.BloomspaceAPI = BloomspaceAPI;
console.log('BloomspaceAPI exported to window:', typeof window.BloomspaceAPI);

// Export EnhancedShoppingCart class
console.log('About to export EnhancedShoppingCart...');
window.EnhancedShoppingCart = EnhancedShoppingCart;
console.log('EnhancedShoppingCart exported to window:', typeof window.EnhancedShoppingCart);
console.log('All exports completed');
