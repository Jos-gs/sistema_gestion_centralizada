<?php
// Título: api_handler.php (FINAL - SIN CONTRASENA_CLARA)

require_once __DIR__ . '/database.php';

// ===============================================
// === 1. FUNCIONES DE AUTENTICACIÓN Y REGISTRO ===
// ===============================================

// --- FUNCIÓN DE LOGIN (Acción: login) ---
function handleLogin($data) {
    $conn = connectDB();
    $username = $conn->real_escape_string($data['username']);
    $password = $data['password'];

    $sql = "SELECT username, nombre_completo, password_hash, cargo FROM usuarios WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $hashed_input_password = sha1($password);
        
        if ($hashed_input_password === $user['password_hash']) {
            http_response_code(200);
            echo json_encode([
                "message" => "Login exitoso",
                "username" => $user['username'],
                "role" => $user['cargo'],
                "full_name" => $user['nombre_completo']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Credenciales inválidas. Contraseña incorrecta." ]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Credenciales inválidas. Usuario no encontrado." ]);
    }
}

// --- FUNCIÓN DE DISTRIBUCIÓN (Acción: distribute) ---
function handleDistribution($data) {
    $conn = connectDB();

    $filename = $conn->real_escape_string($data['filename']);
    $file_url = $conn->real_escape_string($data['file_url']);
    $target = $conn->real_escape_string($data['target_classroom']);

    if (empty($filename) || empty($target)) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan parámetros."]);
        return;
    }
    
    $sql = "INSERT INTO registros_documentos (documento_nombre, documento_url, salon_destino, estado) 
            VALUES ('$filename', '$file_url', '$target', 'PENDIENTE')";
            
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode([
            "message" => "Tarea de distribución registrada con éxito",
            "task_id" => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al registrar la tarea en BD: " . $conn->error]);
    }
}

// --- FUNCIÓN DE HISTORIAL (Acción: get_history) ---
function getTaskHistory() {
    $conn = connectDB();
    
    $sql = "SELECT 
                documento_nombre, 
                salon_destino AS salon, 
                DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS date_only,
                TIME_FORMAT(fecha_registro, '%H:%i:%s') AS time_only
            FROM registros_documentos 
            ORDER BY fecha_registro DESC";
            
    $result = $conn->query($sql);
    $history = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        http_response_code(200);
        echo json_encode(["data" => $history]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener registros de la base de datos: " . $conn->error]);
    }
}

// ===============================================
// === 2. FUNCIONES DE GESTIÓN DE USUARIOS (CRUD) ===
// ===============================================

// --- Acción: get_users (LISTAR) ---
function getUsers() {
    $conn = connectDB();
    
    $sql = "SELECT id, nombre_completo, username, cargo, DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha_creacion
            FROM usuarios 
            ORDER BY fecha_creacion DESC";
            
    $result = $conn->query($sql);
    $users = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        http_response_code(200);
        echo json_encode(["data" => $users]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener usuarios: " . $conn->error]);
    }
}

