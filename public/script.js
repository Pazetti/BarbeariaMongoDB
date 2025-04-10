// Módulo para o Carrossel de Imagens
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    let autoSlideInterval = null;
    const AUTO_SLIDE_DELAY = 3000; // 3 segundos entre cada slide

    // Função para exibir um slide específico
    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    }

    // Função para avançar para o próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Função para iniciar o movimento automático
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY);
    }

    // Função para pausar o movimento automático
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Pausar o carrossel ao passar o mouse por cima
    const carousel = document.querySelector('.carousel');
    carousel?.addEventListener('mouseenter', pauseAutoSlide);

    // Retomar o carrossel ao tirar o mouse
    carousel?.addEventListener('mouseleave', startAutoSlide);

    // Exibir o primeiro slide e iniciar o movimento automático
    showSlide(currentSlide);
    startAutoSlide();
}

// Módulo para o Novo Carrossel de Depoimentos
function initializeTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonials-slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    let autoSlideInterval = null;
    const AUTO_SLIDE_DELAY = 3000; // 3 segundos entre cada slide

    // Função para exibir um slide específico e atualizar os indicadores
    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        indicators.forEach((indicator, i) => indicator.classList.toggle('active', i === index));
    }

    // Função para avançar para o próximo slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Função para iniciar o movimento automático
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY);
    }

    // Função para pausar o movimento automático
    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Adicionar eventos de clique aos indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            pauseAutoSlide(); // Pausa o movimento automático ao clicar
            currentSlide = index;
            showSlide(currentSlide);
            startAutoSlide(); // Retoma o movimento automático
        });
    });

    // Pausar o carrossel ao passar o mouse por cima
    const carousel = document.querySelector('.testimonials-carousel');
    carousel?.addEventListener('mouseenter', pauseAutoSlide);

    // Retomar o carrossel ao tirar o mouse
    carousel?.addEventListener('mouseleave', startAutoSlide);

    // Exibir o primeiro slide e iniciar o movimento automático
    showSlide(currentSlide);
    startAutoSlide();
}

// Módulo para o Contador Animado
function initializeStatsCounter() {
    // Valores finais dos contadores
    const stats = {
        clients: 1200,    // Quantidade de clientes
        haircuts: 5000,   // Quantidade de cortes de cabelo
        beards: 3500,     // Quantidade de barbas
        combos: 2800      // Quantidade de combos (barba + cabelo)
    };

    // Elementos dos contadores
    const clientsCount = document.getElementById('clientsCount');
    const haircutsCount = document.getElementById('haircutsCount');
    const beardsCount = document.getElementById('beardsCount');
    const combosCount = document.getElementById('combosCount');

    // Função para animar um contador
    function animateCounter(element, targetValue, duration) {
        let startValue = 0;
        const increment = targetValue / (duration / 50); // Incremento por frame (50ms)
        let currentValue = startValue;

        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(interval);
            }
            element.textContent = Math.floor(currentValue).toLocaleString('pt-BR'); // Formata com separadores de milhar
        }, 50);
    }

    // Iniciar a animação para cada contador (duração de 2 segundos)
    if (clientsCount) animateCounter(clientsCount, stats.clients, 2000);
    if (haircutsCount) animateCounter(haircutsCount, stats.haircuts, 2000);
    if (beardsCount) animateCounter(beardsCount, stats.beards, 2000);
    if (combosCount) animateCounter(combosCount, stats.combos, 2000);
}

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
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                currentUser = { ...userData, isAdmin: false };
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
            } else {
                loginMessage.textContent = 'Email ou senha incorretos.';
                loginMessage.style.color = '#dc3545';
            }
        } catch (error) {
            loginMessage.textContent = 'Erro ao fazer login. Tente novamente.';
            loginMessage.style.color = '#dc3545';
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        // Enviar ao backend
        await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, subscription: false, appointments: 0 })
        });
        currentUser = { name, email, subscription: false, appointments: 0, isAdmin: false };
        localStorage.setItem('user', JSON.stringify(currentUser));
        window.location.href = 'dashboard.html';
    });
}

