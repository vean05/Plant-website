// Navigation Loader - Loads navigation component into all pages
class NavigationLoader {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Load navigation HTML
            const response = await fetch('navigation.html');
            const navigationHTML = await response.text();
            
            // Extract the header, mobile sidebar, and cart content
            const parser = new DOMParser();
            const doc = parser.parseFromString(navigationHTML, 'text/html');
            const header = doc.querySelector('.header');
            const mobileSidebar = doc.querySelector('.mobile-sidebar');
            const mobileSidebarOverlay = doc.querySelector('.mobile-sidebar-overlay');
            const cartSidebar = doc.querySelector('#cartSidebar');
            const cartOverlay = doc.querySelector('#cartOverlay');
            
            // Extract search overlay from header and move it to body
            const searchOverlay = header?.querySelector('.search-input-container');
            if (searchOverlay) {
                // Remove search overlay from header
                searchOverlay.remove();
            }
            
            if (header) {
                // Replace existing header or insert new one
                const existingHeader = document.querySelector('.header');
                if (existingHeader) {
                    existingHeader.replaceWith(header);
                } else {
                    document.body.insertBefore(header, document.body.firstChild);
                }
                
                console.log('✅ Header loaded successfully');
            }
            
            if (mobileSidebar) {
                // Replace existing mobile sidebar or insert new one
                const existingMobileSidebar = document.querySelector('.mobile-sidebar');
                if (existingMobileSidebar) {
                    existingMobileSidebar.replaceWith(mobileSidebar);
                } else {
                    document.body.appendChild(mobileSidebar);
                }
                
                console.log('✅ Mobile sidebar loaded successfully');
            }
            
            if (mobileSidebarOverlay) {
                // Replace existing overlay or insert new one
                const existingOverlay = document.querySelector('.mobile-sidebar-overlay');
                if (existingOverlay) {
                    existingOverlay.replaceWith(mobileSidebarOverlay);
                } else {
                    document.body.appendChild(mobileSidebarOverlay);
                }
                
                console.log('✅ Mobile sidebar overlay loaded successfully');
            }
            
            if (cartSidebar) {
                // Replace existing cart sidebar or insert new one
                const existingCartSidebar = document.querySelector('#cartSidebar');
                if (existingCartSidebar) {
                    existingCartSidebar.replaceWith(cartSidebar);
                } else {
                    document.body.appendChild(cartSidebar);
                }
                
                console.log('✅ Cart sidebar loaded successfully');
            }
            
            if (cartOverlay) {
                // Replace existing cart overlay or insert new one
                const existingCartOverlay = document.querySelector('#cartOverlay');
                if (existingCartOverlay) {
                    existingCartOverlay.replaceWith(cartOverlay);
                } else {
                    document.body.appendChild(cartOverlay);
                }
                
                console.log('✅ Cart overlay loaded successfully');
            }
            
            // Add search overlay directly to body (outside of header stacking context)
            if (searchOverlay) {
                // Remove existing search overlay if any
                const existingSearchOverlay = document.querySelector('.search-input-container');
                if (existingSearchOverlay) {
                    existingSearchOverlay.remove();
                }
                
                // Add search overlay to body
                document.body.appendChild(searchOverlay);
                console.log('✅ Search overlay moved to body successfully');
            }
            
            // Initialize navigation functionality
            this.initializeNavigation();
            
