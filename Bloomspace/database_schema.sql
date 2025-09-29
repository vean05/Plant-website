CREATE DATABASE IF NOT EXISTS bloomspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloomspace_db;
SET FOREIGN_KEY_CHECKS=0;

-- Users table
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
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User addresses table
CREATE TABLE user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_type ENUM('billing', 'shipping') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Malaysia',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_category FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    manage_stock BOOLEAN DEFAULT TRUE,
    stock_status ENUM('instock', 'outofstock', 'onbackorder') DEFAULT 'instock',
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    care_instructions TEXT,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    light_requirements ENUM('low', 'medium', 'bright', 'direct') DEFAULT 'medium',
    watering_frequency ENUM('daily', 'weekly', 'biweekly', 'monthly') DEFAULT 'weekly',
    pet_friendly BOOLEAN DEFAULT TRUE,
    air_purifying BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    price_small DECIMAL(10,2),
    price_medium DECIMAL(10,2),
    price_large DECIMAL(10,2),
    image_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product categories junction table
CREATE TABLE product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Product images table
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('credit_card', 'bank_transfer', 'e_wallet', 'cod') NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    notes TEXT,
    shipping_address JSON,
    billing_address JSON,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Coupons/Vouchers table
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('fixed', 'percentage') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);


-- Contact messages table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Site settings table
CREATE TABLE site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

