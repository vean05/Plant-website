# 🌱 Bloomspace Plant E-commerce System Documentation

## 📋 Project Overview

Bloomspace is a comprehensive plant e-commerce website built with modern web technologies. This system provides a complete online shopping experience for plant enthusiasts, featuring dynamic product management, user authentication, shopping cart functionality, and responsive design.

## 🏗️ System Architecture

### **Technology Stack**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL (WampServer)
- **Design**: Responsive Web Design
- **API**: RESTful API Architecture

### **Core Components**
1. **API Integration Layer** (`api-integration.js`)
2. **Business Logic Controller** (`script.js`)
3. **Product Data Manager** (`universal-api-loader.js`)
4. **Navigation System** (`navigation-loader.js`)
5. **User Authentication** (`login.js`)

## 🚀 Key Features

### ✨ **Dynamic Product Management**
- Real-time product loading from database
- Automatic product card generation
- Hover image switching effects
- Responsive grid layouts
- Product categorization and filtering

### 🛒 **Advanced Shopping Cart System**
- Real-time cart updates
- Local storage persistence
- User session management
- Cart state synchronization
- Add/remove/update functionality

### 🔐 **Comprehensive User Authentication**
- User registration and login
- Session management
- Password security
- User profile management
- Address management system

### 📱 **Responsive Design**
- Mobile-first approach
- Desktop, tablet, and mobile optimization
- Touch-friendly interactions
- Adaptive navigation system

## 📖 Detailed Implementation Guide

### 1. **API Integration System** (`api-integration.js`)

#### **BloomspaceAPI Main Controller**
```javascript
class BloomspaceAPI {
    constructor() {
        this.baseURL = 'api';
        this.cart = new ShoppingCartAPI();
        this.auth = new AuthAPI();
        this.products = new ProductsAPI();
        this.orders = new OrdersAPI();
    }
}
```

**Purpose**: Central hub for all API communications
**Key Features**:
- Unified API management
- Error handling and validation
- Data format standardization
- State management integration

#### **Authentication API (AuthAPI)**
```javascript
class AuthAPI {
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${this.baseURL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember_me: rememberMe })
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
    
    async register(userData) {
        // Registration implementation
    }
    
    async logout() {
        // Logout implementation
    }
    
    isLoggedIn() {
        return localStorage.getItem('bloomspaceUser') !== null;
    }
}
```

**Workflow**:
1. User submits login credentials
2. API sends POST request to backend
3. Backend validates credentials against database
4. Success: Store user data in localStorage
5. Failure: Display error message

#### **Products API (ProductsAPI)**
```javascript
class ProductsAPI {
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
        // Get single product details
    }
}
```

**Supported Parameters**:
- `category`: Filter by product category
- `search`: Search by product name
- `min_price` / `max_price`: Price range filtering
- `featured`: Show only featured products
- `limit`: Number of products to return
- `page`: Pagination support

