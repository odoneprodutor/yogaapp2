-- CREATE DATABASE IF NOT EXISTS yogaflow_db;
-- USE yogaflow_db;

-- Tabela de Usuários (Já existia)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Poses
CREATE TABLE IF NOT EXISTS poses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portuguese_name VARCHAR(150) NOT NULL,
    sanskrit_name VARCHAR(150) NOT NULL,
    difficulty ENUM('Iniciante', 'Intermediário', 'Avançado') DEFAULT 'Iniciante',
    category VARCHAR(50) NOT NULL, -- Aquecimento, Core, Pé, etc.
    description TEXT,
    duration_default INT DEFAULT 60, -- em segundos
    benefits TEXT, -- Armazenado como JSON ou string separada por vírgula
    thumbnail_url VARCHAR(255),
    video_embed_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Artigos (Knowledge Base)
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Filosofia, Anatomia, etc.
    author VARCHAR(100),
    read_time VARCHAR(20),
    excerpt TEXT,
    content TEXT, -- JSON com parágrafos
    image_url VARCHAR(255),
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Planos dos Usuários
CREATE TABLE IF NOT EXISTS user_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal VARCHAR(50), -- Flexibilidade, Força, etc.
    level VARCHAR(50), 
    stage INT DEFAULT 1,
    plan_data JSON, -- Armazena a estrutura completa do plano (semanas, dias) gerada pelo engine
    progress INT DEFAULT 0,
    status ENUM('active', 'completed', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserção de Dados Iniciais (Exemplo para Poses)
-- INSERT INTO poses (portuguese_name, sanskrit_name, difficulty, category, thumbnail_url) VALUES 
-- ('Guerreiro I', 'Virabhadrasana I', 'Iniciante', 'Pé', 'https://exemplo.com/guerreiro1.jpg');
