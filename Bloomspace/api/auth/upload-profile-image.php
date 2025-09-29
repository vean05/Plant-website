<?php
/**
 * Upload Profile Image API
 * Handle profile image uploads and save to database
 */

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/auth/validate-session.php';

// Set CORS headers
if (isset($_SERVER['REQUEST_METHOD'])) {
    setCorsHeaders();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Check if user is logged in
    $user_id = getCurrentUserId();
    if (!$user_id) {
        sendErrorResponse('User not logged in', 401);
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
        sendErrorResponse('No file uploaded or upload error', 400);
    }
    
    $file = $_FILES['profile_image'];
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = mime_content_type($file['tmp_name']);
    
    if (!in_array($file_type, $allowed_types)) {
        sendErrorResponse('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.', 400);
    }
    
    // Validate file size (max 5MB)
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        sendErrorResponse('File too large. Maximum size is 5MB.', 400);
    }
    
    // Create uploads directory if it doesn't exist
    $uploads_dir = dirname(__DIR__, 2) . '/uploads/profile_images';
    if (!file_exists($uploads_dir)) {
        mkdir($uploads_dir, 0755, true);
    }
    
    // Generate unique filename
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $file_extension;
    $file_path = $uploads_dir . '/' . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        sendErrorResponse('Failed to save uploaded file', 500);
    }
    
    // Save relative path to database
    $relative_path = 'uploads/profile_images/' . $filename;
    
    // Update user's profile image in database
    $update_sql = "UPDATE users SET profile_image = ? WHERE id = ?";
    Database::query($update_sql, [$relative_path, $user_id]);
    
    // Get updated user data
    $user_data = Database::fetch("SELECT id, first_name, last_name, email, profile_image FROM users WHERE id = ?", [$user_id]);
    
    sendSuccessResponse('Profile image uploaded successfully', [
        'user' => $user_data,
        'image_url' => $relative_path
    ]);
    
} catch (Exception $e) {
    error_log('Profile image upload error: ' . $e->getMessage());
    sendErrorResponse('Upload failed: ' . $e->getMessage(), 500);
}
?>
