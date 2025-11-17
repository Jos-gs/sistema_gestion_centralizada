<?php
// Título: database.php (Conexión Única y Persistente)

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');      
define('DB_PASSWORD', '');          
define('DB_NAME', 'gestion_centralizada');

// Variable estática para almacenar la conexión una vez que se establece
static $conn = null; 

/**
 * Establece y devuelve una conexión persistente a la base de datos.
 * Si la conexión ya existe y está activa, la reutiliza.
 * Si falla, detiene la ejecución y devuelve un error 500.
 */
function connectDB() {
    global $conn; // Importa la variable global estática

    // 1. Reutilizar conexión si ya existe y es funcional
    if ($conn instanceof mysqli && $conn->ping()) {
        return $conn;
    }

    // 2. Intentar establecer una nueva conexión
    // Usamos el constructor mysqli que lanza una excepción en caso de error
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    // 3. Manejo de error de conexión
    if ($conn->connect_error) {
        http_response_code(500); 
        // Detiene el script y devuelve un error JSON legible para el desarrollador
        die(json_encode([
            "error" => "FATAL: Error de conexión a MySQL", 
            "details" => $conn->connect_error
        ]));
    }
    
    // 4. Configurar charset y devolver el objeto de conexión
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>