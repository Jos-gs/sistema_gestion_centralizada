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
        <p class="text-center" style="color: #bdc3c7; font-size: 14px; margin-bottom: 25px;">
        </p>
        
        <form id="login-form">
            <div class="input-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required placeholder="Ej: ing_admin">
            </div>
            <div class="input-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="Contraseña">
            </div>
            <button type="submit" id="login-btn">
                Iniciar Sesión
            </button>
        </form>
        <p id="login-error" class="hidden">Error de credenciales.</p>
    </div>

    <script>
        const API_SERVER_ENDPOINT = "<?php echo $API_ENDPOINT; ?>"; 
    </script>
    <script src="js/login.js"></script>
</body>
</html>