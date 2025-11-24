// Archivo: js/teacher.js (FINAL - Distribución, Drag&Drop, NO Elimina al distribuir)

let selectedFile = null;
const API_ENDPOINT = API_SERVER_ENDPOINT || 'api_handler.php';

// --- Elementos del DOM ---
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-upload');
const fileInfo = document.getElementById('file-info');
const distributeBtn = document.getElementById('distribute-btn');
const distributionAlert = document.getElementById('distribution-alert');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// --- Drag and Drop Setup ---
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

dropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files), false);
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    if (files.length > 0) {
        showAlert('', '');
        selectedFile = files[0];
        updateFileInfo();
    }
}

// --- Muestra la info y el botón de Eliminar ---
function updateFileInfo() {
    if (selectedFile) {
        const sizeKB = (selectedFile.size / 1024).toFixed(2);
        
        fileInfo.innerHTML = `
            <p>Archivo cargado: <strong>${selectedFile.name}</strong></p>
            <p>Tamaño: ${sizeKB} KB</p>
            <div class="file-actions">
                <span>Listo para distribución.</span>
                <button id="remove-file-btn">Eliminar</button>
            </div>
        `;
        
        document.getElementById('remove-file-btn').addEventListener('click', removeFile);
        distributeBtn.disabled = false;
    } else {
        fileInfo.innerHTML = `Ningún documento seleccionado.`;
        distributeBtn.disabled = true;
    }
}

// --- FUNCIÓN ELIMINAR DOCUMENTO (Llamada manual) ---
function removeFile(event) {
    if (event && event.stopPropagation) {
        event.stopPropagation();
    }
    
    selectedFile = null; 
    fileInput.value = ''; 
    
    updateFileInfo(); 
    showAlert('Archivo eliminado. Seleccione un nuevo documento.', 'error');
}


// --- Lógica de Distribución (CORREGIDA: NO llama a removeFile) ---

async function distributeDocument() {
    if (!selectedFile) {
        showAlert('Por favor, arrastre o suba un documento.', 'error');
        return;
    }

    const target = document.getElementById('classroom-select').value;
    const filename = selectedFile.name;

    distributeBtn.disabled = true;
    distributeBtn.innerText = "Enviando Tarea...";
    distributeBtn.style.backgroundColor = '#5d6d7e';
    showAlert('', '');

    let response = null;
    let success = false;

    try {
        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append('document_file', selectedFile);
        formData.append('filename', filename);
        formData.append('target_classroom', target);

        response = await fetch(`${API_ENDPOINT}?action=distribute`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showAlert(`✅ Documento distribuido a ${target}. Script PowerShell generado y ejecutado.`, 'success');
            
            // LA LÍNEA DE ELIMINACIÓN FUE COMENTADA/QUITADA PERMANENTEMENTE. 
            // El archivo PERMANECE visible y cargado.
            // removeFile({ stopPropagation: () => {} }); 
            
            distributeBtn.style.backgroundColor = '#27ae60';
            success = true;
        } else {
            showAlert(`❌ Error al distribuir: ${result.error || 'Fallo desconocido.'}`, 'error');
            distributeBtn.style.backgroundColor = '#e74c3c';
        }

    } catch (error) {
        showAlert(`❌ Error de conexión al servidor: ${error.message}`, 'error');
        distributeBtn.style.backgroundColor = '#e74c3c';
    } finally {
        distributeBtn.disabled = false;
        distributeBtn.innerText = "Distribuir a Aula";
        if (!success && (!response || !response.ok)) { 
             distributeBtn.style.backgroundColor = '#3498db';
        }
    }
}

function showAlert(message, type) {
    distributionAlert.classList.remove('success', 'error', 'hidden');
    distributionAlert.innerText = message;
    
    if (message) {
        distributionAlert.classList.add(type);
    } else {
        distributionAlert.classList.add('hidden');
    }
}

// --- Lógica del Chatbot Educativo ---
let currentUsername = '';
let currentUserId = null;