#### **Shopping Cart API (ShoppingCartAPI)**
```javascript
class ShoppingCartAPI {
    async addItem(productId, quantity = 1) {
        try {
            const response = await fetch(`${this.baseURL}/add.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        // Retrieve current cart contents
    }
    
    async updateItem(cartItemId, quantity) {
        // Update item quantity
    }
    
    async removeItem(cartItemId) {
        // Remove item from cart
    }
}
```

### 2. **Business Logic Controller** (`script.js`)

#### **ShoppingCart Class**
```javascript
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
    
    addToCart(productCard) {
        try {
            // Extract product information
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.current-price').textContent.replace('RM', ''));
            
            // Check if item already exists
            const existingItem = this.items.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }
            
            // Recalculate total
            this.calculateTotal();
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Update display
            this.updateCartDisplay();
            
            // Show success message
            this.showSuccessMessage(`${productName} added to cart!`);
            
        } catch (error) {
            console.error('Add to cart error:', error);
            this.showErrorMessage('Failed to add item to cart');
        }
    }
}
```

**Key Features**:
- Local storage persistence
- Real-time UI updates
- Error handling and user feedback
- Event delegation for dynamic content

#### **Event Management System**
```javascript
bindEvents() {
    // Cart button events
    const cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(cartBtn => {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });
    });
    
    // Add to cart button events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart') && !e.target.disabled) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.addToCart(productCard);
            }
        }
    });
    
    // Product card navigation
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const isButton = e.target.classList.contains('add-to-cart') || 
                       e.target.tagName === 'BUTTON';
        
        if (productCard && !isButton) {
            this.navigateToProductDetail(productCard);
        }
    });
}
```

### 3. **Product Data Manager** (`universal-api-loader.js`)

#### **UniversalAPILoader Class**
```javascript
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
            setTimeout(() => this.init(), 1000);
        }
    }
    
    async loadAllProducts() {
        try {
            // Load different product categories in parallel
            const [bundleProducts, bestProducts, floralProducts, artificialProducts] = await Promise.all([
                this.api.products.getProducts({ category: 'bundle-deals', limit: 8 }),
                this.api.products.getProducts({ category: 'best-sellers', limit: 8 }),
                this.api.products.getProducts({ category: 'floral-plants', limit: 8 }),
                this.api.products.getProducts({ category: 'artificial-plants', limit: 8 })
            ]);
            
            // Convert API data to display format
            const bundleDisplayProducts = this.convertAPIProductsToDisplayFormat(bundleProducts.data.products);
            const bestDisplayProducts = this.convertAPIProductsToDisplayFormat(bestProducts.data.products);
            const floralDisplayProducts = this.convertAPIProductsToDisplayFormat(floralProducts.data.products);
            const artificialDisplayProducts = this.convertAPIProductsToDisplayFormat(artificialProducts.data.products);
            
            // Load products into different sections
            this.loadProductsIntoSections(bundleDisplayProducts, bestDisplayProducts, floralDisplayProducts, artificialDisplayProducts);
            
        } catch (error) {
            console.error('❌ Failed to load products from API:', error);
            this.loadFallbackProducts();
        }
    }
}
```

**Data Conversion Process**:
```javascript
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
```

### 4. **Navigation System** (`navigation-loader.js`)

#### **NavigationLoader Class**
```javascript
class NavigationLoader {
    constructor() {
        this.init();
    }
    
    async init() {
        try {
            // Load navigation HTML from external file
            const response = await fetch('navigation.html');
            const navigationHTML = await response.text();
            
            // Parse and extract components
            const parser = new DOMParser();
            const doc = parser.parseFromString(navigationHTML, 'text/html');
            
            // Extract navigation components
            const header = doc.querySelector('.header');
            const mobileSidebar = doc.querySelector('.mobile-sidebar');
            const cartSidebar = doc.querySelector('#cartSidebar');
            
            // Load components into page
            this.loadNavigationComponents(header, mobileSidebar, cartSidebar);
            this.initializeNavigation();
            
        } catch (error) {
            console.error('❌ Failed to load navigation:', error);
            this.createFallbackNavigation();
        }
    }
}
```

**Dynamic User State Management**:
```javascript
updateUserMenu() {
    const isLoggedIn = localStorage.getItem('bloomspaceUserRegistered') === 'true';
    const userEmail = localStorage.getItem('bloomspaceUserEmail');
    
    if (isLoggedIn && userEmail) {
        // User is logged in - show user menu
        loginBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
        loginBtn.title = 'User Menu';
        userEmailDisplay.textContent = userEmail;
    } else {
        // User not logged in - show login button
        loginBtn.innerHTML = '<i class="fas fa-user"></i>';
        loginBtn.href = 'login.html';
        loginBtn.title = 'Login';
    }
}
```

### 5. **User Authentication System** (`login.js`)

#### **Form Validation System**
```javascript
// Email/Username validation
function validateEmailUsername() {
    const value = emailUsernameInput.value.trim();
    const validationMessage = emailUsernameInput.parentNode.querySelector('.validation-message');
    
    if (!value) {
        showValidationMessage(emailUsernameInput, validationMessage, 'Email or Username is required', 'error');
        return false;
    }
    
    // Check if it's an email or username
    if (value.includes('@')) {
        // Email validation
        if (!emailPattern.test(value)) {
            showValidationMessage(emailUsernameInput, validationMessage, 'Please enter a valid email address', 'error');
            return false;
        }
    } else {
        // Username validation
        if (!usernamePattern.test(value)) {
            showValidationMessage(emailUsernameInput, validationMessage, 'Username must be 3-15 characters (letters, numbers, underscores only)', 'error');
            return false;
        }
    }
    
    showValidationMessage(emailUsernameInput, validationMessage, 'Looks good!', 'success');
    return true;
}
```

#### **Login Process**
```javascript
async function handleLogin(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Call API for login
        const api = new BloomspaceAPI();
        const result = await api.auth.login(
            emailUsernameInput.value.trim(),
            passwordInput.value,
            rememberMeCheckbox.checked
        );
        
        // Login successful
        showSuccessMessage('Login successful! Redirecting...');
        
        // Redirect to appropriate page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage(error.message || 'Login failed. Please try again.');
    } finally {
        hideLoadingState();
    }
}
```

## 🗄️ Database Schema

### **Core Tables**

#### **Users Table**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_image VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Products Table**
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL,
    stock_quantity INT DEFAULT 0,
    stock_status ENUM('instock', 'outofstock', 'onbackorder') DEFAULT 'instock',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Shopping Cart Table**
```sql
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(100) NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## 🔄 System Workflow