// --- Acción: create_user (CREAR) ---
function createUser($data) {
    $conn = connectDB();
    
    $nombre = $conn->real_escape_string($data['full_name']);
    $user = $conn->real_escape_string($data['username']);
    $pass = $data['password'];
    $cargo = $conn->real_escape_string($data['role']);
    
    $hashed_pass = sha1($pass);
    
    // CAMBIO 1: Eliminada 'contrasena_clara' de la inserción
    $sql = "INSERT INTO usuarios (nombre_completo, username, password_hash, cargo) 
            VALUES ('$nombre', '$user', '$hashed_pass', '$cargo')";
            
    if ($conn->query($sql) === TRUE) {
        http_response_code(201);
        echo json_encode(["message" => "Usuario creado con éxito", "id" => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al crear usuario: " . $conn->error]);
    }
}

// --- Acción: update_user (EDITAR DATOS) ---
function updateUser($data) {
    $conn = connectDB();
    
    $id = $conn->real_escape_string($data['id']);
    $nombre = $conn->real_escape_string($data['full_name']);
    $user = $conn->real_escape_string($data['username']);
    $cargo = $conn->real_escape_string($data['role']);

    if ($id == 1 && $cargo !== 'Ingeniero') {
        http_response_code(403);
        echo json_encode(["error" => "No se puede cambiar el cargo del administrador principal (ID 1) a menos que sea 'Ingeniero'."]);
        return;
    }
    
    $sql = "UPDATE usuarios SET 
                nombre_completo = '$nombre', 
                username = '$user', 
                cargo = '$cargo'
            WHERE id = '$id'";
            
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode(["message" => "Usuario actualizado con éxito."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar usuario: " . $conn->error]);
    }
}

// --- Acción: reset_password (RESETEAR CLAVE) ---
function resetPassword($data) {
    $conn = connectDB();
    
    $id = $conn->real_escape_string($data['id']);
    $newPass = $data['new_password']; // Sigue usando '123456' del frontend

    $hashed_pass = sha1($newPass);
    
    // CAMBIO 2: Eliminada 'contrasena_clara' del UPDATE
    $sql = "UPDATE usuarios SET 
                password_hash = '$hashed_pass' 
            WHERE id = '$id'";
            
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode(["message" => "Contraseña restablecida con éxito."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al restablecer contraseña: " . $conn->error]);
    }
}

// --- Acción: delete_user (ELIMINAR) ---
function deleteUser($data) {
    $conn = connectDB();
    $id = $conn->real_escape_string($data['user_id']);

    if ($id == 1) {
        http_response_code(403);
        echo json_encode(["error" => "No se puede eliminar la cuenta de administrador principal."]);
        return;
    }

    $sql = "DELETE FROM usuarios WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode(["message" => "Usuario eliminado con éxito"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar usuario: " . $conn->error]);
    }
}

// ===============================================
// === 4. FUNCIONES DEL CHATBOT EDUCATIVO ===
// ===============================================

// --- Acción: save_chatbot_query (GUARDAR CONSULTA) ---
function saveChatbotQuery($data) {
    $conn = connectDB();
    
    $username = $conn->real_escape_string($data['username']);
    $mensaje = $conn->real_escape_string($data['mensaje']);
    $tipo = $conn->real_escape_string($data['tipo']);
    $categoria = isset($data['categoria']) ? $conn->real_escape_string($data['categoria']) : 'general';
    $respuesta = isset($data['respuesta']) ? $conn->real_escape_string($data['respuesta']) : null;
    
    // Obtener el ID del usuario si existe
    $user_id = null;
    $user_sql = "SELECT id FROM usuarios WHERE username = '$username'";
    $user_result = $conn->query($user_sql);
    if ($user_result && $user_result->num_rows > 0) {
        $user_row = $user_result->fetch_assoc();
        $user_id = $user_row['id'];
    }
    
    // Determinar el estado inicial
    $estado = 'PENDIENTE';
    if ($respuesta) {
        $estado = 'RESUELTA';
    }
    
    $sql = "INSERT INTO consultas_chatbot (usuario_id, username, tipo, categoria, mensaje, respuesta, estado) 
            VALUES (" . ($user_id ? $user_id : 'NULL') . ", '$username', '$tipo', '$categoria', '$mensaje', " . 
            ($respuesta ? "'$respuesta'" : 'NULL') . ", '$estado')";
    
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode([
            "message" => "Consulta guardada con éxito",
            "query_id" => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar consulta: " . $conn->error]);
    }
}

// --- Acción: get_chatbot_queries (OBTENER CONSULTAS) ---
function getChatbotQueries() {
    $conn = connectDB();
    
    $username = isset($_GET['username']) ? $conn->real_escape_string($_GET['username']) : null;
    
    $sql = "SELECT 
                id, username, tipo, categoria, mensaje, respuesta, estado,
                DATE_FORMAT(fecha_consulta, '%Y-%m-%d %H:%i:%s') AS fecha_consulta,
                DATE_FORMAT(fecha_respuesta, '%Y-%m-%d %H:%i:%s') AS fecha_respuesta
            FROM consultas_chatbot";
    
    if ($username) {
        $sql .= " WHERE username = '$username'";
    }
    
    $sql .= " ORDER BY fecha_consulta DESC LIMIT 50";
    
    $result = $conn->query($sql);
    $queries = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $queries[] = $row;
        }
        http_response_code(200);
        echo json_encode(["data" => $queries]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener consultas: " . $conn->error]);
    }
}

// --- Acción: update_chatbot_query (ACTUALIZAR CONSULTA/RESPONDER) ---
function updateChatbotQuery($data) {
    $conn = connectDB();
    
    $id = $conn->real_escape_string($data['id']);
    $respuesta = isset($data['respuesta']) ? $conn->real_escape_string($data['respuesta']) : null;
    $estado = isset($data['estado']) ? $conn->real_escape_string($data['estado']) : 'RESUELTA';
    
    $sql = "UPDATE consultas_chatbot SET 
                respuesta = " . ($respuesta ? "'$respuesta'" : 'respuesta') . ",
                estado = '$estado',
                fecha_respuesta = NOW()
            WHERE id = '$id'";
    
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode(["message" => "Consulta actualizada con éxito"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar consulta: " . $conn->error]);
    }
}

// ===============================================
// === 5. FUNCIONES DE SOLICITUDES DE INSTALACIÓN ===
// ===============================================

// --- Acción: submit_installation (ENVIAR SOLICITUD DE INSTALACIÓN) ---
function submitInstallation() {
    $conn = connectDB();
    
    // Establecer header JSON desde el inicio
    header('Content-Type: application/json');
    
    // Verificar que se haya subido un archivo
    if (!isset($_FILES['exe_file']) || $_FILES['exe_file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["error" => "Error al subir el archivo. Por favor, asegúrate de seleccionar un archivo .exe válido."]);
        exit;
    }
    
    $file = $_FILES['exe_file'];
    
    // Validar que sea un archivo .exe
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($fileExtension !== 'exe') {
        http_response_code(400);
        echo json_encode(["error" => "Solo se permiten archivos .exe"]);
        exit;
    }
    
    // Validar tamaño (máximo 100MB)
    $maxSize = 100 * 1024 * 1024; // 100MB
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["error" => "El archivo es demasiado grande. Máximo permitido: 100MB"]);
        exit;
    }
    
    // Obtener datos del formulario
    $username = isset($_POST['username']) ? $conn->real_escape_string($_POST['username']) : 'Usuario';
    $nombreSoftware = isset($_POST['nombre_software']) ? $conn->real_escape_string($_POST['nombre_software']) : pathinfo($file['name'], PATHINFO_FILENAME);
    $salonDestino = isset($_POST['salon_destino']) ? $conn->real_escape_string($_POST['salon_destino']) : 'Aula 1';
    $mensajeSolicitud = isset($_POST['mensaje_solicitud']) ? $conn->real_escape_string($_POST['mensaje_solicitud']) : null;
    
    // Obtener el ID del usuario si existe
    $user_id = null;
    $user_sql = "SELECT id FROM usuarios WHERE username = '$username'";
    $user_result = $conn->query($user_sql);
    if ($user_result && $user_result->num_rows > 0) {
        $user_row = $user_result->fetch_assoc();
        $user_id = $user_row['id'];
    }
    
    // Preparar datos
    $nombreArchivo = $conn->real_escape_string($file['name']);
    $tipoArchivo = $conn->real_escape_string($file['type']);
    $tamañoArchivo = $file['size'];
    
    // Crear estructura de carpetas: distribucion/exe/ o distribucion/docs/
    $baseDir = __DIR__ . '/distribucion';
    $subDir = ($fileExtension === 'exe') ? 'exe' : 'docs';
    $uploadDir = $baseDir . '/' . $subDir . '/';
    
    // Crear directorios si no existen
    if (!file_exists($baseDir)) {
        mkdir($baseDir, 0777, true);
    }
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Generar nombre único para el archivo
    $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
    $filePath = $uploadDir . $fileName;
    
    // Mover el archivo al directorio correspondiente
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar el archivo en el servidor"]);
        exit;
    }
    
    // Ruta relativa para guardar en la BD
    $archivoRuta = 'distribucion/' . $subDir . '/' . $fileName;
    
    // Insertar en la base de datos
    $stmt = $conn->prepare("INSERT INTO solicitudes_instalacion 
            (usuario_id, username, nombre_software, archivo_ruta, nombre_archivo, tipo_archivo, tamaño_archivo, salon_destino, mensaje_solicitud, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')");
    
    if (!$stmt) {
        // Si falla, eliminar el archivo subido
        unlink($filePath);
        http_response_code(500);
        echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("isssssiss", 
        $user_id, 
        $username, 
        $nombreSoftware, 
        $archivoRuta, 
        $nombreArchivo, 
        $tipoArchivo, 
        $tamañoArchivo, 
        $salonDestino, 
        $mensajeSolicitud
    );
    
    if ($stmt->execute()) {
        $solicitudId = $conn->insert_id;
        http_response_code(200);
        echo json_encode([
            "message" => "Solicitud de instalación registrada con éxito",
            "solicitud_id" => $solicitudId,
            "software" => $nombreSoftware,
            "salon" => $salonDestino
        ]);
    } else {
        // Si falla la inserción, eliminar el archivo subido
        unlink($filePath);
        http_response_code(500);
        echo json_encode(["error" => "Error al registrar la solicitud: " . $stmt->error]);
    }
    
    $stmt->close();
}

// --- Acción: get_installations (OBTENER SOLICITUDES DE INSTALACIÓN) ---
function getInstallations() {
    $conn = connectDB();
    
    $username = isset($_GET['username']) ? $conn->real_escape_string($_GET['username']) : null;
    $includeFile = isset($_GET['include_file']) && $_GET['include_file'] === 'true';
    
    $sql = "SELECT 
                id, username, nombre_software, nombre_archivo, tipo_archivo, tamaño_archivo, archivo_ruta, salon_destino, 
                mensaje_solicitud, estado, script_powershell, resultado_ejecucion,
                DATE_FORMAT(fecha_solicitud, '%Y-%m-%d %H:%i:%s') AS fecha_solicitud,
                DATE_FORMAT(fecha_completada, '%Y-%m-%d %H:%i:%s') AS fecha_completada
            FROM solicitudes_instalacion";
    
    if ($username) {
        $sql .= " WHERE username = '$username'";
    }
    
    $sql .= " ORDER BY fecha_solicitud DESC LIMIT 50";
    
    $result = $conn->query($sql);
    $installations = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $installations[] = $row;
        }
        http_response_code(200);
        echo json_encode(["data" => $installations]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener solicitudes: " . $conn->error]);
    }
}

// --- Acción: download_installation_file (DESCARGAR ARCHIVO DE INSTALACIÓN) ---
function downloadInstallationFile() {
    $conn = connectDB();
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id <= 0) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(["error" => "ID de solicitud inválido"]);
        exit;
    }
    
    // Obtener la ruta del archivo desde la base de datos
    $stmt = $conn->prepare("SELECT nombre_archivo, archivo_ruta FROM solicitudes_instalacion WHERE id = ?");
    
    if (!$stmt) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verificar que la ruta del archivo existe
        if (empty($row['archivo_ruta'])) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode([
                "error" => "Ruta de archivo no encontrada en la base de datos. Este registro fue creado antes de la actualización del sistema. Por favor, elimina este registro y crea uno nuevo subiendo el archivo nuevamente."
            ]);
            $stmt->close();
            exit;
        }
        
        // Construir la ruta completa del archivo
        $filePath = __DIR__ . '/' . $row['archivo_ruta'];
        
        // Verificar que el archivo existe en el sistema de archivos
        if (!file_exists($filePath)) {
            // Intentar buscar en la ubicación antigua (uploads/installations/)
            $oldPath = __DIR__ . '/uploads/installations/' . basename($row['archivo_ruta']);
            if (file_exists($oldPath)) {
                $filePath = $oldPath;
            } else {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode([
                    "error" => "Archivo no encontrado en el servidor: " . $row['archivo_ruta'] . ". El archivo puede haber sido eliminado o movido."
                ]);
                $stmt->close();
                exit;
            }
        }
        
        // Limpiar cualquier output anterior
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        // Establecer headers para descarga binaria
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . addslashes($row['nombre_archivo']) . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        
        // Leer y enviar el archivo
        readfile($filePath);
        
        $stmt->close();
        exit;
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Solicitud no encontrada"]);
        $stmt->close();
        exit;
    }
}

