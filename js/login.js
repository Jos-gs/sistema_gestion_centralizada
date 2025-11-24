// Archivo: js/login.js (FINAL - Envía el nombre en la redirección)

// Asegurar que el DOM esté listo antes de registrar el evento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', attemptLogin);
        }
    });
} else {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', attemptLogin);
    }
}

function showLoadingAnimation() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.style.transition = 'border-color 0.5s ease';
        input.style.borderColor = '#95a5a6';
    });
}

function stopLoadingAnimation() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.style.borderColor = '#34495e';
    });
}

async function attemptLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('login-error');

    loginBtn.disabled = true;
    loginBtn.innerText = "Verificando...";
    errorMsg.classList.add('hidden');
    showLoadingAnimation();

    try {
        const loginData = { username: username.trim(), password: password };
        console.log('Enviando datos de login:', { username: loginData.username, password: '***' });
        
        const response = await fetch(`${API_SERVER_ENDPOINT}?action=login`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(loginData) 
        });
        
        console.log('Respuesta del servidor - Status:', response.status);
        
        let result;
        try {
            const responseText = await response.text();
            console.log('Respuesta del servidor - Texto:', responseText);
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Error al parsear JSON:', jsonError);
            errorMsg.innerText = `Error del servidor. No se pudo procesar la respuesta.`;
            errorMsg.classList.remove('hidden');
            loginBtn.style.backgroundColor = '#e74c3c';
            return;
        }

        if (response.ok) {
            loginBtn.innerText = "¡Éxito!";
            loginBtn.style.backgroundColor = '#27ae60';
            
            // Envía el nombre completo y el usuario a la página siguiente
            setTimeout(() => {
                const role = result.role.toLowerCase();
                const user = result.username;
                const name = encodeURIComponent(result.full_name); 

                window.location.href = `index.php?view=${role}&user=${user}&name=${name}`;
            }, 500); 

        } else {
            errorMsg.innerText = result.error || "Error de credenciales.";
            errorMsg.classList.remove('hidden');
            loginBtn.style.backgroundColor = '#e74c3c';
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorMsg.innerText = `Error de conexión. Asegúrese que el servidor esté activo. Error: ${error.message}`;
        errorMsg.classList.remove('hidden');
        loginBtn.style.backgroundColor = '#e74c3c';
    } finally {
        stopLoadingAnimation();
        if (loginBtn.innerText !== "¡Éxito!") {
            loginBtn.disabled = false;
            loginBtn.innerText = "Iniciar Sesión";
            if (loginBtn.style.backgroundColor !== 'rgb(231, 76, 60)') {
                 loginBtn.style.backgroundColor = '#3498db';
            }
        }
    }
}