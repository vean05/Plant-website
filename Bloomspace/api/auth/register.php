<?php
/**
 * User Registration API
 * POST /api/auth/register.php
 */

require_once '../../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['username', 'email', 'password', 'first_name', 'last_name'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendErrorResponse("Field '$field' is required");
    }
}

// Sanitize input
$username = sanitizeInput($input['username']);
$email = sanitizeInput($input['email']);
$password = $input['password'];
$first_name = sanitizeInput($input['first_name']);
$last_name = sanitizeInput($input['last_name']);
$phone = isset($input['phone']) ? sanitizeInput($input['phone']) : null;
$date_of_birth = isset($input['date_of_birth']) ? sanitizeInput($input['date_of_birth']) : null;
$gender = isset($input['gender']) ? sanitizeInput($input['gender']) : null;

// Validate email format
if (!validateEmail($email)) {
    sendErrorResponse('Invalid email format');
}

// Validate password strength
if (strlen($password) < 6) {
    sendErrorResponse('Password must be at least 6 characters long');
}

// Validate gender if provided
if ($gender && !in_array($gender, ['male', 'female', 'other'])) {
    sendErrorResponse('Invalid gender value');
}

// Check if username already exists
$existing_user = Database::fetch(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [$username, $email]
);

if ($existing_user) {
    sendErrorResponse('Username or email already exists');
}

try {
    // Begin transaction
    Database::beginTransaction();
    
    // Hash password
    $password_hash = hashPassword($password);
    
    // Generate email verification token
    $verification_token = generateToken();
    
    // Insert user
    $sql = "INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth, gender, email_verification_token) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    Database::query($sql, [
        $username,
        $email,
        $password_hash,
        $first_name,
        $last_name,
        $phone,
        $date_of_birth,
        $gender,
        $verification_token
    ]);
    
    $user_id = Database::lastInsertId();
    
    // Create default addresses if provided
    if (isset($input['address'])) {
        $address = $input['address'];
        
        // Billing address
        if (isset($address['billing'])) {
            $billing = $address['billing'];
            $billing_sql = "INSERT INTO user_addresses (user_id, address_type, full_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default) 
                           VALUES (?, 'billing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            Database::query($billing_sql, [
                $user_id,
                $billing['full_name'] ?? $first_name . ' ' . $last_name,
                $billing['company'] ?? null,
                $billing['address_line_1'] ?? '',
                $billing['address_line_2'] ?? null,
                $billing['city'] ?? '',
                $billing['state'] ?? '',
                $billing['postal_code'] ?? '',
                $billing['country'] ?? 'Malaysia',
                $billing['phone'] ?? $phone,
                true
            ]);
        }
        
        // Shipping address
        if (isset($address['shipping'])) {
            $shipping = $address['shipping'];
            $shipping_sql = "INSERT INTO user_addresses (user_id, address_type, full_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default) 
                            VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            Database::query($shipping_sql, [
                $user_id,
                $shipping['full_name'] ?? $first_name . ' ' . $last_name,
                $shipping['company'] ?? null,
                $shipping['address_line_1'] ?? '',
                $shipping['address_line_2'] ?? null,
                $shipping['city'] ?? '',
                $shipping['state'] ?? '',
                $shipping['postal_code'] ?? '',
                $shipping['country'] ?? 'Malaysia',
                $shipping['phone'] ?? $phone,
                true
            ]);
        }
    }
    
    // Commit transaction
    Database::commit();
    
    // Send verification email (in a real application)
    // sendVerificationEmail($email, $verification_token);
    
    // Return success response
    sendSuccessResponse('User registered successfully', [
        'user_id' => $user_id,
        'username' => $username,
        'email' => $email,
        'verification_token' => $verification_token,
        'message' => 'Please check your email to verify your account'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction
    Database::rollback();
    
    error_log("Registration error: " . $e->getMessage());
    sendErrorResponse('Registration failed. Please try again.');
}
?>