INSERT INTO categories (id, name, slug, description, image, parent_id, sort_order, is_active, created_at, updated_at) VALUES
(9, 'Bundle Deals', 'bundle-deals', 'Special bundle offers and collections', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(10, 'Best Sellers', 'best-sellers', 'Our most popular plants', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(11, 'Floral Plants', 'floral-plants', 'Beautiful flowering plants', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(12, 'Artificial Plants', 'artificial-plants', 'Low-maintenance artificial plants', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(13, 'Plant Gift Collections', 'plant-gift-collections', 'Curated plant gift sets', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-09 15:10:35'),
(14, 'Gift Plants', 'gift-plants', 'Perfect plants for gifting', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-09 15:10:35'),
(15, 'Holiday Gifts', 'holiday-gifts', 'Special holiday plant gifts', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(16, 'Grow Lights', 'grow-lights', 'LED grow lights for plants', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(17, 'Care Tools', 'care-tools', 'Essential plant care tools', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-09 15:10:35'),
(18, 'Planters', 'planters', 'Beautiful plant containers', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-09 15:10:35'),
(19, 'New Arrivals', 'new-arrivals', 'Latest plant additions', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(20, 'Trending Plants', 'trending-plants', 'Currently trending plants', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(21, 'Indoor Plants', 'indoor-plants', 'Beautiful plants perfect for indoor spaces', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(22, 'Succulents', 'succulents', 'Low-maintenance succulents and cacti', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(23, 'Air Purifying', 'air-purifying', 'Plants that clean the air', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(24, 'Pet Friendly', 'pet-friendly', 'Safe for pets', NULL, NULL, 0, 1, '2025-09-09 15:10:35', '2025-09-10 04:16:11'),
(25, 'Outdoor Plants', 'outdoor-plants', 'Plants that thrive in outdoor environments', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(26, 'Pots & Planters', 'pots', 'Beautiful planters and pots for your plants', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(27, 'Care Tools', 'tools', 'Essential tools for plant care', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(28, 'Plant Gifts', 'plant-gifts', 'Perfect plant gifts for any occasion', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(29, 'Gift Collections', 'gift-collections', 'Curated plant gift sets', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(30, 'Plant Care', 'plant-care', 'Tools and accessories for plant care', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(31, 'Low Maintenance', 'low-maintenance', 'Easy to care for plants', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(32, 'Large Plants', 'large-plants', 'Big statement plants', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11'),
(33, 'Small Plants', 'small-plants', 'Compact plants for small spaces', NULL, NULL, 0, 1, '2025-09-10 04:16:11', '2025-09-10 04:16:11');

-- Insert default coupons
INSERT INTO coupons (code, name, description, type, value, minimum_amount, is_active, valid_until) VALUES
('WELCOME10', 'Welcome Discount', 'RM10 off for new users', 'fixed', 10.00, 50.00, TRUE, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
('SAVE20', '20% Off', '20% discount on orders above RM100', 'percentage', 20.00, 100.00, TRUE, DATE_ADD(NOW(), INTERVAL 6 MONTH)),
('FREESHIP', 'Free Shipping', 'Free shipping on orders above RM150', 'fixed', 15.00, 150.00, TRUE, DATE_ADD(NOW(), INTERVAL 1 YEAR));

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', 'Bloomspace', 'Website name'),
('site_email', 'info@bloomspace.com', 'Contact email'),
('free_shipping_threshold', '150', 'Minimum amount for free shipping'),
('tax_rate', '6', 'Tax rate percentage'),
('currency', 'MYR', 'Default currency'),
('maintenance_mode', '0', 'Site maintenance mode (0=off, 1=on)');

--
-- Dumping data for table `products`
--

-- Longevity Set
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Longevity Set', 'longevity-set', 'LONG-001', 'Evergreen plant throughout all seasons', 'Longevity Set', 228.00, 199.00, FLOOR(10 + (RAND() * 41)), 0, 1, NULL, NULL, NULL);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 19),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/20LongevitySetBeige_1100x.jpg?v=1645591869', 'Longevity Set Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/08LongevitySetCloseup2_1100x.jpg?v=1645591869', 'Longevity Set Closeup 2', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/08LongevitySetCloseup1_1100x.jpg?v=1645591869', 'Longevity Set Closeup 1', 0, 3);

-- Fancy Set
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Fancy Set', 'fancy-set', 'FANCY-001', 'Add some fun to your home with these plants', 'Fancy Set', 138.00, 119.00, FLOOR(10 + (RAND() * 41)), 0, 1, NULL, NULL, NULL);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 19),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/05FancySetBeige_1100x.jpg?v=1610612053', 'Fancy Set Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/05FancySetCalatheaCloseup_1100x.jpg?v=1610613931', 'Fancy Set Calathea Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/05FancySetFernCloseup_1100x.jpg?v=1610612385', 'Fancy Set Fern Closeup', 0, 3);

-- Evergreen Set
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Evergreen Set', 'evergreen-set', 'EVER-001',
 'A thoughtfully curated set of two low maintenance plants for a beautiful home',
 'Evergreen Set',
 259.00, -- price 
 288.00, -- sale_price 
 FLOOR(10 + (RAND() * 41)), 0, 1,
 259.00, -- small
 279.00, -- medium
 299.00  -- large
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 9),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/66EvergreenDuoBeige_1100x.jpg?v=1744094259', 'Evergreen Set Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/66EvergreenDuoIndoorPlants_1100x.jpg?v=1744094259', 'Evergreen Set Indoor', 0, 2);

-- Workwell Plant Set
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Workwell Plant Set', 'workwell-plant-set', 'WORK-001',
 'A thoughtfully curated duo of resilient, low-maintenance plants designed to bring a touch of nature to your space',
 'Workwell Plant Set',
 389.00, -- price
 406.00, -- sale_price
 FLOOR(10 + (RAND() * 41)), 0, 1,
 389.00,
 399.00,
 419.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 9),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/66WorkwellPlantSet_576x.jpg?v=1743217964', 'Workwell Plant Set Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/66WorkwellPlantSetindoor_576x.jpg?v=1743217964', 'Workwell Plant Set Indoor', 0, 2);

-- Raya Trio Tray
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Raya Trio Tray', 'raya-trio-tray', 'RAYA-001',
 'A trio of greenery for Raya joy, comes with rattan tray.',
 'Raya Trio Tray',
 199.00,
 217.90,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 199.00,
 209.00,
 219.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 9),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/63RayaTrioTrayBeige_576x.jpg?v=1680593616', 'Raya Trio Tray Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/63RayaTrioTrayScene_576x.jpg?v=1743218264', 'Raya Trio Tray Scene', 0, 2);

-- Sinaran Raya Set
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Sinaran Raya Set', 'sinaran-raya-set', 'SINA-001',
 'Natural elegance for your space, comes with rattan basket stands.',
 'Sinaran Raya Set',
 309.00,
 379.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 309.00,
 339.00,
 369.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 9),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/61SinaranRayaSet_576x.png?v=1680591305', 'Sinaran Raya Set Main', 1, 1);

-- Plumosa Fern
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Plumosa Fern', 'plumosa-fern', 'PLUM-001',
 'Featuring soft feather like leaves, housed in exquisite Teardrop Planter',
 'Plumosa Fern',
 199.00, 219.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 199.00, 209.00, 219.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 10),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG77PlumosaFernTeardropBlack_3e25ad55-57cc-4362-8a7c-a45094055031_576x.jpg?v=1724067983', 'Plumosa Fern Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG77PlumosaFernTeardropCloseup_021f5995-4071-441f-96a3-3baf3a220f0f_576x.jpg?v=1724067984', 'Plumosa Fern Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG77PlumosaFernTeardropIndoorPlant_81cf6565-e34f-4e28-927e-68ff3f490b16_576x.jpg?v=1724067983', 'Plumosa Fern Indoor', 0, 3);

-- Baby Fern
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Baby Fern', 'baby-fern', 'BABY-001',
 'Adds a joyful presence to any space, paired with our Smiley planter',
 'Baby Fern',
 139.00, 159.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 139.00, 149.00, 159.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 10),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG098BabyFernSmiley_576x.jpg?v=1749099846', 'Baby Fern Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG098BabyFernSmileyscene_576x.jpg?v=1749270264', 'Baby Fern Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG098BabyFernSmileyHand_576x.jpg?v=1749270264', 'Baby Fern Hand', 0, 3);

-- Fiddle Leaf Fig
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Fiddle Leaf Fig', 'fiddle-leaf-fig', 'FIG-001',
 'A timeless piece of growth and elegance, perfect for nurturing spaces with natural beauty',
 'Fiddle Leaf Fig',
 119.00, 139.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 119.00, 129.00, 139.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 10),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG079FiddleLeafFigArgosM_576x.jpg?v=1724330535', 'Fiddle Leaf Fig Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG079FiddleLeafFigArgosMCloseup2_576x.jpg?v=1724330537', 'Fiddle Leaf Fig Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG079FiddleLeafFigArgosS-XL_576x.jpg?v=1727342342', 'Fiddle Leaf Fig Sizes', 0, 3);

-- Sansevieria Masoniana
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Sansevieria Masoniana', 'sansevieria-masoniana', 'SAN-001',
 'The Whale Fin Sansevieria housed in a playful polka dots designed ceramic planter',
 'Sansevieria Masoniana',
 159.00, 179.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 159.00, 169.00, 179.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 10),
(LAST_INSERT_ID(), 31);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG096SansevieriaMasoniana_576x.jpg?v=1749098107', 'Sansevieria Masoniana Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG096SansevieriaMasonianaCloseup_576x.jpg?v=1749098107', 'Sansevieria Masoniana Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG096SansevieriaMasonianascene_576x.jpg?v=1749098107', 'Sansevieria Masoniana Scene', 0, 3);

-- Everlasting Love Valentine's Day Bouquet
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active)
VALUES
('Everlasting Love Valentine''s Day Bouquet', 'everlasting-love-valentines-day-bouquet', 'VDAY01',
 'Premium everlasting bouquet for Valentine''s Day.', 
 'Everlasting bouquet with roses & luxury wrapping.',
 1099.00, 999.00, FLOOR(10 + (RAND() * 41)), 0, 1);

INSERT INTO product_categories (product_id, category_id) 
VALUES (LAST_INSERT_ID(), 11);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VDAY01EternalPassion99_1100x.jpg?v=1737101626', 'Everlasting Love Bouquet Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VDAY01EverlastingLoveFront_1100x.jpg?v=1737101626', 'Everlasting Love Bouquet Front', 0, 2);


-- Sweet Scent Valentine's Day Bouquet
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active)
VALUES
('Sweet Scent Valentine''s Day Bouquet', 'sweet-scent-valentines-day-bouquet', 'VDAY02',
 'Romantic bouquet with sweet fragrance.', 
 'Bouquet designed with scentful flowers.',
 399.00, 369.00, FLOOR(10 + (RAND() * 41)), 0, 1);

INSERT INTO product_categories (product_id, category_id) 
VALUES (LAST_INSERT_ID(), 11);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD03SweetScentscene2_1100x.jpg?v=1737102483', 'Sweet Scent Bouquet Scene', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD03SweetScentCloseup_1100x.jpg?v=1737102483', 'Sweet Scent Bouquet Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD03SweetScent_1100x.jpg?v=1737102483', 'Sweet Scent Bouquet', 0, 3);


-- Eternal Passion Valentine's Day Bouquet
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active)
VALUES
('Eternal Passion Valentine''s Day Bouquet', 'eternal-passion-valentines-day-bouquet', 'VDAY03',
 'Elegant bouquet symbolizing eternal passion.', 
 'Luxurious Valentine''s bouquet.',
 449.00, 399.00, FLOOR(10 + (RAND() * 41)), 0, 1);

INSERT INTO product_categories (product_id, category_id) 
VALUES (LAST_INSERT_ID(), 11);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD02EternalPassionFront_7dcd7042-e73e-4f2e-8749-2c29d8f50fd1_1100x.jpg?v=1737101782', 'Eternal Passion Bouquet Front', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD02EverlastingLoveCU_1100x.jpg?v=1737101736', 'Eternal Passion Bouquet Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/VD02EverlastingLove_b5137c4c-091b-4a90-aa21-9fdf5e8d6b58_1100x.jpg?v=1737101736', 'Eternal Passion Bouquet Scene', 0, 3);


-- Passion
INSERT INTO products
(name, slug, sku, description, short_description, price, stock_quantity, is_featured, is_active)
VALUES
('Passion', 'passion-floral-arrangement', 'VDAY04',
 'A beautifully crafted floral arrangement that lasts.', 
 'Simple and elegant Passion bouquet.',
 99.00, FLOOR(10 + (RAND() * 41)), 0, 1);

INSERT INTO product_categories (product_id, category_id) 
VALUES (LAST_INSERT_ID(), 11);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/05PassionPink_1100x.jpg?v=1723985819', 'Passion Bouquet Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/05PassionCloseup_1100x.jpg?v=1723985850', 'Passion Bouquet Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/05PassionScene_1100x.jpg?v=1723985850', 'Passion Bouquet Scene', 0, 3);

-- Twilight Blossom
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Twilight Blossom', 'twilight-blossom', 'TWILIGHT-001',
 'A mesmerizing arrangement inspired by the enchanting hues of dusk',
 'Twilight Blossom',
 398.00, -- price
 448.00, -- sale_price
 FLOOR(10 + (RAND() * 41)), 0, 1,
 398.00, 418.00, 438.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 12);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/01TwilightBlossom_576x.jpg?v=1741749214', 'Twilight Blossom Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/01TwilightBlossomScene_576x.jpg?v=1741749311', 'Twilight Blossom Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/01TwilightBlossomCloseup1_576x.jpg?v=1741749311', 'Twilight Blossom Closeup 1', 0, 3),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/01TwilightBlossomCloseup2_576x.jpg?v=1741749311', 'Twilight Blossom Closeup 2', 0, 4);

-- Lunar Blossom
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Lunar Blossom', 'lunar-blossom', 'LUNAR-001',
 'An ethereal charm radiating warmth and tranquility',
 'Lunar Blossom',
 308.00,
 338.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 308.00, 318.00, 328.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 12);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/02LunarBlossom_576x.jpg?v=1741756534', 'Lunar Blossom Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/02LunarBlossomScene_576x.jpg?v=1741756680', 'Lunar Blossom Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/02LunarBlossomCloseup_576x.jpg?v=1741756680', 'Lunar Blossom Closeup', 0, 3);

-- Mandarin Blossom
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Mandarin Blossom', 'mandarin-blossom', 'MANDARIN-001',
 'A vibrant blend of orange florals nestled in a finely adorned vase',
 'Mandarin Blossom',
 268.00,
 298.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 268.00, 278.00, 288.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 12);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/03MandarinBlossom_576x.jpg?v=1741757077', 'Mandarin Blossom Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/03MandarinBlossomScene_576x.jpg?v=1741757125', 'Mandarin Blossom Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/03MandarinBlossomCloseup_576x.jpg?v=1741757125', 'Mandarin Blossom Closeup', 0, 3);

-- Meadow Charm
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Meadow Charm', 'meadow-charm', 'MEADOW-001',
 'Nestled in a handwoven grass basket, this arrangement exudes countryside charm and natural beauty',
 'Meadow Charm',
 238.00,
 268.00,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 238.00, 248.00, 258.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 12);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/04MeadowCharm_576x.jpg?v=1741759725', 'Meadow Charm Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/04MeadowCharmScene_576x.jpg?v=1741760047', 'Meadow Charm Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/04MeadowCharmCloseup_576x.jpg?v=1741760047', 'Meadow Charm Closeup', 0, 3);

-- Eco Bell Pot XS
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Eco Bell Pot XS', 'eco-bell-pot-xs', 'ECO-XS-001',
 'Environmental friendly, light weight and break resistant pot',
 'Eco Bell Pot XS',
 16.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 16.00, 18.00, 20.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 18);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/EcoBellPotXSBeige_576x.jpg?v=1629258122', 'Eco Bell Pot XS Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/set23rainforestsetscene_0ca23056-1a4d-4040-89f0-f8d733fd43e1_576x.jpg?v=1629258384', 'Eco Bell Pot XS Scene', 0, 2);

-- Eco Bell Pot S
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Eco Bell Pot S', 'eco-bell-pot-s', 'ECO-S-001',
 'Environmental friendly, light weight and break resistant pot',
 'Eco Bell Pot S',
 20.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 20.00, 22.00, 24.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 18);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/EcoBellPotSBeige_576x.jpg?v=1629256672', 'Eco Bell Pot S Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/S24CalatheaFishboneScene_af606375-8a25-4701-b859-e8cd3e5ac2d4_576x.jpg?v=1629256695', 'Eco Bell Pot S Scene', 0, 2);

-- Eco Bell Pot M
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Eco Bell Pot M', 'eco-bell-pot-m', 'ECO-M-001',
 'Environmental friendly, light weight and break resistant pot',
 'Eco Bell Pot M',
 26.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 26.00, 28.00, 30.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 18);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/EcoBellPotMGrey_576x.jpg?v=1629257440', 'Eco Bell Pot M Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/M39MaranthaLeuconeuraScene_44f128b7-ab62-4373-9627-35cbf786614f_576x.jpg?v=1629257585', 'Eco Bell Pot M Scene', 0, 2);

-- Eco Bell Pot L
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Eco Bell Pot L', 'eco-bell-pot-l', 'ECO-L-001',
 'Environmental friendly, light weight and break resistant pot',
 'Eco Bell Pot L',
 34.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 34.00, 36.00, 38.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 18);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/EcoBellPotLBeige_ce4f203f-a38d-4459-9c5b-0605d5452a41_576x.jpg?v=1629516189', 'Eco Bell Pot L Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/L35FiddleLeafFigScene_576x.jpg?v=1629516189', 'Eco Bell Pot L Scene', 0, 2);

-- Shamrock Organic Fertilizer
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Shamrock Organic Fertilizer', 'shamrock-organic-fertilizer', 'FERT-001',
 '100% Natural, Plant-Based and Organic. Kids Safe, Pets Safe and Eco Safe. 1kg Pack.',
 'Shamrock Organic Fertilizer',
 22.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 22.00, 24.00, 26.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 17);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/IMG_7889_576x.jpg?v=1752382184', 'Shamrock Organic Fertilizer Main', 1, 1);

