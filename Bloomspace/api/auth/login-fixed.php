<?php
/**
 * Working Login API
 * Fixed version with correct paths
 */

require_once dirname(__DIR__, 2) . '/config/database.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

// Sanitize input
$email = trim($input['email']);
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
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }
    
    // Check if user is active
    if (!$user['is_active']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Account is deactivated']);
        exit();
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }
    
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
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user_data
    ]);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Login failed. Please try again.']);
}
?>