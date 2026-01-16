<?php
// Iniciar sessão
session_start();

// Simulação: substitua isso com a forma real de como os dados estão disponíveis
// Exemplo: vindos de $_SESSION ou $_GET/$_POST após redirecionamento do Stripe

$id_user = $_SESSION['id_user'] ?? $_POST['id_user'] ?? null;
$email = $_SESSION['email'] ?? $_POST['email'] ?? null;
$plan = $_SESSION['plan'] ?? $_POST['plan'] ?? 'MKTBASIC';
$price = $_SESSION['price'] ?? $_POST['price'] ?? 50;
$tipo_pagamento = $_SESSION['tipo_pagamento'] ?? $_POST['tipo_pagamento'] ?? 'MENSAL';
$id_stripe = $_SESSION['id_stripe'] ?? $_POST['id_stripe'] ?? null;

// Tipo de usuário fixo (ou pegue da session também)
$type_user = 'Freelancer';

// Validar se os dados estão completos
if (!$id_user || !$email || !$id_stripe) {
    http_response_code(400);
    echo "Dados incompletos.";
    exit;
}

// Montar o payload
$data = [
    "id_user" => (int)$id_user,
    "type_user" => $type_user,
    "plan" => $plan,
    "price" => (float)$price,
    "tipo_pagamento" => $tipo_pagamento,
    "ativo" => true,
    "id_stripe" => $id_stripe
];

// Endpoint da API
$url = "http://127.0.0.1:8000/api/v1/subscription/subscription/{$id_user}/" . urlencode($email);

// Inicializar cURL
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

// Executar cURL
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Exibir resultado
if ($http_code === 200 || $http_code === 201) {
    echo "<h1>Pagamento aprovado com sucesso!</h1>";
    echo "<p>Sua assinatura foi registrada.</p>";
} else {
    echo "<h1>Erro ao registrar a assinatura.</h1>";
    echo "<pre>Resposta da API: $response</pre>";
}
?>
