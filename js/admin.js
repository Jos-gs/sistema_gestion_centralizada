// Archivo: js/admin.js (FINAL - Corregido el error de addEventListener)

document.addEventListener('DOMContentLoaded', () => {
    // Cargar la sección de registros por defecto
    loadContent('registers'); 
    
    // Inicializar listeners de modales (para los botones "Cancelar" y "Cerrar")
    setupModalListeners();
    
    // --- LÓGICA DE LISTENERS ESTÁTICOS (SOLO SE EJECUTAN UNA VEZ) ---
    // ESTO CORRIGE EL ERROR "Cannot read properties of null"
    
    // Listener de Creación de Usuario
    const addForm = document.getElementById('add-user-form');
    if (addForm) {
        addForm.addEventListener('submit', handleCreateUser);
    }

    // Listeners de Edición y Reseteo
    const editForm = document.getElementById('edit-user-form');
    const resetBtn = document.getElementById('reset-password-btn');

    if (editForm) {
        editForm.addEventListener('submit', handleUpdateUser);
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetPassword);
    }
    // ----------------------------------------------------------------
});

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const API_ENDPOINT = API_SERVER_ENDPOINT || 'api_handler.php';

// Función para obtener el username desde la URL
function getCurrentUsername() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user') || '';
} 

// --- Control de Navegación Lateral ---
function loadContent(view) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === `nav-${view}`) {
            link.classList.add('active');
        }
    });

    if (view === 'registers') {
        renderRegisters();
    } else if (view === 'users') {
        renderUserManagement();
    } else if (view === 'consultas') {
        renderConsultas();
    } else if (view === 'ia') {
        renderIAInstalaciones();
    } else {
        mainContent.innerHTML = `
            <h2>${view.charAt(0).toUpperCase() + view.slice(1)}</h2>
            <div id="history-container">
                <p style="color:#f39c12;">Funcionalidad ${view} en desarrollo.</p>
            </div>
        `;
    }
}

function setupModalListeners() {
    // Escucha todos los botones de "Cancelar" o "Cerrar" en modales
    document.querySelectorAll('.modal .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            // Limpiar formularios al cerrar
            const addForm = document.getElementById('add-user-form');
            const editForm = document.getElementById('edit-user-form');
            if (addForm) addForm.reset();
            if (editForm) editForm.reset();
            const addAlert = document.getElementById('add-user-alert');
            const editAlert = document.getElementById('edit-user-alert');
            if (addAlert) addAlert.innerText = '';
            if (editAlert) editAlert.innerText = '';
        });
    });
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// ===========================================
// === 1. GESTIÓN DE USUARIOS (USERS VIEW) ===
// ===========================================

function renderUserManagement() {
    // Renderiza solo el contenido dinámico del contenedor principal
    mainContent.innerHTML = `
        <h2>👥 Gestión de Usuarios</h2>
        <div class="controls-header">
            <p>Lista completa de usuarios registrados en el sistema.</p>
            <button id="add-user-btn">➕ Ingresar Nuevo Usuario</button>
        </div>
        <div id="users-list-container">
            <p>Cargando usuarios...</p>
        </div>
    `;

    // El listener para el botón "Agregar" SÍ debe estar aquí, ya que el botón se acaba de crear.
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => showModal('add-user-modal'));
    }
    
    fetchUsers();
}

