CREATE DATABASE IF NOT EXISTS yogaflow_db;
USE yogaflow_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opcional: Criar um admin padrão (senha: admin123)
-- A senha deve ser gerada via password_hash, o exemplo abaixo é ilustrativo
-- INSERT INTO users (name, email, password_hash, is_admin) VALUES ('Admin', 'admin@yogaflow.com', '$2y$10$abcdefg...', 1);
