<?php
// backend/api/plans.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

// GET: Buscar planos de um usuário específico
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(['message' => 'User ID is required']);
        exit;
    }

    try {
        // Busca o plano ativo ou o mais recente
        $stmt = $pdo->prepare("SELECT * FROM user_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$userId]);
        $plan = $stmt->fetch();
        
        if ($plan) {
            $planData = json_decode($plan['plan_data'], true);
            
            // Merge database status/progress fields into the JSON blob if needed, 
            // or return strictly what the frontend expects
            if (is_array($planData)) {
                $planData['id'] = (string)$plan['id']; // Database ID overrides local ID
                $planData['progress'] = (int)$plan['progress'];
                $planData['status'] = $plan['status'];
            }
            
            echo json_encode($planData);
        } else {
            // Retorna null ou 404 se não tiver plano
            echo json_encode(null); 
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar plano: ' . $e->getMessage()]);
    }
}

// POST: Criar ou Substituir Plano
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->userId) && !empty($data->plan)) {
        try {
            // Arquivar planos anteriores deste usuário
            $archiveStmt = $pdo->prepare("UPDATE user_plans SET status = 'archived' WHERE user_id = ? AND status = 'active'");
            $archiveStmt->execute([$data->userId]);

            // Inserir novo plano
            $sql = "INSERT INTO user_plans (user_id, goal, level, stage, plan_data, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            $planObj = $data->plan;
            $planJson = json_encode($planObj);
            
            $stmt->execute([
                $data->userId,
                $planObj->metadata->goal ?? 'Geral',
                $planObj->metadata->level ?? 'Iniciante',
                $planObj->stage ?? 1,
                $planJson,
                $planObj->progress ?? 0,
                'active'
            ]);

            http_response_code(201);
            echo json_encode(['message' => 'Plano salvo com sucesso', 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao salvar plano: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'UserId e Plan data são obrigatórios.']);
    }
}

// PUT: Atualizar progresso do plano atual
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->userId) && isset($data->progress)) {
        try {
            // Atualiza apenas o plano ativo
            // Nota: Em um app real idealmente enviariamos o ID do plano, mas usaremos user_id + active por simplificação
            $sql = "UPDATE user_plans SET progress = ?, plan_data = ? WHERE user_id = ? AND status = 'active'";
            $stmt = $pdo->prepare($sql);
            
            // Se o frontend mandar o objeto plan completo atualizado, salvamos ele também
            // Caso contrário, precisaríamos fazer um merge complexo no SQL (não recomendado aqui)
            $planJson = isset($data->plan) ? json_encode($data->plan) : null;
            
            if ($planJson) {
                $stmt->execute([$data->progress, $planJson, $data->userId]);
                echo json_encode(['message' => 'Plano atualizado com sucesso']);
            } else {
                 http_response_code(400);
                 echo json_encode(['message' => 'Objeto Plan completo necessário para atualização via PUT.']);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar: ' . $e->getMessage()]);
        }
    }
}
?>
