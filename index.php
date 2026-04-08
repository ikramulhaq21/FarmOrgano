<?php
// ============================================================
// File: backend/api/sales/index.php
// Sales data retrieval + monthly report
// GET ?report=monthly  -> monthly aggregated sales
// GET                  -> all sales with order info
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/db.php';

$conn   = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Only GET requests allowed.']);
    $conn->close();
    exit();
}

// Monthly report aggregation
if (isset($_GET['report']) && $_GET['report'] === 'monthly') {
    $sql = 'SELECT month, year, SUM(total_amount) AS total
            FROM sales
            GROUP BY year, month
            ORDER BY year DESC, month ASC';

    $result  = $conn->query($sql);
    $monthly = [];

    $monthNames = [
        1=>'Jan',2=>'Feb',3=>'Mar',4=>'Apr',5=>'May',6=>'Jun',
        7=>'Jul',8=>'Aug',9=>'Sep',10=>'Oct',11=>'Nov',12=>'Dec'
    ];

    while ($row = $result->fetch_assoc()) {
        $row['month_name'] = $monthNames[(int)$row['month']] . ' ' . $row['year'];
        $monthly[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $monthly]);
    $conn->close();
    exit();
}

// All sales with order details
$sql = 'SELECT s.*, o.product_name, o.quantity, o.price, o.date,
               c.name AS customer_name
        FROM sales s
        LEFT JOIN orders o ON s.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY s.year DESC, s.month DESC, s.id DESC';

$result = $conn->query($sql);
$sales  = [];
while ($row = $result->fetch_assoc()) {
    $sales[] = $row;
}

echo json_encode(['success' => true, 'data' => $sales]);
$conn->close();
?>
