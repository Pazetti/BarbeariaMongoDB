// auth.js

// Módulo de Autenticação
function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const loginMessage = document.getElementById('loginMessage');

    // Logins pré-determinados para administradores
    const adminUsers = [
        { email: "admin1@barbearia.com", password: "admin123", name: "Admin 1", isAdmin: true },
        { email: "admin2@barbearia.com", password: "admin456", name: "Admin 2", isAdmin: true },
        { email: "admin3@barbearia.com", password: "admin789", name: "Admin 3", isAdmin: true },
        { email: "admin4@barbearia.com", password: "admin101", name: "Admin 4", isAdmin: true },
        { email: "admin5@barbearia.com", password: "admin202", name: "Admin 5", isAdmin: true }
    ];

    // Alternar entre login e cadastro
    showRegister?.addEventListener('click', () => {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });

    showLogin?.addEventListener('click', () => {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    });

    // Simulação de usuário logado (substituir por backend real)
    let currentUser = JSON.parse(localStorage.getItem('user')) || null;

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Verificar se é um administrador
        const adminUser = adminUsers.find(user => user.email === email && user.password === password);
        if (adminUser) {
            currentUser = adminUser;
            localStorage.setItem('user', JSON.stringify(currentUser));
            window.location.href = 'admin-dashboard.html';
            return;
        }

        // Caso não seja administrador, prosseguir com login de cliente
        try {
            const response = await fetchWithErrorHandling('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                currentUser = { ...userData, isAdmin: false };
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
                loginMessage.textContent = 'Login realizado com sucesso!';
                loginMessage.style.color = '#28a745'; // Verde para sucesso
            } else {
                const errorData = await response.json();
                loginMessage.textContent = errorData.message || 'Email ou senha incorretos.';
                loginMessage.style.color = '#dc3545';
            }
        } catch (error) {
            // Simulação temporária para login de cliente (remover quando o backend estiver funcionando)
            if (email && password) {
                currentUser = { name: "Usuário", email, subscription: false, appointments: 0, isAdmin: false };
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
                loginMessage.textContent = 'Login simulado com sucesso (backend não disponível).';
                loginMessage.style.color = '#28a745'; // Verde para sucesso
                return;
            }

            loginMessage.textContent = `Erro ao fazer login: ${error.message}. Tente novamente.`;
            loginMessage.style.color = '#dc3545';
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetchWithErrorHandling('http://localhost:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, subscription: false, appointments: 0 })
            });

            if (response.ok) {
                currentUser = { name, email, subscription: false, appointments: 0, isAdmin: false };
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
                loginMessage.textContent = 'Cadastro realizado com sucesso!';
                loginMessage.style.color = '#28a745'; // Verde para sucesso
            } else {
                const errorData = await response.json();
                loginMessage.textContent = errorData.message || 'Erro ao cadastrar. Tente novamente.';
                loginMessage.style.color = '#dc3545';
            }
        } catch (error) {
            loginMessage.textContent = `Erro ao cadastrar: ${error.message}. Tente novamente.`;
            loginMessage.style.color = '#dc3545';
        }
    });
}

// Inicializar o módulo
if (document.querySelector('.auth-container')) initializeAuth();