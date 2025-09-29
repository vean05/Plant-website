<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../../config/database.php';
    
    $product_id = $_GET['product_id'] ?? null;
    
    if (!$product_id) {
        throw new Exception('Product ID is required');
    }
    
    // Get all images for the product
    $images = Database::fetchAll("
        SELECT 
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY sort_order
    ", [$product_id]);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'product_id' => $product_id,
            'images' => $images
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'data' => []
    ], JSON_PRETTY_PRINT);
}
?>
