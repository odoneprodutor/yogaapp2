<?php
// backend/api/upload.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
    exit;
}

// Check for file
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['message' => 'No file uploaded or upload error.']);
    exit;
}

$file = $_FILES['file'];
$uploadDir = '../uploads/';

// Create upload directory if it doesn't exist
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create upload directory.']);
        exit;
    }
}

// Validate File Type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid file type. Only images and MP4 videos allowed.']);
    exit;
}

// Validate Size (Max 10MB)
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['message' => 'File too large (Max 10MB).']);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('upload_', true) . '.' . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Return relative URL that the frontend can use
    $publicUrl = '/backend/uploads/' . $filename; // Adjust based on server config
    echo json_encode([
        'message' => 'Upload successful',
        'url' => $publicUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to move uploaded file.']);
}
?>