### **Complete User Journey**

1. **Page Load**:
   - `navigation-loader.js` loads navigation components
   - `universal-api-loader.js` loads product data
   - `script.js` initializes shopping cart and event handlers

2. **User Authentication**:
   - User submits login form
   - `login.js` validates input
   - `api-integration.js` sends request to backend
   - Backend validates credentials
   - Success: User data stored in localStorage
   - Navigation updates to show user menu

3. **Product Browsing**:
   - Products loaded from database via API
   - `universal-api-loader.js` converts data format
   - Product cards generated dynamically
   - User can browse and filter products

4. **Shopping Cart Operations**:
   - User clicks "Add to Cart"
   - `script.js` handles the event
   - `api-integration.js` sends request to backend
   - Cart updated in database
   - UI updated in real-time

5. **Order Processing**:
   - User proceeds to checkout
   - Order data collected
   - `api-integration.js` creates order
   - Order stored in database
   - User redirected to success page

## 📱 Responsive Design Implementation

### **CSS Media Queries**
```css
/* Desktop (1025px+) */
@media (min-width: 1025px) {
    .products-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
}

/* Tablet (769px-1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
    .products-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
    }
}

/* Mobile (≤768px) */
@media (max-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
}
```

### **JavaScript Responsive Handling**
```javascript
// Mobile menu handling
const isMobile = window.innerWidth <= 768;

if (isMobile) {
    // Mobile-specific behavior
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
    });
} else {
    // Desktop-specific behavior
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('open');
    });
}
```

## 🚀 Performance Optimizations

### **Code Splitting**
- Modular JavaScript architecture
- Lazy loading of components
- Event delegation for dynamic content

### **Caching Strategy**
- localStorage for user data and cart
- API response caching
- Image optimization and lazy loading

### **Database Optimization**
- Proper indexing on frequently queried columns
- Efficient query structure
- Connection pooling

## 🔧 Development Setup

### **Prerequisites**
- WampServer (PHP 7.4+, MySQL, Apache)
- Modern web browser
- Code editor (VS Code recommended)

### **Installation Steps**
1. Clone the repository
2. Set up WampServer
3. Import database schema
4. Configure database connection
5. Start local server
6. Access via `http://localhost/Plant Testing3`

### **File Structure**
```
Plant Testing3/
├── api/                    # Backend API endpoints
│   ├── auth/              # Authentication APIs
│   ├── products/          # Product management APIs
│   └── cart/              # Shopping cart APIs
├── config/                # Configuration files
│   └── database.php       # Database connection
├── image/                 # Static images
├── uploads/               # User uploads
├── *.html                 # Frontend pages
├── *.js                   # JavaScript modules
├── *.css                  # Stylesheets
└── database_schema.sql    # Database structure
```

## 🎯 Future Enhancements

### **Planned Features**
- Advanced product filtering and search
- Wishlist functionality
- Product reviews and ratings
- Inventory management system
- Analytics dashboard
- Payment gateway integration
- Email notifications
- Multi-language support

### **Technical Improvements**
- Progressive Web App (PWA) features
- Advanced caching strategies
- Real-time notifications
- API rate limiting
- Enhanced security measures
- Performance monitoring

## 📊 System Statistics

- **Total Files**: 50+ files
- **Lines of Code**: 10,000+ lines
- **Database Tables**: 12 tables
- **API Endpoints**: 15+ endpoints
- **Responsive Breakpoints**: 3 breakpoints
- **Supported Browsers**: All modern browsers

## 🔄 Version History

- **v1.0** - Initial release with basic functionality
- **v2.0** - Added API integration layer
- **v3.0** - Implemented responsive design
- **v4.0** - Enhanced shopping cart system
- **v5.0** - Added user authentication
- **v6.0** - Improved product management
- **v7.0** - Current version with full e-commerce features

---

💡 **Note**: This system provides a complete e-commerce solution specifically designed for plant and gardening businesses. The modular architecture ensures easy maintenance and future scalability.