// --- Fetch y Render de Usuarios (Tabla simplificada) ---
async function fetchUsers() {
    const container = document.getElementById('users-list-container');
    container.innerHTML = '<p>Cargando usuarios...</p>';

    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_users`);
        const result = await response.json();

        if (response.ok) {
            renderUsersTable(result.data);
        } else {
            container.innerHTML = `<p style="color:#e74c3c;">Error al cargar usuarios: ${result.error || 'Fallo desconocido.'}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p style="color:#e74c3c;">Error de conexión con la API: ${error.message}</p>`;
    }
}

function renderUsersTable(users) {
    const container = document.getElementById('users-list-container');

    if (users.length === 0) {
        container.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
    }

    const html = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>Usuario</th>
                    <th>Cargo</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td data-name="${user.nombre_completo}">${user.nombre_completo}</td>
                        <td data-user="${user.username}">${user.username}</td>
                        <td data-role="${user.cargo}">${user.cargo}</td>
                        <td>${user.fecha_creacion}</td>
                        <td>
                            <button class="action-btn edit-user-btn" data-id="${user.id}">✏️</button>
                            <button class="action-btn delete-user-btn" data-id="${user.id}">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
    
    // Asignar listeners a botones de acción (estos botones se crean dinámicamente)
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDeleteUser(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const user = {
                id: e.currentTarget.dataset.id,
                // Usamos dataset para asegurar la obtención de los valores correctos
                nombre_completo: row.querySelector('td:nth-child(2)').dataset.name,
                username: row.querySelector('td:nth-child(3)').dataset.user,
                cargo: row.querySelector('td:nth-child(4)').dataset.role
            };
            showEditModal(user);
        });
    });
}

// --- Lógica de Creación de Usuario ---
async function handleCreateUser(event) {
    event.preventDefault();
    const alert = document.getElementById('add-user-alert');
    const fullName = document.getElementById('new-full-name').value;
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (!fullName || !username || !password || !role) {
        alert.innerText = '❌ Por favor, complete todos los campos.';
        alert.style.color = '#e74c3c';
        return;
    }

    alert.innerText = 'Creando...';

    try {
        const response = await fetch(`${API_ENDPOINT}?action=create_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, username, password, role })
        });
        const result = await response.json();

        if (response.ok) {
            alert.innerText = `✅ ${result.message}`;
            alert.style.color = '#2ecc77';
            setTimeout(() => {
                document.getElementById('add-user-modal').style.display = 'none';
                document.getElementById('add-user-form').reset();
                fetchUsers(); 
            }, 1000);
        } else {
            alert.innerText = `❌ Error: ${result.error || 'Fallo al crear usuario.'}`;
            alert.style.color = '#e74c3c';
        }
    } catch (error) {
        alert.innerText = `❌ Error de conexión: ${error.message}`;
        alert.style.color = '#e74c3c';
    }
}

// --- Lógica de Eliminación de Usuario ---
async function handleDeleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=delete_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        const result = await response.json();

        if (response.ok) {
            alert(`✅ ${result.message}`);
            fetchUsers(); 
        } else {
            alert(`❌ Error al eliminar: ${result.error || 'Fallo desconocido.'}`);
        }
    } catch (error) {
        alert(`❌ Error de conexión al eliminar: ${error.message}`);
    }
}

// --- Lógica de Edición (Update) ---
function showEditModal(user) {
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-full-name').value = user.nombre_completo;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-role').value = user.cargo;
    document.getElementById('edit-user-alert').innerText = '';

    showModal('edit-user-modal');
}

async function handleUpdateUser(event) {
    event.preventDefault();
    const alert = document.getElementById('edit-user-alert');
    const id = document.getElementById('edit-user-id').value;
    const fullName = document.getElementById('edit-full-name').value;
    const username = document.getElementById('edit-username').value;
    const role = document.getElementById('edit-role').value;

    alert.innerText = 'Actualizando...';

    try {
        const response = await fetch(`${API_ENDPOINT}?action=update_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, full_name: fullName, username, role })
        });
        const result = await response.json();

        if (response.ok) {
            alert.innerText = `✅ ${result.message}`;
            alert.style.color = '#2ecc77';
            setTimeout(() => {
                document.getElementById('edit-user-modal').style.display = 'none';
                fetchUsers(); 
            }, 1000);
        } else {
            alert.innerText = `❌ Error: ${result.error || 'Fallo al actualizar.'}`;
            alert.style.color = '#e74c3c';
        }
    } catch (error) {
        alert.innerText = `❌ Error de conexión: ${error.message}`;
        alert.style.color = '#e74c3c';
    }
}

// --- Lógica de Reseteo de Contraseña ---
async function handleResetPassword() {
    if (!confirm('⚠️ ¿Está seguro de que desea restablecer la contraseña de este usuario? Se establecerá como "123456".')) {
        return;
    }
    
    const alert = document.getElementById('edit-user-alert');
    const id = document.getElementById('edit-user-id').value;
    const newPass = '123456'; 

    alert.innerText = 'Restableciendo...';

    try {
        const response = await fetch(`${API_ENDPOINT}?action=reset_password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, new_password: newPass })
        });
        const result = await response.json();

        if (response.ok) {
            alert.innerText = `✅ ${result.message} (Nueva clave: ${newPass})`;
            alert.style.color = '#2ecc77';
            setTimeout(() => {
                 // Dejamos el modal abierto por si el usuario necesita la clave temporal
            }, 2000);
        } else {
            alert.innerText = `❌ Error: ${result.error || 'Fallo al restablecer contraseña.'}`;
            alert.style.color = '#e74c3c';
        }
    } catch (error) {
        alert.innerText = `❌ Error de conexión: ${error.message}`;
        alert.style.color = '#e74c3c';
    }
}