// --- Acción: generate_powershell_script (GENERAR SCRIPT POWERSHELL) ---
function generatePowerShellScript($data) {
    $conn = connectDB();
    
    $id = intval($data['id']);
    $salon = $conn->real_escape_string($data['salon_destino']);
    
    // Obtener información de la solicitud
    $sql = "SELECT nombre_archivo, nombre_software, salon_destino FROM solicitudes_instalacion WHERE id = $id";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Solicitud no encontrada"]);
        return;
    }
    
    $solicitud = $result->fetch_assoc();
    
    // Generar script PowerShell automáticamente
    $script = generateInstallationScript($solicitud['nombre_software'], $solicitud['nombre_archivo'], $salon, $id);
    
    // Guardar el script en la base de datos
    $updateSql = "UPDATE solicitudes_instalacion SET script_powershell = '" . 
                 $conn->real_escape_string($script) . "' WHERE id = $id";
    
    if ($conn->query($updateSql)) {
        http_response_code(200);
        echo json_encode([
            "message" => "Script PowerShell generado con éxito",
            "script" => $script
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar el script: " . $conn->error]);
    }
}

// --- Función auxiliar para generar script PowerShell ---
function generateInstallationScript($softwareName, $fileName, $salon, $solicitudId = null) {
    // Mapeo de salones a rangos de IP o nombres de computadoras
    $salonComputers = [
        'Aula 1' => ['PC-AULA1-01', 'PC-AULA1-02', 'PC-AULA1-03', 'PC-AULA1-04', 'PC-AULA1-05'],
        'Aula 2' => ['PC-AULA2-01', 'PC-AULA2-02', 'PC-AULA2-03', 'PC-AULA2-04', 'PC-AULA2-05'],
        'Aula 3' => ['PC-AULA3-01', 'PC-AULA3-02', 'PC-AULA3-03', 'PC-AULA3-04', 'PC-AULA3-05'],
        'Aula 4' => ['PC-AULA4-01', 'PC-AULA4-02', 'PC-AULA4-03', 'PC-AULA4-04', 'PC-AULA4-05'],
        'Todas las aulas' => ['PC-AULA1-01', 'PC-AULA1-02', 'PC-AULA1-03', 'PC-AULA1-04', 'PC-AULA1-05',
                              'PC-AULA2-01', 'PC-AULA2-02', 'PC-AULA2-03', 'PC-AULA2-04', 'PC-AULA2-05',
                              'PC-AULA3-01', 'PC-AULA3-02', 'PC-AULA3-03', 'PC-AULA3-04', 'PC-AULA3-05',
                              'PC-AULA4-01', 'PC-AULA4-02', 'PC-AULA4-03', 'PC-AULA4-04', 'PC-AULA4-05']
    ];
    
    $computers = isset($salonComputers[$salon]) ? $salonComputers[$salon] : ['PC-AULA1-01'];
    
    $script = "# Script generado automáticamente para instalar $softwareName\n";
    $script .= "# Destino: $salon\n";
    $script .= "# Archivo: $fileName\n";
    $script .= "# Solicitud ID: " . ($solicitudId ? $solicitudId : 'N/A') . "\n\n";
    
    $script .= "# Configuración\n";
    $script .= "\$softwareName = \"$softwareName\"\n";
    $script .= "\$fileName = \"$fileName\"\n";
    
    // Ruta donde se guardará el archivo descargado del servidor
    $script .= "\$localInstallerPath = \"C:\\Temp\\Instalaciones\\$fileName\"\n";
    $script .= "\$serverApiUrl = \"http://localhost/api_handler.php?action=download_installation_file&id=" . ($solicitudId ? $solicitudId : '') . "\"\n";
    
    $script .= "\$computers = @(\n";
    foreach ($computers as $pc) {
        $script .= "    \"$pc\",\n";
    }
    $script .= ")\n\n";
    
    $script .= "# Crear directorio temporal si no existe\n";
    $script .= "\$tempDir = Split-Path -Parent \$localInstallerPath\n";
    $script .= "if (-not (Test-Path \$tempDir)) {\n";
    $script .= "    New-Item -ItemType Directory -Path \$tempDir -Force | Out-Null\n";
    $script .= "}\n\n";
    
    $script .= "# Descargar archivo desde la base de datos\n";
    $script .= "Write-Host \"Descargando archivo desde la base de datos...\" -ForegroundColor Cyan\n";
    $script .= "try {\n";
    $script .= "    Invoke-WebRequest -Uri \$serverApiUrl -OutFile \$localInstallerPath -UseBasicParsing\n";
    $script .= "    Write-Host \"✓ Archivo descargado correctamente\" -ForegroundColor Green\n";
    $script .= "} catch {\n";
    $script .= "    Write-Host \"✗ Error al descargar archivo: \$(\$_.Exception.Message)\" -ForegroundColor Red\n";
    $script .= "    exit 1\n";
    $script .= "}\n\n";
    
    $script .= "# Función para instalar en una computadora remota\n";
    $script .= "function Install-SoftwareOnComputer {\n";
    $script .= "    param(\n";
    $script .= "        [string]\$ComputerName,\n";
    $script .= "        [string]\$InstallerPath\n";
    $script .= "    )\n\n";
    $script .= "    try {\n";
    $script .= "        Write-Host \"Instalando en \$ComputerName...\" -ForegroundColor Yellow\n";
    $script .= "        \n";
    $script .= "        # Copiar archivo a la computadora remota\n";
    $script .= "        \$remotePath = \"\\\\\$ComputerName\\C\$\\Temp\\\$fileName\"\n";
    $script .= "        \$remoteDir = Split-Path -Parent \$remotePath\n";
    $script .= "        \n";
    $script .= "        # Crear directorio remoto si no existe\n";
    $script .= "        Invoke-Command -ComputerName \$ComputerName -ScriptBlock {\n";
    $script .= "            param(\$Dir)\n";
    $script .= "            if (-not (Test-Path \$Dir)) {\n";
    $script .= "                New-Item -ItemType Directory -Path \$Dir -Force | Out-Null\n";
    $script .= "            }\n";
    $script .= "        } -ArgumentList \$remoteDir\n";
    $script .= "        \n";
    $script .= "        Copy-Item -Path \$InstallerPath -Destination \$remotePath -Force\n";
    $script .= "        \n";
    $script .= "        # Ejecutar instalación silenciosa\n";
    $script .= "        \$result = Invoke-Command -ComputerName \$ComputerName -ScriptBlock {\n";
    $script .= "            param(\$FilePath)\n";
    $script .= "            Start-Process -FilePath \$FilePath -ArgumentList \"/S\", \"/silent\", \"/norestart\" -Wait -NoNewWindow -ErrorAction Stop\n";
    $script .= "            return \$LASTEXITCODE\n";
    $script .= "        } -ArgumentList \$remotePath\n";
    $script .= "        \n";
    $script .= "        if (\$result -eq 0) {\n";
    $script .= "            Write-Host \"✓ Instalación exitosa en \$ComputerName\" -ForegroundColor Green\n";
    $script .= "            return \$true\n";
    $script .= "        } else {\n";
    $script .= "            Write-Host \"✗ Error en la instalación en \$ComputerName (Código: \$result)\" -ForegroundColor Red\n";
    $script .= "            return \$false\n";
    $script .= "        }\n";
    $script .= "    } catch {\n";
    $script .= "        Write-Host \"✗ Error al conectar con \$ComputerName : \$(\$_.Exception.Message)\" -ForegroundColor Red\n";
    $script .= "        return \$false\n";
    $script .= "    }\n";
    $script .= "}\n\n";
    
    $script .= "# Procesar cada computadora\n";
    $script .= "\$successCount = 0\n";
    $script .= "\$failCount = 0\n\n";
    
    $script .= "foreach (\$computer in \$computers) {\n";
    $script .= "    if (Test-Connection -ComputerName \$computer -Count 1 -Quiet) {\n";
    $script .= "        if (Install-SoftwareOnComputer -ComputerName \$computer -InstallerPath \$localInstallerPath) {\n";
    $script .= "            \$successCount++\n";
    $script .= "        } else {\n";
    $script .= "            \$failCount++\n";
    $script .= "        }\n";
    $script .= "    } else {\n";
    $script .= "        Write-Host \"✗ No se pudo conectar con \$computer\" -ForegroundColor Red\n";
    $script .= "        \$failCount++\n";
    $script .= "    }\n";
    $script .= "}\n\n";
    
    $script .= "# Limpiar archivo temporal\n";
    $script .= "if (Test-Path \$localInstallerPath) {\n";
    $script .= "    Remove-Item \$localInstallerPath -Force\n";
    $script .= "}\n\n";
    
    $script .= "# Resumen\n";
    $script .= "Write-Host \"`n=== RESUMEN ===\" -ForegroundColor Cyan\n";
    $script .= "Write-Host \"Instalaciones exitosas: \$successCount\" -ForegroundColor Green\n";
    $script .= "Write-Host \"Instalaciones fallidas: \$failCount\" -ForegroundColor Red\n";
    $script .= "Write-Host \"Total de computadoras: \$(\$computers.Count)\" -ForegroundColor Yellow\n";
    
    return $script;
}

// --- Acción: execute_powershell_script (EJECUTAR SCRIPT POWERSHELL) ---
function executePowerShellScript($data) {
    $conn = connectDB();
    
    $id = intval($data['id']);
    
    // Obtener el script de la base de datos
    $sql = "SELECT script_powershell, nombre_software, salon_destino FROM solicitudes_instalacion WHERE id = $id";
    $result = $conn->query($sql);
    
    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Solicitud no encontrada"]);
        return;
    }
    
    $solicitud = $result->fetch_assoc();
    
    if (empty($solicitud['script_powershell'])) {
        http_response_code(400);
        echo json_encode(["error" => "No hay script PowerShell generado para esta solicitud"]);
        return;
    }
    
    // Actualizar estado a EN_PROCESO
    $conn->query("UPDATE solicitudes_instalacion SET estado = 'EN_PROCESO' WHERE id = $id");
    
    // Guardar script temporalmente
    $tempScriptPath = sys_get_temp_dir() . '/install_' . $id . '_' . time() . '.ps1';
    file_put_contents($tempScriptPath, $solicitud['script_powershell']);
    
    // Ejecutar PowerShell (requiere permisos de ejecución)
    $command = "powershell.exe -ExecutionPolicy Bypass -File \"$tempScriptPath\" 2>&1";
    $output = [];
    $returnCode = 0;
    
    exec($command, $output, $returnCode);
    
    $resultado = implode("\n", $output);
    
    // Limpiar archivo temporal
    if (file_exists($tempScriptPath)) {
        unlink($tempScriptPath);
    }
    
    // Actualizar estado y resultado
    $estado = ($returnCode === 0) ? 'COMPLETADA' : 'FALLIDA';
    $updateSql = "UPDATE solicitudes_instalacion SET 
                    estado = '$estado',
                    resultado_ejecucion = '" . $conn->real_escape_string($resultado) . "',
                    fecha_completada = NOW()
                  WHERE id = $id";
    
    $conn->query($updateSql);
    
    http_response_code(200);
    echo json_encode([
        "message" => "Script ejecutado",
        "estado" => $estado,
        "resultado" => $resultado,
        "return_code" => $returnCode
    ]);
}