-- Shamrock Botanics Natural Pesticide
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Shamrock Botanics Natural Pesticide', 'shamrock-botanics-natural-pesticide', 'FERT-002',
 'All Purpose Natural Pest Spray. Kids Safe, Pets Safe and Eco Safe. 500ml pack.',
 'Shamrock Botanics Natural Pesticide',
 25.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 25.00, 27.00, 29.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 17);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/IMG_7901_576x.jpg?v=1752382183', 'Shamrock Botanics Natural Pesticide Main', 1, 1);

-- Premium Aroid Mix
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Premium Aroid Mix', 'premium-aroid-mix', 'FERT-003',
 'A handful of chunky goodness specially blended for Aroids',
 'Premium Aroid Mix',
 18.90, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 18.90, 20.90, 22.90
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 17);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/PremiumAroidMix_576x.jpg?v=1752382153', 'Premium Aroid Mix Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/PremiumAroidMixCloseup_576x.jpg?v=1752382153', 'Premium Aroid Mix Closeup', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/IMG_6140_275264cc-2eb0-4fb8-ba8d-3b7ffbb3741c_576x.jpg?v=1752382153', 'Premium Aroid Mix Scene', 0, 3);

-- All Purpose Foliar Fertilizer
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('All Purpose Foliar Fertilizer', 'all-purpose-foliar-fertilizer', 'FERT-004',
 'Unlock Nature''s Secret to Thriving Plants with Seaweed Power!',
 'All Purpose Foliar Fertilizer',
 24.90, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 24.90, 26.90, 28.90
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 17);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Allpurposefoliarfertiliser_576x.png?v=1752382144', 'All Purpose Foliar Fertilizer Main', 1, 1);

