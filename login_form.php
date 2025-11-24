<?php 
$API_ENDPOINT = $API_ENDPOINT ?? 'api_handler.php'; 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CIST</title>
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="login-container">
        <h2>CIST</h2>
        <div id="datetime-display" style="text-align: center; color: #1565c0; font-size: 16px; font-weight: 600; margin-bottom: 20px; padding: 10px; background: #e3f2fd; border-radius: 6px;">
            <div id="date-display"></div>
            <div id="time-display" style="font-size: 20px; margin-top: 5px;"></div>
        </div>
        <p class="text-center" style="color: #bdc3c7; font-size: 14px; margin-bottom: 25px;">
        </p>
        
        <form id="login-form">
            <div class="input-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" autocomplete="username" required placeholder="Ej: ing_admin">
            </div>
            <div class="input-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" autocomplete="current-password" required placeholder="Contraseña">
            </div>
            <button type="submit" id="login-btn">
                Iniciar Sesión
            </button>
        </form>
        <p id="login-error" class="hidden">Error de credenciales.</p>
    </div>

    <script>
        const API_SERVER_ENDPOINT = "<?php echo $API_ENDPOINT; ?>"; 
        
        // Función para actualizar fecha y hora
        function updateDateTime() {
            const now = new Date();
            const dateDisplay = document.getElementById('date-display');
            const timeDisplay = document.getElementById('time-display');
            
            if (dateDisplay && timeDisplay) {
                // Formatear fecha
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                const dateString = now.toLocaleDateString('es-ES', options);
                dateDisplay.textContent = dateString;
                
                // Formatear hora
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
            }
        }
        
        // Actualizar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            updateDateTime();
            setInterval(updateDateTime, 1000);
        });
    </script>
    <script src="js/login.js"></script>
</body>
</html>