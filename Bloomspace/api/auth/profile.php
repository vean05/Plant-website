<?php
/**
 * User Profile API
 * GET /api/auth/profile.php - Get user profile
 * PUT /api/auth/profile.php - Update user profile
 */

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/auth/validate-session.php';

// Set CORS headers
setCorsHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get current user ID
    $user_id = getCurrentUserId();
    
    if (!$user_id) {
        sendErrorResponse('User not logged in', 401);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user profile
        $user = Database::fetch(
            "SELECT id, email, first_name, last_name, phone, date_of_birth, gender, 
                    profile_image, created_at, updated_at
             FROM users WHERE id = ?",
            [$user_id]
        );

        if (!$user) {
            sendErrorResponse('User not found', 404);
        }

        // Get user statistics
        $stats = Database::fetch(
            "SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as total_spent
             FROM orders o 
             WHERE o.user_id = ?",
            [$user_id]
        );

        $user['stats'] = $stats;

        sendSuccessResponse('Profile retrieved successfully', $user);

    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update user profile
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            sendErrorResponse('Invalid JSON input');
        }

        // Validate and sanitize input
        $first_name = sanitizeInput($input['first_name'] ?? '');
        $last_name = sanitizeInput($input['last_name'] ?? '');
        $phone = sanitizeInput($input['phone'] ?? '');
        $date_of_birth = sanitizeInput($input['date_of_birth'] ?? '');
        $gender = sanitizeInput($input['gender'] ?? '');

        // Validate gender if provided
        if ($gender && !in_array($gender, ['male', 'female', 'other'])) {
            sendErrorResponse('Invalid gender value');
        }

        // Update user profile
        $sql = "UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                phone = ?, 
                date_of_birth = ?, 
                gender = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?";

        Database::query($sql, [
            $first_name,
            $last_name,
            $phone,
            $date_of_birth,
            $gender,
            $user_id
        ]);

        // Get updated user data
        $user = Database::fetch(
            "SELECT id, email, first_name, last_name, phone, date_of_birth, gender, 
                    profile_image, created_at, updated_at
             FROM users WHERE id = ?",
            [$user_id]
        );

        sendSuccessResponse('Profile updated successfully', $user);
    } else {
        sendErrorResponse('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("Profile API error: " . $e->getMessage());
    sendErrorResponse('An error occurred while processing your request');
}

?>
