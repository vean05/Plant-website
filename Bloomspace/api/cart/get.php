<?php
/**
 * Get Cart API
 * GET /api/cart/get.php
 */

// Set JSON header
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../../config/database.php';
} catch (Exception $e) {
    sendErrorResponse('Database configuration failed: ' . $e->getMessage());
}

// Get user ID from session (if logged in)
$user_id = null;
$session_id = null;

// Check if user is logged in
if (isset($_COOKIE['bloomspace_session'])) {
    $session_token = $_COOKIE['bloomspace_session'];
    // In a real implementation, you'd validate the session token
    $user_id = 1; // This should be retrieved from session validation
}

// If not logged in, use session ID
if (!$user_id) {
    $session_id = $_COOKIE['bloomspace_session_id'] ?? null;
}

if (!$user_id && !$session_id) {
    sendSuccessResponse('Cart is empty', [
        'items' => [],
        'subtotal' => 0,
        'formatted_subtotal' => 'RM 0.00',
        'item_count' => 0
    ]);
}

try {
    // Get cart items with product details
    $cart_sql = "SELECT c.id, c.product_id, c.quantity, c.price,
                        p.name, p.slug, p.sku, p.stock_quantity, p.stock_status,
                        pi.image_url as primary_image, pi.alt_text as image_alt
                 FROM cart c
                 JOIN products p ON c.product_id = p.id
                 LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                 WHERE " . ($user_id ? "c.user_id = ?" : "c.session_id = ?");
    
    $cart_items = Database::fetchAll($cart_sql, [$user_id ?: $session_id]);
    
    // Format cart items
    $formatted_items = array_map(function($item) {
        $total = $item['quantity'] * $item['price'];
        return [
            'id' => (int)$item['id'],
            'product_id' => (int)$item['product_id'],
            'name' => $item['name'],
            'slug' => $item['slug'],
            'sku' => $item['sku'],
            'quantity' => (int)$item['quantity'],
            'price' => (float)$item['price'],
            'total' => (float)$total,
            'formatted_price' => formatPrice($item['price']),
            'formatted_total' => formatPrice($total),
            'stock_quantity' => (int)$item['stock_quantity'],
            'stock_status' => $item['stock_status'],
            'in_stock' => $item['stock_status'] === 'instock',
            'primary_image' => $item['primary_image'],
            'image_alt' => $item['image_alt']
        ];
    }, $cart_items);
    
    // Calculate totals
    $subtotal = array_sum(array_column($formatted_items, 'total'));
    $item_count = array_sum(array_column($formatted_items, 'quantity'));
    
    // Get site settings for shipping threshold
    $shipping_threshold = Database::fetch(
        "SELECT setting_value FROM site_settings WHERE setting_key = 'free_shipping_threshold'"
    );
    $free_shipping_threshold = $shipping_threshold ? (float)$shipping_threshold['setting_value'] : 150;
    
    // Calculate shipping
    $shipping_amount = $subtotal >= $free_shipping_threshold ? 0 : 15; // RM15 shipping fee
    
    // Calculate tax (6% in Malaysia)
    $tax_rate = 0.06;
    $tax_amount = $subtotal * $tax_rate;
    
    // Calculate total
    $total = $subtotal + $shipping_amount + $tax_amount;
    
    $response_data = [
        'items' => $formatted_items,
        'subtotal' => (float)$subtotal,
        'formatted_subtotal' => formatPrice($subtotal),
        'shipping_amount' => (float)$shipping_amount,
        'formatted_shipping' => formatPrice($shipping_amount),
        'tax_amount' => (float)$tax_amount,
        'formatted_tax' => formatPrice($tax_amount),
        'total' => (float)$total,
        'formatted_total' => formatPrice($total),
        'item_count' => (int)$item_count,
        'free_shipping_threshold' => (float)$free_shipping_threshold,
        'free_shipping_eligible' => $subtotal >= $free_shipping_threshold,
        'remaining_for_free_shipping' => max(0, $free_shipping_threshold - $subtotal),
        'formatted_remaining' => formatPrice(max(0, $free_shipping_threshold - $subtotal))
    ];
    
    sendSuccessResponse('Cart retrieved successfully', $response_data);
    
} catch (Exception $e) {
    error_log("Get cart error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve cart');
}
?>
