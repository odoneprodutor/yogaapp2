<?php
// backend/config/database.production.php
// EDITE ESTE ARQUIVO COM OS DADOS REAIS DO CLOUDPANEL

$host = '127.0.0.1'; // No CloudPanel, o banco geralmente roda local no próprio servidor
$db_name = 'yogaflow_db'; // O nome que você criou
$username = 'yogaflow_user'; // O usuário que você criou
$password = 'SUA_SENHA_AQUI'; // <--- COLE SUA SENHA AQUI

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erro de conexão com o banco de dados."]);
    exit;
}
?>
