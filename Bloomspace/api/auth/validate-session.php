<?php
/**
 * Session Validation API
 * Validate user session and return user ID
 */

require_once dirname(__DIR__, 2) . '/config/database.php';

/**
 * Validate user session token
 * @param string $token Session token
 * @return int|null User ID if valid, null if invalid
 */
function validateUserSession($token) {
    if (empty($token)) {
        return null;
    }
    
    // Truncate token to 191 characters to match database field
    $token = substr($token, 0, 191);
    
    try {
        // Check if session exists and is not expired
        $session = Database::fetch(
            "SELECT s.user_id, s.expires_at, u.is_active 
             FROM user_sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1",
            [$token]
        );
        
        if ($session) {
            return (int)$session['user_id'];
        }
        
        return null;
    } catch (Exception $e) {
        error_log("Session validation error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get user ID from session cookie
 * @return int|null User ID if logged in, null if not
 */
function getCurrentUserId() {
    $session_token = $_COOKIE['bloomspace_session'] ?? null;
    return validateUserSession($session_token);
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
    try {
        Database::query("DELETE FROM user_sessions WHERE expires_at < NOW()");
    } catch (Exception $e) {
        error_log("Session cleanup error: " . $e->getMessage());
    }
}

// Auto-cleanup expired sessions (optional)
cleanupExpiredSessions();
?>
