<?php
/**
 * Products List API
 * GET /api/products/list.php
 */

// Set JSON header
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once dirname(__DIR__, 2) . '/config/database.php';
} catch (Exception $e) {
    sendErrorResponse('Database configuration failed: ' . $e->getMessage());
}

// Get query parameters
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 12;
$category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
$sort = isset($_GET['sort']) ? sanitizeInput($_GET['sort']) : 'created_at';
$order = isset($_GET['order']) ? sanitizeInput($_GET['order']) : 'DESC';
$min_price = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
$max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
$featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;

// Validate sort field
$allowed_sorts = ['name', 'price', 'created_at', 'rating'];
if (!in_array($sort, $allowed_sorts)) {
    $sort = 'created_at';
}

// Validate order
$order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';

try {
    // Build WHERE clause
    $where_conditions = ["p.is_active = 1"];
    $params = [];
    
    if ($category) {
        $where_conditions[] = "c.slug = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $where_conditions[] = "(p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)";
        $search_term = "%$search%";
        $params[] = $search_term;
        $params[] = $search_term;
        $params[] = $search_term;
    }
    
    if ($min_price !== null) {
        $where_conditions[] = "p.price >= ?";
        $params[] = $min_price;
    }
    
    if ($max_price !== null) {
        $where_conditions[] = "p.price <= ?";
        $params[] = $max_price;
    }
    
    if ($featured !== null) {
        $where_conditions[] = "p.is_featured = ?";
        $params[] = $featured ? 1 : 0;
    }
    
    $where_clause = implode(' AND ', $where_conditions);
    
    // Count total products
    $count_sql = "SELECT COUNT(DISTINCT p.id) as total 
                  FROM products p 
                  LEFT JOIN product_categories pc ON p.id = pc.product_id 
                  LEFT JOIN categories c ON pc.category_id = c.id 
                  WHERE $where_clause";
    
    $total_result = Database::fetch($count_sql, $params);
    $total_products = $total_result['total'];
    $total_pages = ceil($total_products / $limit);
    $offset = ($page - 1) * $limit;
    
    // Get products with images and categories
    $sql = "SELECT DISTINCT p.id, p.name, p.slug, p.description, p.short_description, p.sku, p.price, p.sale_price, 
                   p.price_small, p.price_medium, p.price_large,
                   p.stock_quantity, p.stock_status, p.is_featured, p.difficulty_level, 
                   p.light_requirements, p.pet_friendly, p.air_purifying,
                   pi.image_url as primary_image, pi.alt_text as image_alt,
                   pi2.image_url as secondary_image, pi2.alt_text as secondary_image_alt,
                   GROUP_CONCAT(DISTINCT c.name) as categories,
                   GROUP_CONCAT(DISTINCT c.id) as category_ids,
                   AVG(r.rating) as average_rating,
                   COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            LEFT JOIN product_images pi2 ON p.id = pi2.product_id AND pi2.is_primary = 0 AND pi2.sort_order = 2
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
            WHERE $where_clause
            GROUP BY p.id
            ORDER BY p.$sort $order
            LIMIT $limit OFFSET $offset";
    
    $products = Database::fetchAll($sql, $params);
    
    // Format products
    $formatted_products = array_map(function($product) {
        return [
            'id' => (int)$product['id'],
            'name' => $product['name'],
            'slug' => $product['slug'],
            'description' => $product['description'] ?: $product['short_description'],
            'short_description' => $product['short_description'],
            'sku' => $product['sku'],
            'price' => (float)$product['price'],
            'sale_price' => $product['sale_price'] ? (float)$product['sale_price'] : null,
            'formatted_price' => formatPrice($product['price']),
            'formatted_sale_price' => $product['sale_price'] ? formatPrice($product['sale_price']) : null,
            'price_small' => isset($product['price_small']) && $product['price_small'] !== null ? (float)$product['price_small'] : null,
            'price_medium' => isset($product['price_medium']) && $product['price_medium'] !== null ? (float)$product['price_medium'] : null,
            'price_large' => isset($product['price_large']) && $product['price_large'] !== null ? (float)$product['price_large'] : null,
            'formatted_price_small' => $product['price_small'] ? formatPrice($product['price_small']) : null,
            'formatted_price_medium' => $product['price_medium'] ? formatPrice($product['price_medium']) : null,
            'formatted_price_large' => $product['price_large'] ? formatPrice($product['price_large']) : null,
            'stock_quantity' => (int)$product['stock_quantity'],
            'stock_status' => $product['stock_status'],
            'in_stock' => $product['stock_status'] === 'instock',
            'is_featured' => (bool)$product['is_featured'],
            'difficulty_level' => $product['difficulty_level'],
            'light_requirements' => $product['light_requirements'],
            'pet_friendly' => (bool)$product['pet_friendly'],
            'air_purifying' => (bool)$product['air_purifying'],
            'primary_image' => $product['primary_image'],
            'image_alt' => $product['image_alt'],
            'secondary_image' => $product['secondary_image'],
            'secondary_image_alt' => $product['secondary_image_alt'],
            'categories' => $product['categories'] ? explode(',', $product['categories']) : [],
            'category_ids' => $product['category_ids'] ? array_map('intval', explode(',', $product['category_ids'])) : [],
            'average_rating' => $product['average_rating'] ? round((float)$product['average_rating'], 1) : 0,
            'review_count' => (int)$product['review_count']
        ];
    }, $products);
    
    // Get categories for filters
    $categories_sql = "SELECT c.id, c.name, c.slug, COUNT(pc.product_id) as product_count
                       FROM categories c
                       LEFT JOIN product_categories pc ON c.id = pc.category_id
                       LEFT JOIN products p ON pc.product_id = p.id AND p.is_active = 1
                       WHERE c.is_active = 1
                       GROUP BY c.id, c.name, c.slug
                       HAVING product_count > 0
                       ORDER BY c.name";
    
    $categories = Database::fetchAll($categories_sql);
    
    // Response data
    $response_data = [
        'products' => $formatted_products,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_products' => $total_products,
            'per_page' => $limit,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ],
        'filters' => [
            'categories' => $categories,
            'price_range' => [
                'min' => 0,
                'max' => 1000
            ]
        ]
    ];
    
    sendSuccessResponse('Products retrieved successfully', $response_data);
    
} catch (Exception $e) {
    error_log("Products list error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve products');
}
?>
