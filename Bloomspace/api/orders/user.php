<?php
/**
 * User Orders API
 * GET /api/orders/user.php - Get user orders
 */

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/auth/validate-session.php';

// Set CORS headers
setCorsHeaders();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Get current user ID
    $user_id = getCurrentUserId();
    
    if (!$user_id) {
        sendErrorResponse('User not logged in', 401);
    }

    // Get user orders with items
    $orders = Database::fetchAll(
        "SELECT o.*, 
                COUNT(oi.id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC",
        [$user_id]
    );

        // Get order items for each order
        foreach ($orders as &$order) {
            $order_items = Database::fetchAll(
                "SELECT oi.*, p.name as product_name, pi.image_url, (oi.quantity * oi.price) as total_price
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                 WHERE oi.order_id = ?
                 ORDER BY oi.created_at",
                [$order['id']]
            );
            
            $order['items'] = $order_items;
        
        // Parse JSON fields
        $order['payment_details'] = $order['payment_details'] ? json_decode($order['payment_details'], true) : null;
        $order['shipping_address'] = $order['shipping_address'] ? json_decode($order['shipping_address'], true) : null;
        $order['billing_address'] = $order['billing_address'] ? json_decode($order['billing_address'], true) : null;
    }

    sendSuccessResponse('Orders retrieved successfully', $orders);

} catch (Exception $e) {
    error_log("User Orders API error: " . $e->getMessage());
    sendErrorResponse('An error occurred while processing your request');
}
?>
