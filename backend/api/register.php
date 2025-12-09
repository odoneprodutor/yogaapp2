<?php
include_once '../config/database.php';
include_once '../config/cors.php';

enableCors();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    
    // 1. Verificar se usuário já existe
    $query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400); // Bad Request
        echo json_encode(["message" => "Este email já está cadastrado."]);
    } else {
        // 2. Criar novo usuário
        $query = "INSERT INTO users (name, email, password_hash, is_admin) VALUES (:name, :email, :password_hash, :is_admin)";
        $stmt = $conn->prepare($query);

        // Sanitize e Hash
        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
        
        // Verifica se é admin pelo nome (apenas para manter a lógica atual de demonstração)
        // Em produção, isso seria removido ou feito via painel administrativo
        $is_admin = (strtolower($name) === 'admin') ? 1 : 0;

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":is_admin", $is_admin);

        if ($stmt->execute()) {
            http_response_code(201); // Created
            $id = $conn->lastInsertId();
            
            echo json_encode([
                "message" => "Usuário criado com sucesso.",
                "user" => [
                    "id" => $id,
                    "name" => $name,
                    "email" => $email,
                    "isAdmin" => (bool)$is_admin
                ]
            ]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Não foi possível criar o usuário."]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos."]);
}
?>
