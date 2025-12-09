<?php
include_once '../config/database.php';
include_once '../config/cors.php';

enableCors();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    
    $query = "SELECT id, name, email, password_hash, is_admin FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $password_hash = $row['password_hash'];

        if (password_verify($data->password, $password_hash)) {
            http_response_code(200); // OK
            echo json_encode([
                "message" => "Login realizado com sucesso.",
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "email" => $row['email'],
                    "isAdmin" => (bool)$row['is_admin']
                ]
            ]);
            // AQUI: Em um sistema real, você geraria um JWT token aqui e retornaria.
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(["message" => "Email ou senha inválidos."]);
        }
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(["message" => "Email ou senha inválidos."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Dados incompletos."]);
}
?>