-- Vita™ Growlight
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Vita™ Growlight', 'vita-growlight', 'GROW-001',
 'Best in class growlight that can be fitted with any traditional light fixture at home',
 'Vita™ Growlight',
 399.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 399.00, 449.00, 499.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 16);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/3a_576x.jpg?v=1752382139', 'Vita™ Growlight Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/1a_576x.jpg?v=1752382139', 'Vita™ Growlight Scene 1', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/office-shot-Vita-narrow_600x_095bd389-d7d9-4732-bdb4-185de83d39fe_576x.jpg?v=1752382139', 'Vita™ Growlight Scene 2', 0, 3),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Kitchen1_600x_ead76d02-50c4-46c0-80a1-47d8bf62a041_576x.jpg?v=1752382139', 'Vita™ Growlight Scene 3', 0, 4),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/alltheplantbabies_600x_fa044aee-a635-4454-b9b3-34d792b26258_576x.jpg?v=1752382139', 'Vita™ Growlight Scene 4', 0, 5);

-- Grove™ Growlight
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Grove™ Growlight', 'grove-growlight', 'GROW-002',
 'Touch activated growlight that is perfect for tight spaces',
 'Grove™ Growlight',
 1099.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 1099.00, 1149.00, 1199.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 16);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Grove-Bar-Light-White-_1_576x.jpg?v=1752382134', 'Grove™ Growlight Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Cabinet5_576x.jpg?v=1752382134', 'Grove™ Growlight Scene 1', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/GlassCabinet1_576x.jpg?v=1752382134', 'Grove™ Growlight Scene 2', 0, 3),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/WallMounted3_576x.jpg?v=1752382134', 'Grove™ Growlight Scene 3', 0, 4),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Cabinet11_576x.jpg?v=1752382135', 'Grove™ Growlight Scene 4', 0, 5);

