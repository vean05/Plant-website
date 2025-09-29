<?php
/**
 * User Logout API
 * POST /api/auth/logout.php
 */

require_once '../../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Get session token from cookie
    $session_token = $_COOKIE['bloomspace_session'] ?? null;
    
    if ($session_token) {
        // Invalidate session in database (if using database sessions)
        // Database::query("DELETE FROM user_sessions WHERE token = ?", [$session_token]);
    }
    
    // Clear session cookie
    setcookie('bloomspace_session', '', time() - 3600, '/', '', false, true);
    
    // Destroy PHP session
    session_start();
    session_destroy();
    
    sendSuccessResponse('Logout successful');
    
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    sendErrorResponse('Logout failed. Please try again.');
}
?>