// Obtener información del usuario desde la URL
function getUserInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    currentUsername = urlParams.get('user') || 'Usuario';
    // En una implementación real, obtendrías el ID del usuario desde la sesión
}

// Variables para solicitudes de instalación
let pendingInstallationRequest = null;
let installationExeFile = null;

// Base de conocimiento educativa
const knowledgeBase = {
    'distribuir': {
        respuesta: "📚 Para distribuir un documento:\n\n1. Ve al panel 'Distribución de Documentos' a la derecha\n2. Arrastra tu archivo o haz clic para seleccionarlo\n3. Elige el aula de destino\n4. Haz clic en 'Distribuir a Aula'\n\n💡 Tip: Los formatos soportados son PDF, Word, Excel y PowerPoint.",
        categoria: 'sistema',
        tipo: 'CONSULTA'
    },
    'instalar': {
        respuesta: "🔧 Solicitud de instalación detectada. Por favor, sube el archivo .exe del software.",
        categoria: 'instalacion',
        tipo: 'SOLICITUD'
    },
    'reporte': {
        respuesta: "📊 Puedo ayudarte con reportes de:\n\n• Distribución de documentos\n• Historial de tareas enviadas\n• Estadísticas de uso del sistema\n\n¿Qué tipo de reporte necesitas específicamente?",
        categoria: 'sistema',
        tipo: 'CONSULTA'
    },
    'soporte': {
        respuesta: "🛠️ Para solicitar soporte técnico:\n\n1. Describe tu problema detalladamente\n2. Menciona qué estabas haciendo cuando ocurrió\n3. Incluye cualquier mensaje de error que hayas visto\n\nTu solicitud será registrada y un administrador te ayudará pronto.",
        categoria: 'soporte',
        tipo: 'SOLICITUD'
    },
    'tutorial': {
        respuesta: "📖 Guía rápida del sistema:\n\n1. **Distribución de documentos**: Usa el panel derecho para enviar archivos a las aulas\n2. **Chatbot**: Haz preguntas aquí para obtener ayuda\n3. **Solicitudes**: Puedes crear solicitudes de soporte o sugerencias\n\n¿Sobre qué función específica quieres más información?",
        categoria: 'tutorial',
        tipo: 'CONSULTA'
    },
    'sugerencia': {
        respuesta: "💡 ¡Me encanta recibir sugerencias!\n\nPor favor, describe tu idea de mejora. Todas las sugerencias son revisadas por el equipo de administración.\n\n¿Qué te gustaría mejorar en el sistema?",
        categoria: 'sugerencia',
        tipo: 'SUGERENCIA'
    },
    'problema': {
        respuesta: "⚠️ Para reportar un problema:\n\n1. Describe qué estaba pasando\n2. Menciona los pasos que seguiste\n3. Incluye capturas de pantalla si es posible\n\nTu reporte será registrado y atendido lo antes posible.",
        categoria: 'soporte',
        tipo: 'REPORTE'
    }
};

// Función para detectar la intención del usuario
function detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Detectar solicitudes de instalación
    if (lowerMessage.includes('instalar') || lowerMessage.includes('instalación') || 
        lowerMessage.includes('instale') || lowerMessage.includes('instala')) {
        return 'instalar';
    } else if (lowerMessage.includes('distribuir') || lowerMessage.includes('documento') || lowerMessage.includes('archivo')) {
        return 'distribuir';
    } else if (lowerMessage.includes('reporte') || lowerMessage.includes('estadística') || lowerMessage.includes('historial')) {
        return 'reporte';
    } else if (lowerMessage.includes('soporte') || lowerMessage.includes('ayuda') || lowerMessage.includes('problema técnico')) {
        return 'soporte';
    } else if (lowerMessage.includes('tutorial') || lowerMessage.includes('cómo') || lowerMessage.includes('guía') || lowerMessage.includes('ayuda')) {
        return 'tutorial';
    } else if (lowerMessage.includes('sugerencia') || lowerMessage.includes('mejora') || lowerMessage.includes('idea')) {
        return 'sugerencia';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('fallo') || lowerMessage.includes('no funciona')) {
        return 'problema';
    }
    
    return null;
}