-- Aspect™ Growlight
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Aspect™ Growlight', 'aspect-growlight', 'GROW-003',
 'Pendant style growlight that blends in perfectly with your home decor',
 'Aspect™ Growlight',
 1099.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 1099.00, 1149.00, 1199.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 16);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Small-Aspect-Plant-Light-White-Hanging_576x.jpg?v=1752382141', 'Aspect™ Growlight Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Aspect-Grow-Light-White-Hanging_576x.jpg?v=1752382140', 'Aspect™ Growlight Scene 1', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/Pinocchio_2_600x_1_576x.jpg?v=1752382140', 'Aspect™ Growlight Scene 2', 0, 3);

-- Pinocchio - Adjustable Wall Mount
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Pinocchio - Adjustable Wall Mount', 'pinocchio-adjustable-wall-mount', 'GROW-004',
 'Made with your space in mind, this fixture pairs well with Aspect™ growlight',
 'Pinocchio - Adjustable Wall Mount',
 179.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 179.00, 189.00, 199.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 16);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/24a_576x.jpg?v=1752382138', 'Pinocchio Wall Mount Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/dalebiz_600x_d1d76e22-5989-4062-904b-0eb93442dc29_576x.jpg?v=1752382138', 'Pinocchio Wall Mount Scene 1', 0, 2);

