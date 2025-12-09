<?php
// backend/api/articles.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

// GET: Listar todos os artigos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM articles ORDER BY created_at DESC");
        $articles = $stmt->fetchAll();
        
        $formattedArticles = array_map(function($a) {
            $content = json_decode($a['content']);
            if (!$content) {
                // Fallback se não for JSON válido
                $content = [$a['content']];
            }

            return [
                'id' => (string)$a['id'],
                'title' => $a['title'],
                'category' => $a['category'],
                'readTime' => $a['read_time'],
                'author' => $a['author'],
                'excerpt' => $a['excerpt'],
                'imageUrl' => $a['image_url'],
                'likes' => (int)$a['likes'],
                'likedBy' => [], // Implementar tabela de likes_users futuramente se necessário
                'comments' => [], // Implementar tabela de comments futuramente se necessário
                'content' => $content
            ];
        }, $articles);

        echo json_encode($formattedArticles);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar artigos: ' . $e->getMessage()]);
    }
}

// POST: Criar novo artigo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->title) && !empty($data->content)) {
        try {
            $sql = "INSERT INTO articles (title, category, author, read_time, excerpt, content, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            // Garantir que content seja salvo como JSON string
            $contentJson = is_array($data->content) ? json_encode($data->content) : json_encode([$data->content]);
            
            $stmt->execute([
                $data->title,
                $data->category,
                $data->author,
                $data->readTime,
                $data->excerpt,
                $contentJson,
                $data->imageUrl
            ]);

            http_response_code(201);
            echo json_encode(['message' => 'Artigo criado com sucesso', 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar artigo: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Dados incompletos.']);
    }
}
?>
