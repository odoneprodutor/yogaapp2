<?php
// backend/api/poses.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

// GET: Listar todas as poses
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM poses ORDER BY portuguese_name ASC");
        $poses = $stmt->fetchAll();
        
        // Formatar JSON de benefícios se necessário
        // (Assumindo que no banco salvamos como string JSON ou CSV, aqui enviamos limpo)
        $formattedPoses = array_map(function($pose) {
            $benefits = json_decode($pose['benefits']);
            if (!$benefits) {
                // Tenta fallback se for string separada por vírgula
                $benefits = array_filter(array_map('trim', explode(',', $pose['benefits'])));
            }
            
            return [
                'id' => (string)$pose['id'], // Frontend espera string IDs muitas vezes
                'portugueseName' => $pose['portuguese_name'],
                'sanskritName' => $pose['sanskrit_name'],
                'difficulty' => $pose['difficulty'],
                'category' => $pose['category'],
                'description' => $pose['description'],
                'durationDefault' => (int)$pose['duration_default'],
                'benefits' => $benefits,
                'media' => [
                    'thumbnailUrl' => $pose['thumbnail_url'],
                    'videoEmbedUrl' => $pose['video_embed_url']
                ]
            ];
        }, $poses);

        echo json_encode($formattedPoses);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar poses: ' . $e->getMessage()]);
    }
}

// POST: Criar nova pose
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->portugueseName) && !empty($data->sanskritName)) {
        try {
            $sql = "INSERT INTO poses (portuguese_name, sanskrit_name, difficulty, category, description, duration_default, benefits, thumbnail_url, video_embed_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            // Converter array de benefícios para JSON para salvar no banco
            $benefitsJson = json_encode($data->benefits ?? []);
            
            $stmt->execute([
                $data->portugueseName,
                $data->sanskritName,
                $data->difficulty,
                $data->category,
                $data->description,
                $data->durationDefault ?? 60,
                $benefitsJson,
                $data->media->thumbnailUrl,
                $data->media->videoEmbedUrl
            ]);

            http_response_code(201);
            echo json_encode(['message' => 'Pose criada com sucesso', 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar pose: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Dados incompletos.']);
    }
}
?>