-- Narrabeen Moss Decor
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Narrabeen Moss Decor', 'narrabeen-moss-decor', 'DECOR-001',
 'Elegant moss centerpiece decor',
 'Narrabeen Moss Decor',
 589.00, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 589.00, 629.00, 669.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 13);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG086NarrabeenMossDecor_1100x.jpg?v=1729817598', 'Narrabeen Moss Decor Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/4181CEB1-CC5A-4C81-947D-8CD7AD7C5B9A.jpg?v=1731645045', 'Narrabeen Moss Decor Scene 1', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/PG086NarrabeenMossDecorCloseup2_1100x.jpg?v=1729817598', 'Narrabeen Moss Decor Closeup', 0, 3);

-- Plant Charm Pin
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Plant Charm Pin', 'plant-charm-pin', 'GIFT-001',
 'Cute plant enamel pin gift',
 'Plant Charm Pin',
 19.90, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 19.90, 22.00, 25.00
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 13);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/50PlantCharmPinsOxalis_1100x.jpg?v=1752382133', 'Plant Charm Pin Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/50PlantCharmPinsscene1_9aba96bd-70e1-445f-859c-3b3479f2d7c6_1100x.jpg?v=1752382133', 'Plant Charm Pin Scene 1', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/50PlantCharmPinsscene2_d8000a26-92f5-485e-9b1b-7ac03ec14d84_1100x.jpg?v=1752382133', 'Plant Charm Pin Scene 2', 0, 3);