// Módulo do Dashboard de Cliente
function initializeDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) window.location.href = 'login.html';

    // Configurar informações do usuário
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Sistema de Agendamento
    const timeSelect = document.getElementById('timeSelect');
    const scheduleForm = document.getElementById('scheduleForm');
    const dateInput = document.getElementById('dateInput');
    const scheduleMessage = document.getElementById('scheduleMessage');

    function populateTimeSlots() {
        timeSelect.innerHTML = '';
        const start = 8 * 60; // 8:00
        const end = 18 * 60; // 18:00
        for (let i = start; i < end; i += 30) {
            const hour = Math.floor(i / 60);
            const minute = i % 60;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
        }
    }

    dateInput.addEventListener('change', populateTimeSlots);
    populateTimeSlots();

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const service = document.getElementById('serviceSelect').value;
        const date = dateInput.value;
        const time = timeSelect.value;
        const price = service === 'corte' ? 40 : service === 'barba' ? 25 : 55;

        const agendamento = {
            client_name: currentUser.name,
            barber_name: "Barbeiro Padrão", // Pode ser dinâmico
            service: service === 'combo' ? ['corte de cabelo masculino', 'barba completa'] : [service === 'corte' ? 'corte de cabelo masculino' : 'barba completa'],
            date: `${date} ${time}:00`,
            status: 'scheduled',
        };

        const response = await fetch('http://localhost:3000/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento)
        });

        if (response.ok) {
            currentUser.appointments += 1;
            localStorage.setItem('user', JSON.stringify(currentUser));
            scheduleMessage.textContent = 'Agendamento realizado com sucesso!';
            updateProgress();
        } else {
            scheduleMessage.textContent = 'Erro ao agendar.';
            scheduleMessage.style.color = '#dc3545';
        }
    });

    // Assinatura
    const subscribeBtn = document.getElementById('subscribeBtn');
    const subscriptionStatus = document.getElementById('subscriptionStatus');

    subscribeBtn.addEventListener('click', () => {
        currentUser.subscription = true;
        localStorage.setItem('user', JSON.stringify(currentUser));
        subscriptionStatus.textContent = 'Você é assinante! 1 corte por semana liberado.';
        updateProgress();
    });

    // Benefícios
    const progress = document.getElementById('progress');
    function updateProgress() {
        const text = currentUser.subscription ? 'Assinante' : `${currentUser.appointments}/5`;
        progress.textContent = text;
        if (!currentUser.subscription && currentUser.appointments >= 5) {
            currentUser.appointments = 0;
            localStorage.setItem('user', JSON.stringify(currentUser));
            alert('Parabéns! Você ganhou um agendamento grátis!');
        }
    }

    updateProgress();
}

// Módulo do Dashboard de Administrador
function initializeAdminDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser.isAdmin) window.location.href = 'login.html';

    // Configurar informações do administrador
    document.getElementById('adminName').textContent = currentUser.name;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Carregar estatísticas
    async function loadStats() {
        try {
            const appointmentsResponse = await fetch('http://localhost:3000/api/agendamentos');
            const appointments = await appointmentsResponse.json();
            // const clientsResponse = await fetch('http://localhost:3000/api/users');
            // const clients = await clientsResponse.json();

            document.getElementById('totalAppointments').textContent = appointments.pagination.total;
            //document.getElementById('totalClients').textContent = clients.length;

            // Carregar agendamentos na tabela
            const tableBody = document.getElementById('appointmentsTableBody');
            tableBody.innerHTML = '';
            console.log(appointments)
            appointments.data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(appointment.date).toLocaleString('pt-BR')}</td>
                    <td>${appointment.client_name}</td>
                    <td>${appointment.service.join(', ')}</td>
                    <td>${appointment.barber_name}</td>
                    <td>${appointment.status}</td>
                    <td>
                        ${appointment.status === 'scheduled' ? 
                            `<button class="btn btn-primary cancel-btn" data-id="${appointment._id}">Cancelar</button>` : 
                            '-'}
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adicionar eventos aos botões de cancelar
            document.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const appointmentId = button.getAttribute('data-id');
                    await fetch(`http://localhost:3000/api/agendamentos/${appointmentId}/cancelar`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    loadStats(); // Recarregar a tabela
                });
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    loadStats();
}

// Inicialização por página
if (document.querySelector('.carousel')) initializeCarousel();
if (document.querySelector('.testimonials-carousel')) initializeTestimonialsCarousel();
if (document.querySelector('.auth-container')) initializeAuth();
if (document.querySelector('.dashboard-container')) initializeDashboard();
if (document.querySelector('.stats-section')) initializeStatsCounter();
if (document.querySelector('.admin-dashboard-container')) initializeAdminDashboard();