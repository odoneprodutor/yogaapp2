<?php
// backend/migrate.php

// 1. Define flag to prevent database.php from exiting on error
define('MIGRATION_MODE', true);

// 2. Load Configuration
require_once 'config/database.php';

header("Content-Type: text/html; charset=UTF-8");

echo "<h1>YogaFlow Database Migration</h1>";
echo "<div style='font-family: sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;'>";

// 3. Helper to run SQL
function executeSQL($pdo, $sql) {
    try {
        $pdo->exec($sql);
        return true;
    } catch (PDOException $e) {
        echo "<p style='color: red;'>Erro SQL: " . htmlspecialchars($e->getMessage()) . "</p>";
        return false;
    }
}

// 4. Check Connection
if ($pdo === null) {
    echo "<p>⚠️ Conexão inicial com o banco '$db' falhou. Tentando conectar ao servidor para criar o banco...</p>";
    
    // Tentar conectar sem database name
    try {
        $dsn_no_db = "mysql:host=$host;charset=$charset";
        $pdo = new PDO($dsn_no_db, $user, $pass, $options);
        echo "<p style='color: green;'>✅ Conectado ao servidor MySQL com sucesso.</p>";
        
        // Criar Banco
        echo "<p>🔨 Criando banco de dados '$db'...</p>";
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db`");
        $pdo->exec("USE `$db`");
        echo "<p style='color: green;'>✅ Banco de dados selecionado.</p>";
        
    } catch (PDOException $e) {
        echo "<h2 style='color: red;'>❌ Falha fatal ao conectar ao MySQL.</h2>";
        echo "<p>Verifique se o MySQL está rodando e se as credenciais em <code>config/database.php</code> estão corretas.</p>";
        echo "<pre>" . $e->getMessage() . "</pre>";
        echo "</div>";
        exit;
    }
} else {
    echo "<p style='color: green;'>✅ Conectado ao banco de dados existente.</p>";
}

// 5. Read SQL File
$sqlFile = __DIR__ . '/database_full.sql';

if (!file_exists($sqlFile)) {
    echo "<h2 style='color: red;'>❌ Arquivo database_full.sql não encontrado!</h2>";
    exit;
}

$sqlContent = file_get_contents($sqlFile);

// 6. Execute Statements
// Split by command usually works better for showing progress, but for simplicity we act robustly
// We will split by semicolon but be careful with triggers/procedures (we don't have them here)
$statements = array_filter(array_map('trim', explode(';', $sqlContent)));

echo "<h3>Executando Migrações...</h3>";
echo "<ul>";

$successCount = 0;
$errorCount = 0;

foreach ($statements as $stmt) {
    if (empty($stmt)) continue;
    
    // Ignore comments
    if (strpos($stmt, '--') === 0 && strpos($stmt, "\n") === false) continue;
    
    try {
        $pdo->exec($stmt);
        // Extract first few words for log
        $preview = substr($stmt, 0, 50) . (strlen($stmt) > 50 ? '...' : '');
        echo "<li style='color: green;'>Executado: <code>" . htmlspecialchars($preview) . "</code></li>";
        $successCount++;
    } catch (PDOException $e) {
        // Ignore "Table already exists" errors mostly, but show them as warnings
        if (strpos($e->getMessage(), 'already exists') !== false) {
             echo "<li style='color: orange;'>Aviso: Tabela já existe (<code>" . htmlspecialchars($preview) . "</code>)</li>";
        } else {
             echo "<li style='color: red;'>Erro: " . htmlspecialchars($e->getMessage()) . "</li>";
             $errorCount++;
        }
    }
}

echo "</ul>";

echo "<hr>";
if ($errorCount === 0) {
    echo "<h2 style='color: green;'>🎉 Migração Concluída com Sucesso!</h2>";
    echo "<p>O banco de dados 'yogaflow_db' está pronto para uso com poses, artigos e planos.</p>";
} else {
    echo "<h2 style='color: orange;'>⚠️ Migração Concluída com Avisos/Erros</h2>";
    echo "<p>Verifique os itens acima.</p>";
}

echo "<a href='/yogaflow/' style='display: inline-block; padding: 10px 20px; background: #4a5568; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;'>Voltar para Aplicação</a>";

echo "</div>";
?>