// ===========================================
// === 2. REGISTROS (REGISTERS VIEW) ===
// ===========================================

async function renderRegisters() {
    mainContent.innerHTML = `
        <h2>📋 Registros de Distribución</h2>
        <div id="history-container">
            <p>Cargando historial...</p>
        </div>
    `;
    const historyContainer = document.getElementById('history-container');

    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_history`);
        const result = await response.json();

        if (response.ok) {
            if (result.data.length === 0) {
                historyContainer.innerHTML = '<p>No hay registros de distribución aún.</p>';
                return;
            }
            
            const groupedHistory = result.data.reduce((acc, item) => {
                (acc[item.date_only] = acc[item.date_only] || []).push(item);
                return acc;
            }, {});

            let html = '';
            for (const date in groupedHistory) {
                html += renderDayGroup(date, groupedHistory[date]);
            }
            historyContainer.innerHTML = html;

        } else {
            historyContainer.innerHTML = `<p style="color:#e74c3c;">Error al cargar datos: ${result.error || 'Fallo desconocido.'}</p>`;
        }

    } catch (error) {
        historyContainer.innerHTML = `<p style="color:#e74c3c;">Error de conexión con la API: ${error.message}</p>`;
    }
}

function renderDayGroup(date, tasks) {
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    let tableRows = tasks.map(task => `
        <tr>
            <td>${task.documento_nombre || task.document_name}</td>
            <td>${task.salon_destino || task.salon}</td>
            <td>${task.time_only}</td>
        </tr>
    `).join('');

    return `
        <div class="day-group">
            <h3>📅 ${formattedDate}</h3>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>📄 Documento</th>
                        <th>🏫 Salón</th>
                        <th>⏰ Hora de Envío</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// ===========================================
// === 3. CONSULTAS DEL CHATBOT ===
// ===========================================

async function renderConsultas() {
    mainContent.innerHTML = `
        <h2>💬 Consultas del Chatbot</h2>
        <p>Gestión de consultas, solicitudes y sugerencias realizadas por los profesores a través del chatbot educativo.</p>
        <div id="consultas-container">
            <p>Cargando consultas...</p>
        </div>
    `;
    
    const consultasContainer = document.getElementById('consultas-container');
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_chatbot_queries`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.data.length === 0) {
                consultasContainer.innerHTML = '<p>No hay consultas registradas aún.</p>';
                return;
            }
            
            renderConsultasTable(result.data);
        } else {
            consultasContainer.innerHTML = `<p style="color:#e74c3c;">Error al cargar consultas: ${result.error || 'Fallo desconocido.'}</p>`;
        }
    } catch (error) {
        consultasContainer.innerHTML = `<p style="color:#e74c3c;">Error de conexión con la API: ${error.message}</p>`;
    }
}

// Variable global para almacenar las consultas
let currentConsultas = [];

function renderConsultasTable(consultas) {
    currentConsultas = consultas; // Guardar en variable global
    const container = document.getElementById('consultas-container');
    
    const html = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${consultas.map(consulta => {
                    const estadoColor = consulta.estado === 'RESUELTA' ? '#2ecc71' : 
                                       consulta.estado === 'EN_PROCESO' ? '#f39c12' : '#e74c3c';
                    const tipoIcon = consulta.tipo === 'CONSULTA' ? '❓' : 
                                    consulta.tipo === 'SOLICITUD' ? '📝' : 
                                    consulta.tipo === 'REPORTE' ? '⚠️' : '💡';
                    
                    // Escapar HTML en el mensaje para evitar XSS
                    const mensajeEscapado = consulta.mensaje.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    
                    return `
                        <tr>
                            <td>${consulta.id}</td>
                            <td>${consulta.username}</td>
                            <td>${tipoIcon} ${consulta.tipo}</td>
                            <td>${consulta.categoria || 'N/A'}</td>
                            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
                                title="${mensajeEscapado}">${mensajeEscapado.substring(0, 50)}${mensajeEscapado.length > 50 ? '...' : ''}</td>
                            <td><span style="color: ${estadoColor}; font-weight: 600;">${consulta.estado}</span></td>
                            <td>${consulta.fecha_consulta}</td>
                            <td>
                                <button class="action-btn view-consulta-btn" data-id="${consulta.id}" title="Ver detalles">
                                    👁️
                                </button>
                                ${consulta.estado !== 'RESUELTA' ? `
                                    <button class="action-btn resolve-consulta-btn" data-id="${consulta.id}" title="Marcar como resuelta">
                                        ✅
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    // Asignar listeners a botones de acción
    document.querySelectorAll('.view-consulta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const consultaId = e.currentTarget.dataset.id;
            const consulta = currentConsultas.find(c => c.id == consultaId);
            if (consulta) {
                showConsultaModal(consulta);
            }
        });
    });
    
    document.querySelectorAll('.resolve-consulta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const consultaId = e.currentTarget.dataset.id;
            handleResolveConsulta(consultaId);
        });
    });
}

function showConsultaModal(consulta) {
    const estadoColor = consulta.estado === 'RESUELTA' ? '#2ecc71' : 
                        consulta.estado === 'EN_PROCESO' ? '#f39c12' : '#e74c3c';
    
    // Escapar HTML para evitar XSS
    const mensajeEscapado = (consulta.mensaje || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    const respuestaEscapada = (consulta.respuesta || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    
    const modalHTML = `
        <div id="view-consulta-modal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 600px;">
                <h3>💬 Detalles de la Consulta #${consulta.id}</h3>
                <div style="margin-bottom: 20px;">
                    <p><strong>Usuario:</strong> ${consulta.username}</p>
                    <p><strong>Tipo:</strong> ${consulta.tipo}</p>
                    <p><strong>Categoría:</strong> ${consulta.categoria || 'N/A'}</p>
                    <p><strong>Estado:</strong> <span style="color: ${estadoColor};">${consulta.estado}</span></p>
                    <p><strong>Fecha:</strong> ${consulta.fecha_consulta}</p>
                </div>
                <div class="input-group">
                    <label><strong>Mensaje del Usuario:</strong></label>
                    <div style="background: rgba(30, 40, 50, 0.7); padding: 15px; border-radius: 8px; border: 1px solid #34495e; color: #ecf0f1; min-height: 80px; white-space: pre-wrap;">
                        ${mensajeEscapado}
                    </div>
                </div>
                ${consulta.respuesta ? `
                    <div class="input-group">
                        <label><strong>Respuesta:</strong></label>
                        <div style="background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #2ecc71; color: #ecf0f1; min-height: 80px; white-space: pre-wrap;">
                            ${respuestaEscapada}
                        </div>
                    </div>
                ` : '<p style="color: #f39c12;">Sin respuesta aún.</p>'}
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" onclick="document.getElementById('view-consulta-modal').style.display='none'">
                        ❌ Cerrar
                    </button>
                    ${consulta.estado !== 'RESUELTA' ? `
                        <button type="button" class="confirm-btn" onclick="handleResolveConsulta(${consulta.id}); document.getElementById('view-consulta-modal').style.display='none';">
                            ✅ Marcar como Resuelta
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al body si no existe
    let modal = document.getElementById('view-consulta-modal');
    if (modal) {
        modal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function handleResolveConsulta(consultaId) {
    if (!confirm('¿Está seguro de que desea marcar esta consulta como resuelta?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=update_chatbot_query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: consultaId, 
                estado: 'RESUELTA',
                respuesta: 'Consulta resuelta por el administrador.'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ ${result.message}`);
            renderConsultas();
        } else {
            alert(`❌ Error: ${result.error || 'Fallo al actualizar consulta.'}`);
        }
    } catch (error) {
        alert(`❌ Error de conexión: ${error.message}`);
    }
}

