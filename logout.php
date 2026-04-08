<?php
// ============================================================
// File: backend/api/auth/logout.php
// Destroys user session
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();
session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
?>
