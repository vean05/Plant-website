<?php
/**
 * Product Detail API
 * GET /api/products/detail.php?id={product_id}
 */

require_once '../../config/database.php';

// Get product ID
$product_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$product_id) {
    sendErrorResponse('Product ID is required');
}

try {
    // Get product details
    $product_sql = "SELECT p.*, 
                           pi.image_url as primary_image, pi.alt_text as image_alt
                    FROM products p
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                    WHERE p.id = ? AND p.is_active = 1";
    
    $product = Database::fetch($product_sql, [$product_id]);
    
    if (!$product) {
        sendErrorResponse('Product not found', 404);
    }
    
    // Get product images
    $images_sql = "SELECT image_url, alt_text, sort_order, is_primary
                   FROM product_images
                   WHERE product_id = ?
                   ORDER BY sort_order, id";
    
    $images = Database::fetchAll($images_sql, [$product_id]);
    
    // Get product categories
    $categories_sql = "SELECT c.id, c.name, c.slug
                       FROM categories c
                       JOIN product_categories pc ON c.id = pc.category_id
                       WHERE pc.product_id = ? AND c.is_active = 1
                       ORDER BY c.name";
    
    $categories = Database::fetchAll($categories_sql, [$product_id]);
    
    // Get product reviews
    $reviews_sql = "SELECT r.id, r.rating, r.title, r.comment, r.is_verified_purchase, 
                           r.helpful_count, r.created_at,
                           u.first_name, u.last_name
                    FROM reviews r
                    JOIN users u ON r.user_id = u.id
                    WHERE r.product_id = ? AND r.is_approved = 1
                    ORDER BY r.created_at DESC
                    LIMIT 10";
    
    $reviews = Database::fetchAll($reviews_sql, [$product_id]);
    
    // Get average rating and review count
    $rating_sql = "SELECT AVG(rating) as average_rating, COUNT(*) as review_count
                   FROM reviews
                   WHERE product_id = ? AND is_approved = 1";
    
    $rating_data = Database::fetch($rating_sql, [$product_id]);
    
    // Get related products (same categories)
    $related_sql = "SELECT DISTINCT p.id, p.name, p.slug, p.price, p.sale_price, 
                           pi.image_url as primary_image, pi.alt_text as image_alt
                    FROM products p
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                    JOIN product_categories pc ON p.id = pc.product_id
                    WHERE pc.category_id IN (
                        SELECT category_id FROM product_categories WHERE product_id = ?
                    )
                    AND p.id != ? AND p.is_active = 1
                    ORDER BY p.is_featured DESC, p.created_at DESC
                    LIMIT 4";
    
    $related_products = Database::fetchAll($related_sql, [$product_id, $product_id]);
    
    // Format product data
    $formatted_product = [
        'id' => (int)$product['id'],
        'name' => $product['name'],
        'slug' => $product['slug'],
        'description' => $product['description'],
        'short_description' => $product['short_description'],
        'sku' => $product['sku'],
        'price' => (float)$product['price'],
        'sale_price' => $product['sale_price'] ? (float)$product['sale_price'] : null,
        'formatted_price' => formatPrice($product['price']),
        'formatted_sale_price' => $product['sale_price'] ? formatPrice($product['sale_price']) : null,
        'cost_price' => $product['cost_price'] ? (float)$product['cost_price'] : null,
        'stock_quantity' => (int)$product['stock_quantity'],
        'manage_stock' => (bool)$product['manage_stock'],
        'stock_status' => $product['stock_status'],
        'in_stock' => $product['stock_status'] === 'instock',
        'weight' => $product['weight'] ? (float)$product['weight'] : null,
        'dimensions' => $product['dimensions'],
        'care_instructions' => $product['care_instructions'],
        'difficulty_level' => $product['difficulty_level'],
        'light_requirements' => $product['light_requirements'],
        'watering_frequency' => $product['watering_frequency'],
        'pet_friendly' => (bool)$product['pet_friendly'],
        'air_purifying' => (bool)$product['air_purifying'],
        'is_featured' => (bool)$product['is_featured'],
        'meta_title' => $product['meta_title'],
        'meta_description' => $product['meta_description'],
        'created_at' => $product['created_at'],
        'updated_at' => $product['updated_at'],
        'images' => array_map(function($img) {
            return [
                'url' => $img['image_url'],
                'alt' => $img['alt_text'],
                'sort_order' => (int)$img['sort_order'],
                'is_primary' => (bool)$img['is_primary']
            ];
        }, $images),
        'categories' => array_map(function($cat) {
            return [
                'id' => (int)$cat['id'],
                'name' => $cat['name'],
                'slug' => $cat['slug']
            ];
        }, $categories),
        'reviews' => [
            'average_rating' => $rating_data['average_rating'] ? round((float)$rating_data['average_rating'], 1) : 0,
            'review_count' => (int)$rating_data['review_count'],
            'recent_reviews' => array_map(function($review) {
                return [
                    'id' => (int)$review['id'],
                    'rating' => (int)$review['rating'],
                    'title' => $review['title'],
                    'comment' => $review['comment'],
                    'is_verified_purchase' => (bool)$review['is_verified_purchase'],
                    'helpful_count' => (int)$review['helpful_count'],
                    'author_name' => $review['first_name'] . ' ' . $review['last_name'],
                    'created_at' => $review['created_at']
                ];
            }, $reviews)
        ],
        'related_products' => array_map(function($related) {
            return [
                'id' => (int)$related['id'],
                'name' => $related['name'],
                'slug' => $related['slug'],
                'price' => (float)$related['price'],
                'sale_price' => $related['sale_price'] ? (float)$related['sale_price'] : null,
                'formatted_price' => formatPrice($related['price']),
                'formatted_sale_price' => $related['sale_price'] ? formatPrice($related['sale_price']) : null,
                'primary_image' => $related['primary_image'],
                'image_alt' => $related['image_alt']
            ];
        }, $related_products)
    ];
    
    sendSuccessResponse('Product details retrieved successfully', $formatted_product);
    
} catch (Exception $e) {
    error_log("Product detail error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve product details');
}
?>