            console.log('✅ Navigation loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load navigation:', error);
            // Fallback: create basic navigation
            this.createFallbackNavigation();
        }
    }

    initializeNavigation() {
        // Set active navigation item based on current page
        this.setActiveNavigation();
        
        // Initialize mobile menu
        this.initializeMobileMenu();
        
        
        // Initialize dropdown menus
        this.initializeDropdowns();
        
        // Initialize Smart Navigation (from script.js)
        if (typeof SmartNavigation !== 'undefined' && !window.smartNavigation) {
            window.smartNavigation = new SmartNavigation();
            console.log('✅ Smart Navigation initialized');
        }

        // Initialize user menu
        this.initializeUserMenu();
    }

    setActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    initializeMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileSidebar = document.querySelector('.mobile-sidebar');
        const mobileSidebarClose = document.querySelector('.mobile-sidebar-close');
        const overlay = document.querySelector('.mobile-sidebar-overlay');
        
        // 打开移动菜单
        if (mobileMenuBtn && mobileSidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                // 保存当前滚动位置
                this.mobileMenuScrollPosition = window.pageYOffset;
                
                // 禁止页面滚动
                document.body.classList.add('no-scroll');
                document.body.style.top = `-${this.mobileMenuScrollPosition}px`;
                
                mobileSidebar.classList.add('open');
                if (overlay) overlay.classList.add('open');
                
                // 显示导航栏当打开菜单时
                if (window.smartNavigation) {
                    window.smartNavigation.forceShow();
                }
                
                console.log('✅ Mobile menu opened');
            });
        }
        
        // 关闭移动菜单
        const closeMobileMenu = () => {
            if (mobileSidebar) mobileSidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            
            // 恢复页面滚动
            document.body.classList.remove('no-scroll');
            document.body.style.top = '';
            
            // 恢复滚动位置
            if (this.mobileMenuScrollPosition !== undefined) {
                window.scrollTo(0, this.mobileMenuScrollPosition);
            }
            
            console.log('✅ Mobile menu closed');
        };
        
        if (mobileSidebarClose) {
            mobileSidebarClose.addEventListener('click', closeMobileMenu);
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }
        
        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileSidebar && mobileSidebar.classList.contains('open')) {
                closeMobileMenu();
            }
        });
        
        // Initialize mobile dropdowns
        this.initializeMobileDropdowns();
    }
    
    initializeMobileDropdowns() {
        const mobileDropdowns = document.querySelectorAll('.mobile-sidebar .dropdown');
        
        mobileDropdowns.forEach(dropdown => {
            const dropdownToggle = dropdown.querySelector('a');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            if (dropdownToggle && dropdownMenu) {
                dropdownToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                    
                    // Rotate chevron icon
                    const chevron = dropdownToggle.querySelector('.fa-chevron-down');
                    if (chevron) {
                        chevron.style.transform = dropdown.classList.contains('open') 
                            ? 'rotate(180deg)' 
                            : 'rotate(0deg)';
                    }
                    
                    console.log('✅ Mobile dropdown toggled');
                });
            }
        });
    }

    
    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Peace Lily",
                price: 89.00,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Indoor Plants"
            },
            {
                id: 2,
                name: "Water Pennywort",
                price: 69.00,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Aquatic Plants"
            },
            {
                id: 3,
                name: "Peace Lily Large",
                price: 119.00,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Indoor Plants"
            },
            {
                id: 4,
                name: "All Purpose Foliar Fertilizer",
                price: 20.90,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Plant Care"
            },
            {
                id: 5,
                name: "Monstera Deliciosa",
                price: 95.00,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Indoor Plants"
            },
            {
                id: 6,
                name: "Snake Plant",
                price: 45.00,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                category: "Indoor Plants"
            }
        ];
    }
    

    // 导航到产品详情页面的函数
    navigateToProductDetail(productId) {
        // 存储选中的产品ID到sessionStorage
        sessionStorage.setItem('selectedProductId', productId);
        
        // 跳转到产品详情页面
        window.location.href = 'product-detail.html';
    }
    

    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.header-nav .dropdown');
        
        dropdowns.forEach(dropdown => {
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            const dropdownToggle = dropdown.querySelector('a');
            
            if (dropdownToggle && dropdownMenu) {
                // 在mobile设备上使用点击，desktop设备上使用hover
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    dropdownToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                        
                        // 旋转箭头图标
                        const chevron = dropdownToggle.querySelector('.fa-chevron-down');
                        if (chevron) {
                            chevron.style.transform = dropdown.classList.contains('open') 
                                ? 'rotate(180deg)' 
                                : 'rotate(0deg)';
                        }
                    });
                } else {
                    // Desktop: 支持点击切换，也保留hover功能
                    dropdownToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        // 关闭其他所有dropdown
                        document.querySelectorAll('.header-nav .dropdown').forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                otherDropdown.classList.remove('open');
                            }
                        });
                        
                        dropdown.classList.toggle('open');
                    });
                    
                    // Desktop: 点击外部区域关闭dropdown
                    document.addEventListener('click', (e) => {
                        if (!dropdown.contains(e.target)) {
                            dropdown.classList.remove('open');
                        }
                    });
                }
            }
        });
    }

    createFallbackNavigation() {
        console.log('Creating fallback navigation...');
        const fallbackNav = `
            <header class="header">
                <div class="header-top">
                    <div class="container">
                        <div class="sale-banner">
                            [SALE] 10% off plants, with code "PLANT10". 15% off growlights, with code "LIGHT15". Terms apply.
                        </div>
                        <div class="shipping-info">
                            Ships to all Semenanjung Malaysia, Free Shipping above RM150. Self pickup available. 14 Days Guarantee!
                        </div>
                    </div>
                </div>
                
                <div class="header-main">
                    <div class="container">
                        <div class="header-left">
                            <button class="mobile-menu-btn" aria-label="Open menu"><i class="fas fa-bars" aria-hidden="true"></i></button>
                            <div class="logo">
                                <a href="index.html">
                                    <h1>Bloomspace</h1>
                                </a>
                            </div>
                        </div>
                        
                        <nav class="header-nav">
                            <ul class="nav-menu">
                                <li><a href="get10.html">Get RM10</a></li>
                                <li><a href="plant-gifts.html">Plant Gifts</a></li>
                                <li><a href="new-arrivals.html">New Arrivals</a></li>
                                <li class="dropdown">
                                    <a href="#others">Others <i class="fas fa-chevron-down"></i></a>
                                    <ul class="dropdown-menu">
                                        <li><a href="artificial-plant.html">Artificial Plant</a></li>
                                        <li><a href="planters.html">Planters</a></li>
                                        <li><a href="care-tools.html">Care Tools</a></li>
                                        <li><a href="growlight.html">Growlight</a></li>
                                    </ul>
                                </li>
                                <li><a href="events.html">Events</a></li>
                                <li><a href="contact.html">Contact</a></li>
                                <li><a href="profile.html" class="profile-link">Profile</a></li>
                            </ul>
                        </nav>
                        
                        <div class="header-right">
                            <div class="search-container">
                                <button class="search-toggle" aria-label="Search">
                                    <i class="fas fa-search"></i>
                                </button>
                                <div class="search-input-container">
                                    <input type="text" class="search-input" placeholder="Search products..." aria-label="Search products">
                                </div>
                            </div>
                            <div class="user-actions">
                                <a href="login.html" class="login-btn" aria-label="Login" title="Login"><i class="fas fa-user" aria-hidden="true"></i></a>
                                <button class="cart-btn" aria-label="Open cart" title="Open cart"><i class="fas fa-shopping-cart" aria-hidden="true"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Mobile Sidebar Navigation -->
            <div class="mobile-sidebar">
                <div class="mobile-sidebar-header">
                    <h2>Menu</h2>
                    <button class="mobile-sidebar-close" aria-label="Close menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <nav class="mobile-sidebar-nav">
                    <ul>
                        <li><a href="get10.html">Get RM10</a></li>
                        <li><a href="plant-gifts.html">Plant Gifts</a></li>
                        <li><a href="new-arrivals.html">New Arrivals</a></li>
                        <li class="dropdown">
                            <a href="#others">
                                Others 
                                <i class="fas fa-chevron-down"></i>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="artificial-plant.html">Artificial Plant</a></li>
                                <li><a href="planters.html">Planters</a></li>
                                <li><a href="care-tools.html">Care Tools</a></li>
                                <li><a href="growlight.html">Growlight</a></li>
                            </ul>
                        </li>
                        <li><a href="events.html">Events</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="profile.html" class="profile-link">Profile</a></li>
                    </ul>
                </nav>
                
                <div class="mobile-sidebar-footer">
                    <a href="login.html" class="login-btn">
                        <i class="fas fa-user"></i>
                        Login
                    </a>
                    <button class="cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                        Cart
                    </button>
                </div>
            </div>
            
            <!-- Mobile Sidebar Overlay -->
            <div class="mobile-sidebar-overlay"></div>
            
            <!-- Shopping Cart Sidebar -->
            <div id="cartSidebar" class="cart-sidebar">
                <div class="cart-header">
                    <h3>Shopping Cart</h3>
                    <button id="closeCart" class="close-cart" aria-label="Close cart">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-content">
                    <div id="cartItems" class="cart-items">
                        <p class="empty-cart">Your cart is empty</p>
                    </div>
                    
                    <div class="cart-footer">
                        <div class="cart-total">
                            <span>Total: </span>
                            <span id="cartTotal">RM0.00</span>
                        </div>
                        <button class="checkout-btn">Proceed to Checkout</button>
                    </div>
                </div>
            </div>
            
            <!-- Cart Overlay -->
            <div id="cartOverlay" class="cart-overlay"></div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', fallbackNav);
        this.initializeNavigation();
    }

    initializeUserMenu() {
        const loginBtn = document.getElementById('loginBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        
        if (!loginBtn || !userDropdown || !userEmailDisplay) return;

        // Check login status
        this.updateUserMenu();

        // Toggle user dropdown
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (userDropdown.style.display === 'none' || userDropdown.style.display === '') {
                userDropdown.style.display = 'block';
            } else {
                userDropdown.style.display = 'none';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                userDropdown.style.display = 'none';
            }
        });
    }

    updateUserMenu() {
        const loginBtn = document.getElementById('loginBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        
        if (!loginBtn || !userDropdown || !userEmailDisplay) return;

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('bloomspaceUserRegistered') === 'true';
        const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('bloomspaceUserEmail');

        if (isLoggedIn && userEmail) {
            // User is logged in
            loginBtn.innerHTML = '<i class="fas fa-user-circle" aria-hidden="true"></i>';
            loginBtn.title = 'User Menu';
            userEmailDisplay.textContent = userEmail;
            userDropdown.style.display = 'none';
        } else {
            // User is not logged in
            loginBtn.innerHTML = '<i class="fas fa-user" aria-hidden="true"></i>';
            loginBtn.href = 'login.html';
            loginBtn.title = 'Login';
            userDropdown.style.display = 'none';
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavigationLoader();
});