// Función para extraer información de instalación del mensaje
function extractInstallationInfo(message) {
    const lowerMessage = message.toLowerCase();
    const info = {
        software: null,
        salon: null,
        originalMessage: message
    };
    
    // Detectar nombre del software (ej: winrar, win rar, etc.)
    const softwarePatterns = [
        /(?:instalar|instale|instala)\s+(?:el\s+)?([a-z0-9\s]+?)(?:\s+a\s+|\s+en\s+|$)/i,
        /([a-z0-9\s]+?)(?:\s+a\s+todas\s+las\s+computadoras)/i
    ];
    
    for (const pattern of softwarePatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            info.software = match[1].trim();
            break;
        }
    }
    
    // Si no se encontró, buscar palabras comunes de software
    if (!info.software) {
        const commonSoftware = ['winrar', 'win rar', 'chrome', 'firefox', 'vscode', 'visual studio', 'office', 'adobe'];
        for (const sw of commonSoftware) {
            if (lowerMessage.includes(sw)) {
                info.software = sw;
                break;
            }
        }
    }
    
    // Detectar salón (Aula 1, Aula 2, etc.)
    const salonPattern = /(?:sal[oó]n|aula)\s*(\d+)/i;
    const salonMatch = message.match(salonPattern);
    if (salonMatch) {
        info.salon = `Aula ${salonMatch[1]}`;
    } else if (lowerMessage.includes('todas') || lowerMessage.includes('todos')) {
        info.salon = 'Todas las aulas';
    }
    
    return info;
}

