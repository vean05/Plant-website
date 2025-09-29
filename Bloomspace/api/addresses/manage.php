<?php
/**
 * Address Management API
 * Handle CRUD operations for user addresses
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
            // Get user addresses
            $addresses = Database::fetchAll("
                SELECT * FROM addresses 
                WHERE user_id = ? 
                ORDER BY is_default DESC, created_at DESC
            ", [$user_id]);
            
            sendSuccessResponse('Addresses retrieved successfully', $addresses);
            break;
            
        case 'POST':
            // Create new address
            $input = json_decode(file_get_contents('php://input'), true);
            
            $required_fields = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postcode'];
            foreach ($required_fields as $field) {
                if (empty($input[$field])) {
                    sendErrorResponse("Field '{$field}' is required", 400);
                }
            }
            
            // If this is set as default, unset other defaults
            if (!empty($input['is_default']) && $input['is_default']) {
                Database::query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [$user_id]);
            }
            
            $insert_sql = "
                INSERT INTO addresses (
                    user_id, type, first_name, last_name, company, 
                    address_line_1, address_line_2, city, state, postcode, 
                    country, phone, email, is_default
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";
            
            $address_id = Database::query($insert_sql, [
                $user_id,
                $input['type'] ?? 'shipping',
                $input['first_name'],
                $input['last_name'],
                $input['company'] ?? null,
                $input['address_line_1'],
                $input['address_line_2'] ?? null,
                $input['city'],
                $input['state'],
                $input['postcode'],
                $input['country'] ?? 'Malaysia',
                $input['phone'] ?? null,
                $input['email'] ?? null,
                $input['is_default'] ?? false
            ]);
            
            $new_address = Database::fetch("SELECT * FROM addresses WHERE id = ?", [$address_id]);
            sendSuccessResponse('Address created successfully', $new_address);
            break;
            
        case 'PUT':
            // Update address
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                sendErrorResponse('Address ID is required', 400);
            }
            
            // Check if address belongs to user
            $existing_address = Database::fetch("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [$input['id'], $user_id]);
            if (!$existing_address) {
                sendErrorResponse('Address not found', 404);
            }
            
            // If this is set as default, unset other defaults
            if (!empty($input['is_default']) && $input['is_default']) {
                Database::query("UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?", [$user_id, $input['id']]);
            }
            
            $update_sql = "
                UPDATE addresses SET 
                    type = ?, first_name = ?, last_name = ?, company = ?, 
                    address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, 
                    postcode = ?, country = ?, phone = ?, email = ?, is_default = ?
                WHERE id = ? AND user_id = ?
            ";
            
            Database::query($update_sql, [
                $input['type'] ?? $existing_address['type'],
                $input['first_name'] ?? $existing_address['first_name'],
                $input['last_name'] ?? $existing_address['last_name'],
                $input['company'] ?? $existing_address['company'],
                $input['address_line_1'] ?? $existing_address['address_line_1'],
                $input['address_line_2'] ?? $existing_address['address_line_2'],
                $input['city'] ?? $existing_address['city'],
                $input['state'] ?? $existing_address['state'],
                $input['postcode'] ?? $existing_address['postcode'],
                $input['country'] ?? $existing_address['country'],
                $input['phone'] ?? $existing_address['phone'],
                $input['email'] ?? $existing_address['email'],
                $input['is_default'] ?? $existing_address['is_default'],
                $input['id'],
                $user_id
            ]);
            
            $updated_address = Database::fetch("SELECT * FROM addresses WHERE id = ?", [$input['id']]);
            sendSuccessResponse('Address updated successfully', $updated_address);
            break;
            
        case 'DELETE':
            // Delete address
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                sendErrorResponse('Address ID is required', 400);
            }
            
            // Check if address belongs to user
            $existing_address = Database::fetch("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [$input['id'], $user_id]);
            if (!$existing_address) {
                sendErrorResponse('Address not found', 404);
            }
            
            Database::query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [$input['id'], $user_id]);
            sendSuccessResponse('Address deleted successfully');
            break;
            
        default:
            sendErrorResponse('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log('Address management error: ' . $e->getMessage());
    sendErrorResponse('Operation failed: ' . $e->getMessage(), 500);
}
?>
