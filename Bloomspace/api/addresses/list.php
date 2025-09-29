<?php
/**
 * User Addresses API
 * GET /api/addresses/list.php - Get user addresses
 */

require_once '../../config/database.php';

// Set content type
header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    sendErrorResponse('Authorization token required', 401);
}

$token = $matches[1];

try {
    // For demo purposes, we'll use a simple token validation
    $user_id = validateToken($token);
    
    if (!$user_id) {
        sendErrorResponse('Invalid or expired token', 401);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user addresses
        $addresses = Database::fetchAll(
            "SELECT * FROM user_addresses 
             WHERE user_id = ? 
             ORDER BY is_default DESC, created_at DESC",
            [$user_id]
        );

        sendSuccessResponse('Addresses retrieved successfully', $addresses);
    } else {
        sendErrorResponse('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("User Addresses API error: " . $e->getMessage());
    sendErrorResponse('An error occurred while processing your request');
}

/**
 * Simple token validation (for demo purposes)
 */
function validateToken($token) {
    if (strlen($token) > 10) {
        return 1; // Mock user ID for demo
    }
    return false;
}

/**
 * Send success response
 */
function sendSuccessResponse($message, $data = null) {
    $response = [
        'success' => true,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

/**
 * Send error response
 */
function sendErrorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit();
}
?>