// Función para agregar mensaje al chat
function addChatMessage(message, sender, isEducational = false, suggestions = null, customHTML = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    
    if (isEducational) {
        messageElement.classList.add('educational');
    }
    
    // Si hay HTML personalizado, usarlo; si no, formatear el mensaje
    if (customHTML) {
        messageElement.innerHTML = customHTML;
    } else {
        // Convertir saltos de línea en <br>
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageElement.innerHTML = `<p>${formattedMessage}</p><small>${new Date().toLocaleTimeString()}</small>`;
    }
    
    // Agregar sugerencias rápidas si existen
    if (suggestions && suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.classList.add('quick-suggestions');
        
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.classList.add('quick-suggestion-btn');
            btn.textContent = suggestion;
            btn.addEventListener('click', () => {
                chatInput.value = suggestion;
                handleChatInput();
            });
            suggestionsDiv.appendChild(btn);
        });
        
        messageElement.appendChild(suggestionsDiv);
    }
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función para mostrar indicador de escritura
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typingElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función para ocultar indicador de escritura
function hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// Función para guardar consulta en la base de datos
async function saveChatbotQuery(message, tipo, categoria, respuesta = null) {
    try {
        const response = await fetch(`${API_ENDPOINT}?action=save_chatbot_query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUsername,
                mensaje: message,
                tipo: tipo,
                categoria: categoria,
                respuesta: respuesta
            })
        });
        
        if (!response.ok) {
            console.error('Error al guardar consulta:', await response.text());
        }
    } catch (error) {
        console.error('Error de conexión al guardar consulta:', error);
    }
}

// Función principal para manejar el input del chat
async function handleChatInput() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Deshabilitar input mientras se procesa
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Agregar mensaje del usuario
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    // Detectar intención
    const intent = detectIntent(message);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    hideTypingIndicator();
    
    let respuesta = '';
    let categoria = 'general';
    let tipo = 'CONSULTA';
    let suggestions = null;
    let customHTML = null;
    
    if (intent && knowledgeBase[intent]) {
        const knowledge = knowledgeBase[intent];
        
        // Manejo especial para solicitudes de instalación
        if (intent === 'instalar') {
            const installInfo = extractInstallationInfo(message);
            pendingInstallationRequest = installInfo;
            
            respuesta = `🔧 Solicitud de instalación detectada:\n\n`;
            respuesta += `📦 Software: ${installInfo.software || 'No especificado'}\n`;
            respuesta += `🏫 Salón: ${installInfo.salon || 'No especificado'}\n\n`;
            respuesta += `Por favor, sube el archivo .exe del software:`;
            
            categoria = 'instalacion';
            tipo = 'SOLICITUD';
            
            // Crear HTML personalizado con input de archivo
            customHTML = `
                <p>${respuesta.replace(/\n/g, '<br>')}</p>
                <div class="installation-upload-container" style="margin-top: 15px; padding: 15px; background: #2c3e50; border-radius: 8px;">
                    <input type="file" id="exe-file-input" accept=".exe" style="display: none;">
                    <button id="select-exe-btn" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        📁 Seleccionar archivo .exe
                    </button>
                    <span id="exe-file-name" style="color: #ecf0f1;"></span>
                    <div style="margin-top: 10px;">
                        <select id="install-salon-select" style="padding: 8px; border-radius: 5px; margin-right: 10px;">
                            <option value="Aula 1">Aula 1</option>
                            <option value="Aula 2">Aula 2</option>
                            <option value="Aula 3">Aula 3</option>
                            <option value="Aula 4">Aula 4</option>
                            <option value="Todas las aulas">Todas las aulas</option>
                        </select>
                        <button id="submit-install-btn" style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; display: none;">
                            ✅ Enviar solicitud de instalación
                        </button>
                    </div>
                </div>
                <small>${new Date().toLocaleTimeString()}</small>
            `;
            
            // Configurar eventos después de agregar al DOM
            setTimeout(() => {
                const exeInput = document.getElementById('exe-file-input');
                const selectBtn = document.getElementById('select-exe-btn');
                const fileName = document.getElementById('exe-file-name');
                const submitBtn = document.getElementById('submit-install-btn');
                const salonSelect = document.getElementById('install-salon-select');
                
                if (installInfo.salon) {
                    salonSelect.value = installInfo.salon;
                }
                
                selectBtn.addEventListener('click', () => exeInput.click());
                
                exeInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        installationExeFile = e.target.files[0];
                        fileName.textContent = `📄 ${installationExeFile.name} (${(installationExeFile.size / 1024 / 1024).toFixed(2)} MB)`;
                        submitBtn.style.display = 'inline-block';
                    }
                });
                
                submitBtn.addEventListener('click', async () => {
                    if (!installationExeFile) {
                        alert('Por favor, selecciona un archivo .exe');
                        return;
                    }
                    
                    await submitInstallationRequest();
                });
            }, 100);
            
        } else {
            respuesta = knowledge.respuesta;
            categoria = knowledge.categoria;
            tipo = knowledge.tipo;
        }
        
        // Sugerencias rápidas según el tipo
        if (intent === 'distribuir') {
            suggestions = ['¿Cómo distribuir un documento?', '¿Qué formatos se aceptan?'];
        } else if (intent === 'reporte') {
            suggestions = ['Ver historial de documentos', 'Estadísticas de uso'];
        } else if (intent === 'soporte') {
            suggestions = ['Reportar un problema', 'Solicitar ayuda técnica'];
        } else if (intent === 'tutorial') {
            suggestions = ['Guía de distribución', 'Cómo usar el sistema'];
        }
    } else {
        // Respuesta genérica inteligente
        respuesta = `🤔 Entiendo tu consulta. Déjame ayudarte:\n\n`;
        respuesta += `Puedo ayudarte con:\n`;
        respuesta += `• 📄 Distribución de documentos\n`;
        respuesta += `• 📊 Reportes y estadísticas\n`;
        respuesta += `• 🛠️ Soporte técnico\n`;
        respuesta += `• 📖 Tutoriales y guías\n`;
        respuesta += `• 💡 Sugerencias de mejora\n\n`;
        respuesta += `¿Sobre qué tema específico necesitas ayuda?`;
        
        suggestions = ['Distribuir documento', 'Ver reportes', 'Solicitar soporte', 'Ver tutorial'];
    }
    
    // Guardar consulta en la base de datos
    await saveChatbotQuery(message, tipo, categoria, respuesta);
    
    // Agregar respuesta del bot
    addChatMessage(respuesta, 'bot', true, suggestions, customHTML);
    
    // Rehabilitar input
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
}

// Función para enviar solicitud de instalación
async function submitInstallationRequest() {
    if (!pendingInstallationRequest || !installationExeFile) {
        showAlert('Error: Faltan datos de la solicitud', 'error');
        return;
    }
    
    const salonSelect = document.getElementById('install-salon-select');
    const salon = salonSelect ? salonSelect.value : pendingInstallationRequest.salon || 'Aula 1';
    const software = pendingInstallationRequest.software || installationExeFile.name.replace('.exe', '');
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('exe_file', installationExeFile);
    formData.append('username', currentUsername);
    formData.append('nombre_software', software);
    formData.append('salon_destino', salon);
    formData.append('mensaje_solicitud', pendingInstallationRequest.originalMessage);
    
    try {
        const response = await fetch(`${API_ENDPOINT}?action=submit_installation`, {
            method: 'POST',
            body: formData
        });
        
        // Verificar que la respuesta sea JSON válido
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            addChatMessage(
                `❌ Error: La respuesta del servidor no es válida. ${text.substring(0, 100)}`,
                'bot',
                true
            );
            return;
        }
        
        const result = await response.json();
        
        if (response.ok) {
            addChatMessage(
                `✅ Solicitud de instalación enviada con éxito!\n\n` +
                `📦 Software: ${software}\n` +
                `🏫 Salón: ${salon}\n` +
                `📄 Archivo: ${installationExeFile.name}\n\n` +
                `Tu solicitud ha sido registrada y será procesada por el administrador.`,
                'bot',
                true
            );
            
            // Limpiar variables
            pendingInstallationRequest = null;
            installationExeFile = null;
            
            // Guardar en consultas del chatbot también
            await saveChatbotQuery(
                `Solicitud de instalación: ${software} en ${salon}`,
                'SOLICITUD',
                'instalacion',
                'Solicitud de instalación registrada correctamente'
            );
        } else {
            addChatMessage(
                `❌ Error al enviar la solicitud: ${result.error || 'Error desconocido'}`,
                'bot',
                true
            );
        }
    } catch (error) {
        addChatMessage(
            `❌ Error de conexión: ${error.message}`,
            'bot',
            true
        );
    }
}

// Event listeners
sendBtn.addEventListener('click', handleChatInput);
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatInput();
    }
});

// Mensaje de bienvenida educativa
function showWelcomeMessage() {
    const welcomeMessage = `¡Hola! 👋 Soy tu asistente educativo virtual.\n\n`;
    const welcomeMessage2 = `Estoy aquí para ayudarte con:\n\n`;
    const welcomeMessage3 = `📚 Gestión de documentos: Distribución de archivos a las aulas\n`;
    const welcomeMessage4 = `🔧 Instalación de software: Solicita instalaciones en las computadoras del salón\n`;
    const welcomeMessage5 = `📊 Reportes: Consulta historiales y estadísticas\n`;
    const welcomeMessage6 = `🛠️ Soporte: Resuelve dudas y problemas técnicos\n`;
    const welcomeMessage7 = `💡 Sugerencias: Comparte ideas de mejora\n\n`;
    const welcomeMessage8 = `¿En qué puedo ayudarte hoy?`;
    
    const fullMessage = welcomeMessage + welcomeMessage2 + welcomeMessage3 + welcomeMessage4 + welcomeMessage5 + welcomeMessage6 + welcomeMessage7 + welcomeMessage8;
    
    addChatMessage(fullMessage, 'bot', true, [
        '¿Cómo distribuir un documento?',
        'Instalar software en un salón',
        'Ver tutorial del sistema',
        'Solicitar soporte técnico'
    ]);
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    getUserInfo();
    updateFileInfo();
    
    if (chatBox.children.length === 0) {
        setTimeout(() => {
            showWelcomeMessage();
        }, 500);
    }
    
    // Enfocar el input al cargar
    chatInput.focus();
});