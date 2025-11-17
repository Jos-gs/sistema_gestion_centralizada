<?php
// Título: teacher_dashboard.php
$username = $_GET['user'] ?? 'Usuario';
$full_name = isset($_GET['name']) ? htmlspecialchars(urldecode($_GET['name'])) : 'Docente'; 
$role = 'Docente';
$API_ENDPOINT = $API_ENDPOINT ?? 'api_handler.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Docente</title>
    <link rel="stylesheet" href="css/teacher.css">
</head>
<body>
    <header>
        <h1>CIST - DOCENTE</h1>
        <div>
            <span style="margin-right: 20px;">
                Bienvenido, <strong style="color: #3498db;"><?php echo $full_name; ?></strong> 
                (<span style="font-weight: 500;"><?php echo htmlspecialchars($username); ?></span>)
            </span>
            <button onclick="window.location.href = 'index.php'">Cerrar Sesión</button>
        </div>
    </header>

    <div class="dashboard-container">
        
        <div class="panel chatbot-panel">
            <h2>🤖 Asistente Educativo Virtual</h2>
            <p style="color: #bdc3c7; font-size: 0.9em; margin-top: -15px; margin-bottom: 20px;">
                Haz preguntas, solicita soporte o comparte sugerencias. Estoy aquí para ayudarte.
            </p>
            <div class="chat-box" id="chat-box">
                </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Escribe tu pregunta, solicitud o consulta...">
                <button id="send-btn">
                    <span>Enviar</span>
                    <span style="margin-left: 5px;">📤</span>
                </button>
            </div>
        </div>
        
        <div class="panel distribution-panel">
            <h2>📚 Distribución de Documentos</h2>
            <p style="color: #bdc3c7; font-size: 0.9em; margin-top: -15px; margin-bottom: 20px;">
                Envía materiales educativos a las aulas de forma centralizada.
            </p>
            
            <form id="distribution-form" onsubmit="event.preventDefault(); distributeDocument();">
                
                <h3 style="color: #ecf0f1; margin-bottom: 15px;">📄 Paso 1: Cargar Documento</h3>
                
                <div id="drop-area">
                    <p style="color: #3498db; font-size: 1.1em;">Arrastra y suelta el archivo aquí</p>
                    <p style="color: #bdc3c7; font-size: 0.9em; margin-top: 5px;">o haz clic para seleccionar</p>
                    <input type="file" id="file-upload" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" style="display: none;">
                </div>
                
                <div id="file-info" class="file-info">
                    Ningún documento seleccionado.
                </div>

                <h3 style="color: #ecf0f1; margin-top: 25px; margin-bottom: 15px;">🎯 Paso 2: Seleccionar Destino</h3>

                <div class="distribution-controls">
                    <label for="classroom-select">Enviar a:</label>
                    <select id="classroom-select" required>
                        <option value="Aula 1">Aula 1 (Todas las laptops)</option>
                        <option value="Aula 2">Aula 2 (Todas las laptops)</option>
                        <option value="Aula 3">Aula 3 (Todas las laptops)</option>
                        <option value="Aula 4">Aula 4 (Todas las laptops)</option>
                    </select>
                </div>

                <button type="submit" id="distribute-btn" class="distribute-btn" disabled>
                    Distribuir a Aula
                </button>
            </form>
            
            <div id="distribution-alert" class="message-alert hidden"></div>
        </div>
    </div>
    
    <script>
        const API_SERVER_ENDPOINT = "<?php echo $API_ENDPOINT; ?>";
    </script>
    <script src="js/teacher.js"></script>
</body>
</html>