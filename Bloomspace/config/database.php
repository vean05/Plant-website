<?php
/**
 * Database Configuration for Bloomspace E-commerce
 * WampServer MySQL Configuration
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'bloomspace_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// PDO options
$pdo_options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    // Create PDO connection
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $pdo_options);
    
    // Set timezone
    $pdo->exec("SET time_zone = '+08:00'");
    
} catch (PDOException $e) {
    // Log error and show user-friendly message
    error_log("Database connection failed: " . $e->getMessage());
    die("Database connection failed. Please try again later.");
}

/**
 * Database helper functions
 */
class Database {
    private static $pdo = null;
    
    public static function getConnection() {
        global $pdo;
        return $pdo;
    }
    
    /**
     * Execute a prepared statement
     */
    public static function query($sql, $params = []) {
        global $pdo;
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query failed: " . $e->getMessage());
            throw new Exception("Database query failed: " . $e->getMessage());
        }
    }
    
    /**
     * Get single row
     */
    public static function fetch($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetch();
    }
    
    /**
     * Get all rows
     */
    public static function fetchAll($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * Get last insert ID
     */
    public static function lastInsertId() {
        global $pdo;
        return $pdo->lastInsertId();
    }
    
    /**
     * Begin transaction
     */
    public static function beginTransaction() {
        global $pdo;
        return $pdo->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public static function commit() {
        global $pdo;
        return $pdo->commit();
    }
    
    /**
     * Rollback transaction
     */
    public static function rollback() {
        global $pdo;
        return $pdo->rollback();
    }
    
    /**
     * Check if table exists
     */
    public static function tableExists($tableName) {
        $sql = "SHOW TABLES LIKE '" . $tableName . "'";
        $result = self::fetch($sql);
        return !empty($result);
    }
    
    /**
     * Get table structure
     */
    public static function getTableStructure($tableName) {
        $sql = "DESCRIBE `$tableName`";
        return self::fetchAll($sql);
    }
}

/**
 * Utility functions
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function generateToken($length = 32) {
    // Generate token and ensure it fits in VARCHAR(191) field
    $token = bin2hex(random_bytes($length));
    return substr($token, 0, 191);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function formatPrice($price, $currency = 'MYR') {
    return 'RM ' . number_format($price, 2);
}

function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Response helper functions
 */
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($message, $status = 400) {
    sendJsonResponse(['error' => $message], $status);
}

function sendSuccessResponse($message, $data = null) {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    sendJsonResponse($response);
}

/**
 * CORS headers for API
 */
function setCorsHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Set CORS headers only for web requests
if (isset($_SERVER['REQUEST_METHOD'])) {
    setCorsHeaders();
}
?>
