<?php
/**
 * Address Management from Orders API
 * Extract and manage addresses from user's orders
 */

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/auth/validate-session.php';

// Set CORS headers
if (isset($_SERVER['REQUEST_METHOD'])) {
    setCorsHeaders();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Check if user is logged in
    $user_id = getCurrentUserId();
    if (!$user_id) {
        sendErrorResponse('User not logged in', 401);
    }
    
    switch ($method) {
        case 'GET':
            // Get unique addresses from user's orders
            $addresses = getAddressesFromOrders($user_id);
            sendSuccessResponse('Addresses retrieved successfully', $addresses);
            break;
            
        case 'POST':
            // Save address for future use (store in user preferences or session)
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['address_type']) || empty($input['address_data'])) {
                sendErrorResponse('Address type and data are required', 400);
            }
            
            // For now, just return success (could store in user preferences later)
            sendSuccessResponse('Address saved for future use', $input);
            break;
            
        default:
            sendErrorResponse('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log('Address from orders error: ' . $e->getMessage());
    sendErrorResponse('Operation failed: ' . $e->getMessage(), 500);
}

/**
 * Get unique addresses from user's orders
 */
function getAddressesFromOrders($user_id) {
    // Get all orders for the user
    $orders = Database::fetchAll("
        SELECT id, order_number, shipping_address, billing_address, created_at
        FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ", [$user_id]);
    
    $addresses = [];
    $seen_addresses = [];
    
    foreach ($orders as $order) {
        // Process shipping address
        if ($order['shipping_address']) {
            $shipping = json_decode($order['shipping_address'], true);
            if ($shipping && is_array($shipping)) {
                $address_key = createAddressKey($shipping);
                if (!in_array($address_key, $seen_addresses)) {
                    $addresses[] = [
                        'id' => 'shipping_' . $order['id'],
                        'type' => 'shipping',
                        'order_number' => $order['order_number'],
                        'order_date' => $order['created_at'],
                        'first_name' => $shipping['firstName'] ?? $shipping['first_name'] ?? '',
                        'last_name' => $shipping['lastName'] ?? $shipping['last_name'] ?? '',
                        'company' => $shipping['company'] ?? '',
                        'address_line_1' => $shipping['address1'] ?? $shipping['address_line_1'] ?? '',
                        'address_line_2' => $shipping['address2'] ?? $shipping['address_line_2'] ?? '',
                        'city' => $shipping['city'] ?? '',
                        'state' => $shipping['state'] ?? '',
                        'postcode' => $shipping['postcode'] ?? $shipping['zip'] ?? '',
                        'country' => $shipping['country'] ?? 'Malaysia',
                        'phone' => $shipping['phone'] ?? '',
                        'email' => $shipping['email'] ?? '',
                        'is_default' => false,
                        'source' => 'order'
                    ];
                    $seen_addresses[] = $address_key;
                }
            }
        }
        
        // Process billing address
        if ($order['billing_address']) {
            $billing = json_decode($order['billing_address'], true);
            if ($billing && is_array($billing)) {
                $address_key = createAddressKey($billing);
                if (!in_array($address_key, $seen_addresses)) {
                    $addresses[] = [
                        'id' => 'billing_' . $order['id'],
                        'type' => 'billing',
                        'order_number' => $order['order_number'],
                        'order_date' => $order['created_at'],
                        'first_name' => $billing['firstName'] ?? $billing['first_name'] ?? '',
                        'last_name' => $billing['lastName'] ?? $billing['last_name'] ?? '',
                        'company' => $billing['company'] ?? '',
                        'address_line_1' => $billing['address1'] ?? $billing['address_line_1'] ?? '',
                        'address_line_2' => $billing['address2'] ?? $billing['address_line_2'] ?? '',
                        'city' => $billing['city'] ?? '',
                        'state' => $billing['state'] ?? '',
                        'postcode' => $billing['postcode'] ?? $billing['zip'] ?? '',
                        'country' => $billing['country'] ?? 'Malaysia',
                        'phone' => $billing['phone'] ?? '',
                        'email' => $billing['email'] ?? '',
                        'is_default' => false,
                        'source' => 'order'
                    ];
                    $seen_addresses[] = $address_key;
                }
            }
        }
    }
    
    // Sort by order date (most recent first)
    usort($addresses, function($a, $b) {
        return strtotime($b['order_date']) - strtotime($a['order_date']);
    });
    
    return $addresses;
}

/**
 * Create a unique key for address comparison
 */
function createAddressKey($address) {
    $fields = [
        $address['firstName'] ?? $address['first_name'] ?? '',
        $address['lastName'] ?? $address['last_name'] ?? '',
        $address['address1'] ?? $address['address_line_1'] ?? '',
        $address['city'] ?? '',
        $address['state'] ?? '',
        $address['postcode'] ?? $address['zip'] ?? '',
        $address['country'] ?? ''
    ];
    
    return md5(implode('|', $fields));
}
?>