// ===========================================
// === 4. IA - INSTALACIONES AUTOMÁTICAS ===
// ===========================================

async function renderIAInstalaciones() {
    mainContent.innerHTML = `
        <h2>🤖 IA - Instalaciones Automáticas</h2>
        <p style="color: #bdc3c7; margin-bottom: 20px;">
            Gestión inteligente de instalaciones de software. La IA genera y ejecuta scripts PowerShell automáticamente.
        </p>
        <div id="ia-installations-container">
            <p>Cargando solicitudes de instalación...</p>
        </div>
    `;
    
    await fetchInstallations();
}

async function fetchInstallations() {
    const container = document.getElementById('ia-installations-container');
    container.innerHTML = '<p>Cargando solicitudes...</p>';
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_installations`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.data.length === 0) {
                container.innerHTML = '<p>No hay solicitudes de instalación registradas aún.</p>';
                return;
            }
            
            renderInstallationsTable(result.data);
        } else {
            container.innerHTML = `<p style="color:#e74c3c;">Error al cargar solicitudes: ${result.error || 'Fallo desconocido.'}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p style="color:#e74c3c;">Error de conexión: ${error.message}</p>`;
    }
}

function renderInstallationsTable(installations) {
    const container = document.getElementById('ia-installations-container');
    
    const html = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Software</th>
                    <th>Archivo</th>
                    <th>Salón</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${installations.map(inst => {
                    const estadoColor = inst.estado === 'COMPLETADA' ? '#2ecc71' : 
                                       inst.estado === 'EN_PROCESO' ? '#f39c12' : 
                                       inst.estado === 'FALLIDA' ? '#e74c3c' : '#95a5a6';
                    const estadoIcon = inst.estado === 'COMPLETADA' ? '✅' : 
                                      inst.estado === 'EN_PROCESO' ? '⏳' : 
                                      inst.estado === 'FALLIDA' ? '❌' : '⏸️';
                    
                    const tamañoMB = inst.tamaño_archivo ? (inst.tamaño_archivo / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
                    
                    return `
                        <tr>
                            <td>${inst.id}</td>
                            <td>${inst.username}</td>
                            <td><strong>${inst.nombre_software}</strong></td>
                            <td>${inst.nombre_archivo}<br><small style="color: #95a5a6;">${tamañoMB}</small></td>
                            <td>${inst.salon_destino}</td>
                            <td><span style="color: ${estadoColor}; font-weight: 600;">${estadoIcon} ${inst.estado}</span></td>
                            <td>${inst.fecha_solicitud}</td>
                            <td>
                                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                    ${inst.estado === 'PENDIENTE' ? `
                                        <button class="action-btn generate-script-btn" data-id="${inst.id}" title="Generar Script PowerShell">
                                            📝 Generar Script
                                        </button>
                                    ` : ''}
                                    ${inst.script_powershell && inst.estado !== 'EN_PROCESO' && inst.estado !== 'COMPLETADA' ? `
                                        <button class="action-btn execute-script-btn" data-id="${inst.id}" title="Ejecutar Script">
                                            ▶️ Ejecutar
                                        </button>
                                    ` : ''}
                                    ${inst.script_powershell ? `
                                        <button class="action-btn view-script-btn" data-id="${inst.id}" title="Ver Script">
                                            👁️ Ver Script
                                        </button>
                                    ` : ''}
                                    ${inst.resultado_ejecucion ? `
                                        <button class="action-btn view-result-btn" data-id="${inst.id}" title="Ver Resultado">
                                            📊 Resultado
                                        </button>
                                    ` : ''}
                                    <button class="action-btn download-file-btn" data-id="${inst.id}" title="Descargar Archivo">
                                        💾 Descargar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    // Asignar listeners
    document.querySelectorAll('.generate-script-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleGenerateScript(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.execute-script-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleExecuteScript(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.view-script-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleViewScript(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.view-result-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleViewResult(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.download-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDownloadFile(e.currentTarget.dataset.id));
    });
}

