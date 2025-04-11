// script.js

// Função auxiliar para fazer requisições fetch com tratamento de erros
export async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${url}:`, error);
        throw error;
    }
}

// Inicialização por página
if (document.querySelector('.carousel') || document.querySelector('.testimonials-carousel') || document.querySelector('.stats-section')) {
    // Carregar o script do carrossel e contador (index.html)
    const script = document.createElement('script');
    script.src = 'carousel.js';
    script.type = 'module'
    document.body.appendChild(script);
}

if (document.querySelector('.auth-container')) {
    // Carregar o script de autenticação (login.html)
    const script = document.createElement('script');
    script.src = 'auth.js';
    script.type = 'module'
    document.body.appendChild(script);
}

if (document.querySelector('.dashboard-container')) {
    // Carregar o script do dashboard de cliente (dashboard.html)
    const script = document.createElement('script');
    script.src = 'dashboard.js';
    script.type = 'module'
    document.body.appendChild(script);
}

if (document.querySelector('.admin-dashboard-container')) {
    // Carregar o script do dashboard de administrador (admin-dashboard.html)
    const script = document.createElement('script');
    script.src = 'admin-dashboard.js';
    script.type = 'module'
    document.body.appendChild(script);
}