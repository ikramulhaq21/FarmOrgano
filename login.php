<?php
// ============================================================
// File: backend/api/auth/login.php
// Handles user login and session creation
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests allowed.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$email    = trim($data['email']    ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

$conn = getDBConnection();

$stmt = $conn->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    $stmt->close();
    $conn->close();
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    $stmt->close();
    $conn->close();
    exit();
}

// Set session
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email']= $user['email'];

echo json_encode([
    'success' => true,
    'message' => 'Login successful!',
    'user' => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email']
    ]
]);

$stmt->close();
$conn->close();
?>
