<?php
// Production Database Configuration (Load from Environment Variables)
$host = getenv('DB_HOST') ?: '127.0.0.1';
$db   = getenv('DB_NAME') ?: 'yogaflow_db';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // If we are in migration mode, we might want to handle the error (e.g. create DB)
    if (defined('MIGRATION_MODE') && MIGRATION_MODE === true) {
        // Do not exit, let the migrator handle it
        $pdo = null; 
        $db_connection_error = $e->getMessage();
    } else {
        // In production api calls, return error and exit
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed. Check credentials.']);
        exit;
    }
}
?>
