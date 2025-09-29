<?php
/**
 * Create Order API
 * POST /api/orders/create.php
 */

require_once '../../config/database.php';

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['shipping_address', 'billing_address', 'payment_method', 'cart_items'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendErrorResponse("Field '$field' is required");
    }
}

// Get user ID from session (optional for guest checkout)
require_once '../auth/validate-session.php';

$user_id = getCurrentUserId();
$session_id = null;

if (!$user_id) {
    $session_id = $_COOKIE['bloomspace_session_id'] ?? 'guest_' . time();
}

try {
    // Get cart items from input
    $cart_items = $input['cart_items'];
    
    if (empty($cart_items)) {
        sendErrorResponse('Cart is empty');
    }
    
    // Validate and enrich cart items with product data
    $enriched_cart_items = [];
    foreach ($cart_items as $item) {
        // Get product details from database
        $product = Database::fetch(
            "SELECT id, name, sku, stock_quantity, stock_status, price, sale_price 
             FROM products WHERE id = ? AND is_active = 1",
            [$item['id']]
        );
        
        if (!$product) {
            sendErrorResponse("Product with ID {$item['id']} not found");
        }
        
        if ($product['stock_status'] !== 'instock') {
            sendErrorResponse("Product '{$product['name']}' is out of stock");
        }
        
        if ($product['stock_quantity'] < $item['quantity']) {
            sendErrorResponse("Insufficient stock for '{$product['name']}'. Available: {$product['stock_quantity']}");
        }
        
        // Use sale price if available, otherwise use regular price
        $price = $product['sale_price'] ? $product['sale_price'] : $product['price'];
        
        $enriched_cart_items[] = [
            'product_id' => $product['id'],
            'name' => $product['name'],
            'sku' => $product['sku'],
            'quantity' => $item['quantity'],
            'price' => $price,
            'stock_quantity' => $product['stock_quantity'],
            'stock_status' => $product['stock_status']
        ];
    }
    
    $cart_items = $enriched_cart_items;
    
    // Validate stock availability
    foreach ($cart_items as $item) {
        if ($item['stock_status'] !== 'instock') {
            sendErrorResponse("Product '{$item['name']}' is out of stock");
        }
        if ($item['stock_quantity'] < $item['quantity']) {
            sendErrorResponse("Insufficient stock for '{$item['name']}'. Available: {$item['stock_quantity']}");
        }
    }
    
    // Begin transaction
    Database::beginTransaction();
    
    // Calculate totals
    $subtotal = array_sum(array_map(function($item) {
        return $item['quantity'] * $item['price'];
    }, $cart_items));
    
    // Get site settings
    $settings = Database::fetchAll("SELECT setting_key, setting_value FROM site_settings");
    $site_settings = [];
    foreach ($settings as $setting) {
        $site_settings[$setting['setting_key']] = $setting['setting_value'];
    }
    
    $free_shipping_threshold = (float)($site_settings['free_shipping_threshold'] ?? 150);
    $tax_rate = (float)($site_settings['tax_rate'] ?? 6) / 100;
    
    // Calculate shipping
    $shipping_amount = $subtotal >= $free_shipping_threshold ? 0 : 15;
    
    // Calculate tax
    $tax_amount = $subtotal * $tax_rate;
    
    // Apply coupon if provided
    $discount_amount = 0;
    if (!empty($input['coupon_code'])) {
        $coupon = Database::fetch(
            "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())",
            [$input['coupon_code']]
        );
        
        if ($coupon) {
            if ($subtotal >= $coupon['minimum_amount']) {
                if ($coupon['type'] === 'fixed') {
                    $discount_amount = min($coupon['value'], $subtotal);
                } else {
                    $discount_amount = $subtotal * ($coupon['value'] / 100);
                    if ($coupon['maximum_discount']) {
                        $discount_amount = min($discount_amount, $coupon['maximum_discount']);
                    }
                }
            }
        }
    }
    
    // Calculate total
    $total_amount = $subtotal + $shipping_amount + $tax_amount - $discount_amount;
    
    // Generate order number
    $order_number = 'BS' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    // Prepare payment details
    $payment_details = null;
    if (!empty($input['payment_details'])) {
        $payment_details = json_encode($input['payment_details']);
    }
    
    // Create order
    $order_sql = "INSERT INTO orders (order_number, user_id, payment_method, payment_details, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, shipping_address, billing_address, notes) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    Database::query($order_sql, [
        $order_number,
        $user_id,
        $input['payment_method'],
        $payment_details,
        $subtotal,
        $tax_amount,
        $shipping_amount,
        $discount_amount,
        $total_amount,
        json_encode($input['shipping_address']),
        json_encode($input['billing_address']),
        $input['notes'] ?? null
    ]);
    
    $order_id = Database::lastInsertId();
    
    // Create order items and update stock
    foreach ($cart_items as $item) {
        $item_total = $item['quantity'] * $item['price'];
        
        // Insert order item
        Database::query(
            "INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total) 
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [$order_id, $item['product_id'], $item['name'], $item['sku'], $item['quantity'], $item['price'], $item_total]
        );
        
        // Update stock
        Database::query(
            "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
            [$item['quantity'], $item['product_id']]
        );
    }
    
    // Record coupon usage
    if ($discount_amount > 0) {
        Database::query(
            "INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)",
            [$coupon['id'], $user_id, $order_id, $discount_amount]
        );
        
        // Update coupon usage count
        Database::query(
            "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
            [$coupon['id']]
        );
    }
    
    // Clear cart
    $clear_cart_sql = $user_id 
        ? "DELETE FROM cart WHERE user_id = ?"
        : "DELETE FROM cart WHERE session_id = ?";
    
    Database::query($clear_cart_sql, [$user_id ?: $session_id]);
    
    // Commit transaction
    Database::commit();
    
    // Get order details for response
    $order = Database::fetch(
        "SELECT * FROM orders WHERE id = ?",
        [$order_id]
    );
    
    $order_items = Database::fetchAll(
        "SELECT * FROM order_items WHERE order_id = ?",
        [$order_id]
    );
    
    $response_data = [
        'order_id' => (int)$order_id,
        'order_number' => $order['order_number'],
        'status' => $order['status'],
        'payment_status' => $order['payment_status'],
        'payment_method' => $order['payment_method'],
        'payment_details' => $order['payment_details'] ? json_decode($order['payment_details'], true) : null,
        'subtotal' => (float)$order['subtotal'],
        'tax_amount' => (float)$order['tax_amount'],
        'shipping_amount' => (float)$order['shipping_amount'],
        'discount_amount' => (float)$order['discount_amount'],
        'total_amount' => (float)$order['total_amount'],
        'formatted_total' => formatPrice($order['total_amount']),
        'items' => array_map(function($item) {
            return [
                'product_id' => (int)$item['product_id'],
                'product_name' => $item['product_name'],
                'product_sku' => $item['product_sku'],
                'quantity' => (int)$item['quantity'],
                'price' => (float)$item['price'],
                'total' => (float)$item['total']
            ];
        }, $order_items),
        'created_at' => $order['created_at']
    ];
    
    sendSuccessResponse('Order created successfully', $response_data);
    
} catch (Exception $e) {
    // Rollback transaction
    Database::rollback();
    
    error_log("Create order error: " . $e->getMessage());
    error_log("Create order error file: " . $e->getFile() . " line: " . $e->getLine());
    
    // Send detailed error for debugging
    sendErrorResponse('Failed to create order: ' . $e->getMessage());
}
?>
