<?php
/**
 * User Login API
 * POST /api/auth/login.php
 */

require_once dirname(__DIR__, 2) . '/config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    sendErrorResponse('Email and password are required');
}

// Sanitize input
$email = sanitizeInput($input['email']);
$password = $input['password'];
$remember_me = isset($input['remember_me']) ? (bool)$input['remember_me'] : false;

try {
    // Find user by email
    $user = Database::fetch(
        "SELECT id, username, email, password_hash, first_name, last_name, is_active, email_verified 
         FROM users WHERE email = ?",
        [$email]
    );
    
    if (!$user) {
        sendErrorResponse('Invalid email or password');
    }
    
    // Check if user is active
    if (!$user['is_active']) {
        sendErrorResponse('Account is deactivated. Please contact support.');
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password_hash'])) {
        sendErrorResponse('Invalid email or password');
    }
    
    // Check email verification (skip for demo purposes)
    // if (!$user['email_verified']) {
    //     sendErrorResponse('Please verify your email before logging in');
    // }
    
    // Generate session token
    $session_token = generateToken();
    $expires_at = $remember_me ? date('Y-m-d H:i:s', strtotime('+30 days')) : date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Store session in database
    $session_sql = "INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)";
    Database::query($session_sql, [$user['id'], $session_token, $expires_at]);
    
    // Update last login time
    Database::query(
        "UPDATE users SET updated_at = NOW() WHERE id = ?",
        [$user['id']]
    );
    
    // Prepare user data for response
    $user_data = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'session_token' => $session_token,
        'expires_at' => $expires_at
    ];
    
    // Set session cookie
    $cookie_expires = $remember_me ? time() + (30 * 24 * 60 * 60) : 0; // 30 days or session
    setcookie('bloomspace_session', $session_token, $cookie_expires, '/', '', false, true);
    
    sendSuccessResponse('Login successful', $user_data);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendErrorResponse('Login failed. Please try again.');
}
?>
