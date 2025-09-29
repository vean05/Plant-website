<?php
/**
 * Categories List API
 * GET /api/categories/list.php
 */

// Set JSON header
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../../config/database.php';
} catch (Exception $e) {
    sendErrorResponse('Database configuration failed: ' . $e->getMessage());
}

try {
    // Get all active categories with product count
    $sql = "SELECT c.id, c.name, c.slug, c.description, c.image, c.parent_id, c.sort_order, c.is_active,
                   COUNT(pc.product_id) as product_count
            FROM categories c
            LEFT JOIN product_categories pc ON c.id = pc.category_id
            LEFT JOIN products p ON pc.product_id = p.id AND p.is_active = 1
            WHERE c.is_active = 1
            GROUP BY c.id, c.name, c.slug, c.description, c.image, c.parent_id, c.sort_order, c.is_active
            ORDER BY c.sort_order, c.name";
    
    $categories = Database::fetchAll($sql);
    
    // Format categories
    $formatted_categories = array_map(function($category) {
        return [
            'id' => (int)$category['id'],
            'name' => $category['name'],
            'slug' => $category['slug'],
            'description' => $category['description'],
            'image' => $category['image'],
            'parent_id' => $category['parent_id'] ? (int)$category['parent_id'] : null,
            'sort_order' => (int)$category['sort_order'],
            'is_active' => (bool)$category['is_active'],
            'product_count' => (int)$category['product_count']
        ];
    }, $categories);
    
    // Response data
    $response_data = [
        'categories' => $formatted_categories,
        'total' => count($formatted_categories)
    ];
    
    sendSuccessResponse('Categories retrieved successfully', $response_data);
    
} catch (Exception $e) {
    error_log("Categories list error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve categories: ' . $e->getMessage());
}
?>