-- Airplant Hercules
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Airplant Hercules', 'airplant-hercules', 'PLANT-001',
 'Easy care air plant gift',
 'Airplant Hercules',
 35.90, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 35.90, 39.90, 44.90
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 13);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/IMG_2533_1100x.jpg?v=1623208676', 'Airplant Hercules Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/products/19AirplantHercules2_1100x.jpg?v=1623208963', 'Airplant Hercules Scene', 0, 2);

-- Succulent Teacup
INSERT INTO products
(name, slug, sku, description, short_description, price, sale_price, stock_quantity, is_featured, is_active, price_small, price_medium, price_large)
VALUES
('Succulent Teacup', 'succulent-teacup', 'PLANT-002',
 'Festive succulent teacup set',
 'Succulent Teacup',
 45.90, NULL,
 FLOOR(10 + (RAND() * 41)), 0, 1,
 45.90, 49.90, 54.90
);

INSERT INTO product_categories (product_id, category_id) VALUES
(LAST_INSERT_ID(), 13);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/43xmassucculentteacupoption2_1100x.jpg?v=1699062910', 'Succulent Teacup Main', 1, 1),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/43xmassucculentteacupset_1100x.jpg?v=1699062910', 'Succulent Teacup Set Scene', 0, 2),
(LAST_INSERT_ID(), 'https://www.bloomspace.co/cdn/shop/files/43xmassucculentteacupscene_1100x.jpg?v=1699062910', 'Succulent Teacup Scene', 0, 3);