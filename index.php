<?php
// Título: index.php (Router de Vistas)
// Descripción: Gestiona qué archivo de vista se debe cargar (Login, Admin, Teacher).

$view = $_GET['view'] ?? 'login';

if ($view === 'login') {
    $file_path = 'login_form.php'; 
} elseif ($view === 'ingeniero' || $view === 'admin' || $view === 'Ingeniero') {
    $file_path = 'admin_dashboard.php';
} elseif ($view === 'docente' || $view === 'teacher' || $view === 'Docente') {
    $file_path = 'teacher_dashboard.php';
} else {
    http_response_code(404);
    die("<h1>404 Not Found</h1><p>Vista no encontrada: {$view}</p>");
}

if (file_exists($file_path)) {
    $API_ENDPOINT = "api_handler.php"; 
    require_once $file_path; 
} else {
    http_response_code(500);
    die("<h1>Error 500</h1><p>El archivo de vista '{$file_path}' no existe en el directorio raíz.</p>");
}
?>