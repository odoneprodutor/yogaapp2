<?php
// Script De Instalação de Administrador
// Suba este arquivo para a pasta /backend/ e acesse pelo navegador:
// Ex: yogaflowapp.cloud/yogaflow/backend/setup_admin.php

require_once 'config/database.php';

$name = "Admin YogaFlow";
$email = "admin@yogaflow.com";
$password = "admin123";

try {
    // 1. Verificar se já existe
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo "<h1>Atenção</h1>";
        echo "<p>O usuário <strong>$email</strong> já existe no banco de dados.</p>";
    } else {
        // 2. Criar Hash da Senha (BCRYPT)
        // Isso garante compatibilidade com o password_verify() do login.php
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $is_admin = 1;

        // 3. Inserir
        $sql = "INSERT INTO users (name, email, password_hash, is_admin) VALUES (:name, :email, :password_hash, :is_admin)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":is_admin", $is_admin);

        if ($stmt->execute()) {
            echo "<div style='font-family: sans-serif; padding: 20px; background: #e6fffa; border: 1px solid #38b2ac; border-radius: 8px;'>";
            echo "<h2 style='color: #2c7a7b;'>Sucesso!</h2>";
            echo "<p>Administrador criado com sucesso.</p>";
            echo "<ul>";
            echo "<li><strong>Email:</strong> $email</li>";
            echo "<li><strong>Senha:</strong> $password</li>";
            echo "</ul>";
            echo "<p>Por favor, <strong>exclua este arquivo</strong> do servidor após o uso por segurança.</p>";
            echo "</div>";
        } else {
            echo "Erro ao criar usuário.";
        }
    }
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
?>