async function handleGenerateScript(id) {
    if (!confirm('¿Generar script PowerShell automáticamente para esta solicitud?')) {
        return;
    }
    
    try {
        // Primero obtener la información de la solicitud para el salón
        const response = await fetch(`${API_ENDPOINT}?action=get_installations`);
        const result = await response.json();
        const solicitud = result.data.find(s => s.id == id);
        
        if (!solicitud) {
            alert('❌ Solicitud no encontrada');
            return;
        }
        
        const generateResponse = await fetch(`${API_ENDPOINT}?action=generate_powershell_script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: id,
                salon_destino: solicitud.salon_destino
            })
        });
        
        const generateResult = await generateResponse.json();
        
        if (generateResponse.ok) {
            alert(`✅ ${generateResult.message}`);
            fetchInstallations();
        } else {
            alert(`❌ Error: ${generateResult.error || 'Fallo al generar script.'}`);
        }
    } catch (error) {
        alert(`❌ Error de conexión: ${error.message}`);
    }
}

async function handleExecuteScript(id) {
    if (!confirm('⚠️ ¿Está seguro de ejecutar este script PowerShell? Esto instalará el software en todas las computadoras del salón.')) {
        return;
    }
    
    // Obtener el username del administrador desde la URL
    const username = getCurrentUsername();
    if (!username) {
        alert('❌ Error: No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=execute_powershell_script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, username: username })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ Script ejecutado. Estado: ${result.estado}`);
            fetchInstallations();
        } else {
            alert(`❌ Error: ${result.error || 'Fallo al ejecutar script.'}`);
        }
    } catch (error) {
        alert(`❌ Error de conexión: ${error.message}`);
    }
}

