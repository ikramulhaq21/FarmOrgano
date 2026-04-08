<?php
// ============================================================
// File: backend/api/auth/register.php
// Handles new user registration
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests allowed.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$name  = trim($data['name']  ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Basic validation
if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit();
}

$conn = getDBConnection();

// Check if email already exists
$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Hash password and insert user
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful! Please login.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

$stmt->close();
$conn->close();
?>
