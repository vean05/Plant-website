<?php
/**
 * Order History API
 * Get order history for the current user
 */

require_once '../../config/database.php';
require_once '../auth/validate-session.php';

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
    
    // Get query parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM orders WHERE user_id = ?";
    $total_result = Database::fetch($count_sql, [$user_id]);
    $total_orders = $total_result['total'];
    $total_pages = ceil($total_orders / $limit);
    
    // Get orders with pagination
    $orders_sql = "
        SELECT 
            o.id,
            o.order_number,
            o.payment_method,
            o.payment_details,
            o.subtotal,
            o.tax_amount,
            o.shipping_amount,
            o.discount_amount,
            o.total_amount,
            o.shipping_address,
            o.billing_address,
            o.notes,
            o.status,
            o.created_at,
            o.updated_at,
            u.first_name,
            u.last_name,
            u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $orders = Database::fetchAll($orders_sql, [$user_id, $limit, $offset]);
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $items_sql = "
            SELECT 
                oi.id,
                oi.product_id,
                oi.quantity,
                oi.price,
                oi.total_price,
                p.name as product_name,
                p.image_url,
                p.description
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ";
        
        $order['items'] = Database::fetchAll($items_sql, [$order['id']]);
        
        // Parse JSON fields
        $order['payment_details'] = $order['payment_details'] ? json_decode($order['payment_details'], true) : null;
        $order['shipping_address'] = $order['shipping_address'] ? json_decode($order['shipping_address'], true) : null;
        $order['billing_address'] = $order['billing_address'] ? json_decode($order['billing_address'], true) : null;
    }
    
    // Prepare response
    $response_data = [
        'success' => true,
        'orders' => $orders,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_orders' => $total_orders,
            'per_page' => $limit,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ]
    ];
    
    sendSuccessResponse($response_data);
    
} catch (Exception $e) {
    error_log("Order history error: " . $e->getMessage());
    sendErrorResponse('Failed to fetch order history: ' . $e->getMessage());
}
?>