async function handleViewScript(id) {
    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_installations`);
        const result = await response.json();
        const solicitud = result.data.find(s => s.id == id);
        
        if (!solicitud || !solicitud.script_powershell) {
            alert('❌ No hay script disponible para esta solicitud');
            return;
        }
        
        const modalHTML = `
            <div id="view-script-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 800px;">
                    <h3>📝 Script PowerShell - Solicitud #${id}</h3>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Software:</strong> ${solicitud.nombre_software}</p>
                        <p><strong>Salón:</strong> ${solicitud.salon_destino}</p>
                    </div>
                    <div class="input-group">
                        <label><strong>Script Generado:</strong></label>
                        <textarea readonly style="width: 100%; height: 400px; background: #1e1e1e; color: #d4d4d4; font-family: 'Courier New', monospace; padding: 15px; border-radius: 8px; border: 1px solid #34495e; font-size: 12px; white-space: pre-wrap; overflow-y: auto;">${solicitud.script_powershell.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="cancel-btn" onclick="document.getElementById('view-script-modal').style.display='none'">
                            ❌ Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        let modal = document.getElementById('view-script-modal');
        if (modal) {
            modal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

async function handleViewResult(id) {
    try {
        const response = await fetch(`${API_ENDPOINT}?action=get_installations`);
        const result = await response.json();
        const solicitud = result.data.find(s => s.id == id);
        
        if (!solicitud || !solicitud.resultado_ejecucion) {
            alert('❌ No hay resultado disponible para esta solicitud');
            return;
        }
        
        const modalHTML = `
            <div id="view-result-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 800px;">
                    <h3>📊 Resultado de Ejecución - Solicitud #${id}</h3>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Estado:</strong> <span style="color: ${solicitud.estado === 'COMPLETADA' ? '#2ecc71' : '#e74c3c'}">${solicitud.estado}</span></p>
                        <p><strong>Fecha:</strong> ${solicitud.fecha_completada || 'N/A'}</p>
                    </div>
                    <div class="input-group">
                        <label><strong>Salida del Script:</strong></label>
                        <textarea readonly style="width: 100%; height: 400px; background: #1e1e1e; color: #d4d4d4; font-family: 'Courier New', monospace; padding: 15px; border-radius: 8px; border: 1px solid #34495e; font-size: 12px; white-space: pre-wrap; overflow-y: auto;">${solicitud.resultado_ejecucion.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="cancel-btn" onclick="document.getElementById('view-result-modal').style.display='none'">
                            ❌ Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        let modal = document.getElementById('view-result-modal');
        if (modal) {
            modal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

function handleDownloadFile(id) {
    window.open(`${API_ENDPOINT}?action=download_installation_file&id=${id}`, '_blank');
}