// ===============================================
// === 3. PUNTO DE ENTRADA API (ROUTING) ===
// ===============================================

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    
    // NO establecer header JSON aquí porque download_installation_file necesita headers binarios
    // Se establecerá después según la acción

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Manejar solicitudes de instalación que usan FormData (multipart/form-data)
        if ($action === 'submit_installation') {
            submitInstallation();
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data) && $action !== 'delete_user') {
            http_response_code(400);
            echo json_encode(["error" => "Datos POST no válidos."]);
            exit;
        }

        if ($action === 'login') {
            handleLogin($data);
        } elseif ($action === 'distribute') {
            handleDistribution($data);
        } elseif ($action === 'create_user') {
            createUser($data);
        } elseif ($action === 'update_user') {
            updateUser($data);
        } elseif ($action === 'reset_password') {
            resetPassword($data);
        } elseif ($action === 'delete_user') {
            deleteUser($data);
        } elseif ($action === 'save_chatbot_query') {
            saveChatbotQuery($data);
        } elseif ($action === 'update_chatbot_query') {
            updateChatbotQuery($data);
        } elseif ($action === 'generate_powershell_script') {
            generatePowerShellScript($data);
        } elseif ($action === 'execute_powershell_script') {
            executePowerShellScript($data);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Acción API no encontrada."]);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Manejar descarga de archivo antes de establecer headers JSON
        if ($action === 'download_installation_file') {
            downloadInstallationFile();
            exit; // Ya se hace exit dentro, pero por seguridad
        }
        
        // Para todas las demás acciones GET, establecer header JSON
        header('Content-Type: application/json');
        
        if ($action === 'get_history') {
            getTaskHistory();
        } elseif ($action === 'get_users') {
            getUsers();
        } elseif ($action === 'get_chatbot_queries') {
            getChatbotQueries();
        } elseif ($action === 'get_installations') {
            getInstallations();
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Acción API no encontrada."]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido."]);
    }
    exit;
}
?>