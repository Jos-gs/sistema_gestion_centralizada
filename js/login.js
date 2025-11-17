// Archivo: js/login.js (FINAL - Envía el nombre en la redirección)

document.getElementById('login-form').addEventListener('submit', attemptLogin);

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
        const response = await fetch(`${API_SERVER_ENDPOINT}?action=login`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username, password }) 
        });
        const result = await response.json();

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
        errorMsg.innerText = `Error de conexión. Asegúrese que el servidor esté activo.`;
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