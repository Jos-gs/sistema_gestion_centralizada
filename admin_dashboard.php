<?php
// Título: admin_dashboard.php
// Variables pasadas por GET
$username = $_GET['user'] ?? 'Usuario';
$full_name = isset($_GET['name']) ? htmlspecialchars(urldecode($_GET['name'])) : 'Ingeniero'; 
$role = 'Ingeniero';
$API_ENDPOINT = $API_ENDPOINT ?? 'api_handler.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Administrador</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <header>
        <h1>🔧 CIST - Panel de Administración</h1>
        <div>
            <span style="margin-right: 20px;">
                Bienvenido, <strong style="color: #3498db;"><?php echo $full_name; ?></strong> 
                (<span style="font-weight: 500; color: #bdc3c7;"><?php echo htmlspecialchars($username); ?></span>)
            </span>
            <button onclick="window.location.href = 'index.php'">🚪 Cerrar Sesión</button>
        </div>
    </header>

    <div class="main-container">
        
        <aside class="sidebar">
            <div class="sidebar-header">
                <h3>🏫 Los Algarrobos</h3>
                <div class="sidebar-subtitle">Sistema de Gestión Centralizada</div>
            </div>
            <nav class="sidebar-nav">
                <a href="#registers" id="nav-registers" class="active" onclick="loadContent('registers')">
                    <span>📋</span> 
                    <span>Registros de Distribución</span>
                </a>
                <a href="#users" id="nav-users" onclick="loadContent('users')">
                    <span>👥</span> 
                    <span>Gestión de Usuarios</span>
                </a>
                <a href="#consultas" id="nav-consultas" onclick="loadContent('consultas')">
                    <span>💬</span> 
                    <span>Consultas del Chatbot</span>
                </a>
                <a href="#ia" id="nav-ia" onclick="loadContent('ia')">
                    <span>🤖</span> 
                    <span>IA - Instalaciones</span>
                </a>
                <a href="#settings" id="nav-settings" onclick="loadContent('settings')">
                    <span>⚙️</span> 
                    <span>Configuración</span>
                </a>
            </nav>
        </aside>

        <main class="content" id="main-content">
            </main>
    </div>

    <script>
        const API_SERVER_ENDPOINT = "<?php echo $API_ENDPOINT; ?>";
    </script>
    <script src="js/admin.js"></script>
</body>
<!-- Modal para Agregar Usuario -->
<div id="add-user-modal" class="modal">
    <div class="modal-content">
        <h3>➕ Ingresar Nuevo Usuario</h3>
        <p style="color: #bdc3c7; font-size: 0.9em; margin-top: -10px; margin-bottom: 20px;">
            Complete los datos para crear un nuevo usuario en el sistema.
        </p>
        <form id="add-user-form">
            <div class="input-group">
                <label for="new-full-name">📝 Nombre Completo</label>
                <input type="text" id="new-full-name" placeholder="Ej: Juan Pérez" required>
            </div>
            <div class="input-group">
                <label for="new-username">👤 Usuario</label>
                <input type="text" id="new-username" placeholder="Ej: juan.perez" required>
            </div>
            <div class="input-group">
                <label for="new-password">🔒 Contraseña</label>
                <input type="password" id="new-password" placeholder="Mínimo 6 caracteres" required>
            </div>
            <div class="input-group">
                <label for="new-role">🎭 Cargo</label>
                <select id="new-role" required>
                    <option value="">Seleccione un cargo</option>
                    <option value="Ingeniero">🔧 Ingeniero</option>
                    <option value="Docente">👨‍🏫 Docente</option>
                </select>
            </div>
            <p id="add-user-alert" style="text-align:center; margin-top:10px; min-height: 20px;"></p>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">❌ Cancelar</button>
                <button type="submit" class="confirm-btn">✅ Crear Usuario</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal para Editar Usuario -->
<div id="edit-user-modal" class="modal">
    <div class="modal-content">
        <h3>✏️ Editar Usuario</h3>
        <p style="color: #bdc3c7; font-size: 0.9em; margin-top: -10px; margin-bottom: 20px;">
            Modifique los datos del usuario. Para cambiar la contraseña, use el botón de restablecer.
        </p>
        <form id="edit-user-form">
            <input type="hidden" id="edit-user-id">
            <div class="input-group">
                <label for="edit-full-name">📝 Nombre Completo</label>
                <input type="text" id="edit-full-name" required>
            </div>
            <div class="input-group">
                <label for="edit-username">👤 Usuario</label>
                <input type="text" id="edit-username" required>
            </div>
            <div class="input-group">
                <label for="edit-role">🎭 Cargo</label>
                <select id="edit-role" required>
                    <option value="Ingeniero">🔧 Ingeniero</option>
                    <option value="Docente">👨‍🏫 Docente</option>
                </select>
            </div>
            <div class="input-group" style="margin-top: 15px;">
                <button type="button" id="reset-password-btn" class="reset-password-btn">
                    🔄 Restablecer Contraseña
                </button>
            </div>
            <p id="edit-user-alert" style="text-align:center; margin-top:10px; min-height: 20px;"></p>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">❌ Cancelar</button>
                <button type="submit" class="confirm-btn">💾 Guardar Cambios</button>
            </div>
        </form>
    </div>
</div>
</html>