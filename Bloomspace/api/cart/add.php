<?php
/**
 * Add to Cart API
 * POST /api/cart/add.php
 */

require_once '../../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['product_id']) || empty($input['quantity'])) {
    sendErrorResponse('Product ID and quantity are required');
}

$product_id = intval($input['product_id']);
$quantity = intval($input['quantity']);

if ($product_id <= 0 || $quantity <= 0) {
    sendErrorResponse('Invalid product ID or quantity');
}

// Get user ID from session (if logged in)
require_once '../auth/validate-session.php';

$user_id = getCurrentUserId();
$session_id = null;

// If not logged in, use session ID
if (!$user_id) {
    if (!isset($_COOKIE['bloomspace_session_id'])) {
        $session_id = generateToken();
        setcookie('bloomspace_session_id', $session_id, time() + (30 * 24 * 60 * 60), '/', '', false, true);
    } else {
        $session_id = $_COOKIE['bloomspace_session_id'];
    }
}

try {
    // Check if product exists and is available
    $product = Database::fetch(
        "SELECT id, name, price, sale_price, stock_quantity, stock_status, is_active 
         FROM products WHERE id = ? AND is_active = 1",
        [$product_id]
    );
    
    if (!$product) {
        sendErrorResponse('Product not found');
    }
    
    if ($product['stock_status'] !== 'instock') {
        sendErrorResponse('Product is out of stock');
    }
    
    if ($product['stock_quantity'] < $quantity) {
        sendErrorResponse('Insufficient stock. Available: ' . $product['stock_quantity']);
    }
    
    // Calculate price (use sale price if available)
    $price = $product['sale_price'] ? $product['sale_price'] : $product['price'];
    
    // Check if item already exists in cart
    $existing_item = null;
    if ($user_id) {
        $existing_item = Database::fetch(
            "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [$user_id, $product_id]
        );
    } else {
        $existing_item = Database::fetch(
            "SELECT id, quantity FROM cart WHERE session_id = ? AND product_id = ?",
            [$session_id, $product_id]
        );
    }
    
    if ($existing_item) {
        // Update existing item
        $new_quantity = $existing_item['quantity'] + $quantity;
        
        if ($new_quantity > $product['stock_quantity']) {
            sendErrorResponse('Cannot add more items. Available: ' . $product['stock_quantity']);
        }
        
        Database::query(
            "UPDATE cart SET quantity = ?, price = ?, updated_at = NOW() WHERE id = ?",
            [$new_quantity, $price, $existing_item['id']]
        );
        
        $message = 'Item quantity updated in cart';
    } else {
        // Add new item
        Database::query(
            "INSERT INTO cart (user_id, session_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)",
            [$user_id, $session_id, $product_id, $quantity, $price]
        );
        
        $message = 'Item added to cart successfully';
    }
    
    // Get updated cart count
    $cart_count_sql = $user_id 
        ? "SELECT COUNT(*) as count FROM cart WHERE user_id = ?"
        : "SELECT COUNT(*) as count FROM cart WHERE session_id = ?";
    
    $cart_count = Database::fetch($cart_count_sql, [$user_id ?: $session_id]);
    
    // Get cart total
    $cart_total_sql = $user_id
        ? "SELECT SUM(quantity * price) as total FROM cart WHERE user_id = ?"
        : "SELECT SUM(quantity * price) as total FROM cart WHERE session_id = ?";
    
    $cart_total = Database::fetch($cart_total_sql, [$user_id ?: $session_id]);
    
    sendSuccessResponse($message, [
        'cart_count' => (int)$cart_count['count'],
        'cart_total' => $cart_total['total'] ? (float)$cart_total['total'] : 0,
        'formatted_total' => $cart_total['total'] ? formatPrice($cart_total['total']) : 'RM 0.00'
    ]);
    
} catch (Exception $e) {
    error_log("Add to cart error: " . $e->getMessage());
    sendErrorResponse('Failed to add item to cart');
}
?>
