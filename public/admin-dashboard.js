// admin-dashboard.js
import { fetchWithErrorHandling } from './script.js';

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

    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const tableBody = document.getElementById('appointmentsTableBody');

    // Simulação de agendamentos (usando os mesmos dados simulados do dashboard de cliente)
    let simulatedAppointments = JSON.parse(localStorage.getItem('simulatedAppointments')) || [];

    // Função para carregar estatísticas e agendamentos
    async function loadStats() {
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = ''; // Limpar tabela enquanto carrega

        try {
            // Filtrar agendamentos com base no status selecionado
            const selectedStatus = statusFilter.value;
            const appointmentsUrl = selectedStatus === 'all' 
            ? 'http://localhost:3000/api/agendamentos'
            : `http://localhost:3000/api/agendamentos?status=${selectedStatus}`;

            const appointments = await fetchWithErrorHandling(appointmentsUrl);
            //const clients = await fetchWithErrorHandling('http://localhost:3000/api/users');
            // Atualizar estatísticas
            document.getElementById('totalAppointments').textContent = appointments.pagination.total;
            //document.getElementById('totalClients').textContent = clients.length;
            // Carregar agendamentos na tabela
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
                            `<button class="btn btn-confirm confirm-btn" data-id="${appointment._id}">Confirmar</button>
                             <button class="btn btn-secondary cancel-btn" data-id="${appointment._id}">Cancelar</button>` : 
                            '-'}
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adicionar eventos aos botões de confirmar
            document.querySelectorAll('.confirm-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const appointmentId = button.getAttribute('data-id');
                    const row = button.closest('tr');
                    
                    try {
                        row.style.opacity = '0.9'; // Feedback visual
                        await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}/confirmar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        // Atualização direta do DOM (sem recarregar tudo)
                        row.cells[4].textContent = 'confirmed'; // Status
                        row.cells[5].innerHTML = '-'; // Ações
                    } catch (error) {
                        console.error("Falha ao confirmar:", error);
                        // Rollback visual se necessário
                        row.style.opacity = '1';
                    }
                });
            });

            // Adicionar eventos aos botões de cancelar
            document.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const appointmentId = button.getAttribute('data-id');
                    const row = button.closest('tr');
                    
                    try {
                        row.style.opacity = '0.9'; // Feedback visual
                        await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}/cancelar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        // Atualização direta do DOM (sem recarregar tudo)
                        row.cells[4].textContent = 'canceled'; // Status
                        row.cells[5].innerHTML = '-'; // Ações
                    } catch (error) {
                        console.error("Falha ao confirmar:", error);
                        // Rollback visual se necessário
                        row.style.opacity = '1';
                    }
                });
            });
        } catch (error) {
            console.log("Não foi possível exibir dados da API " + error)
            // Se o backend não estiver disponível, usar a simulação
            loadStatsSimulated();
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    // Função para carregar estatísticas e agendamentos simulados
    function loadStatsSimulated() {
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = ''; // Limpar tabela enquanto carrega
        // Simulação de clientes (apenas para exibir algo nas estatísticas)
        const simulatedClients = JSON.parse(localStorage.getItem('simulatedClients')) || [{ name: currentUser.name }];

        // Atualizar estatísticas
        document.getElementById('totalAppointments').textContent = simulatedAppointments.length;
        document.getElementById('totalClients').textContent = simulatedClients.length;

        // Filtrar agendamentos com base no status selecionado
        const selectedStatus = statusFilter.value;
        const filteredAppointments = selectedStatus === 'all' 
            ? simulatedAppointments 
            : simulatedAppointments.filter(appointment => appointment.status === selectedStatus);

        // Carregar agendamentos na tabela
        filteredAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(appointment.date).toLocaleString('pt-BR')}</td>
                <td>${appointment.client_name}</td>
                <td>${appointment.service.join(', ')}</td>
                <td>${appointment.barber_name}</td>
                <td>${appointment.status}</td>
                <td>
                    ${appointment.status === 'scheduled' ? 
                        `<button class="btn btn-confirm confirm-btn" data-id="${appointment._id}">Confirmar</button>
                         <button class="btn btn-secondary cancel-btn" data-id="${appointment._id}">Cancelar</button>` : 
                        '-'}
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Adicionar eventos aos botões de confirmar
        document.querySelectorAll('.confirm-btn').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = button.getAttribute('data-id');
                simulatedAppointments = simulatedAppointments.map(appointment => {
                    if (appointment._id === appointmentId) {
                        return { ...appointment, status: 'confirmed', updated_at: new Date().toISOString() };
                    }
                    return appointment;
                });
                localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));
                loadStatsSimulated();
            });
        });

        // Adicionar eventos aos botões de cancelar
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = button.getAttribute('data-id');
                simulatedAppointments = simulatedAppointments.map(appointment => {
                    if (appointment._id === appointmentId) {
                        return { ...appointment, status: 'canceled', updated_at: new Date().toISOString() };
                    }
                    return appointment;
                });
                localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));
                loadStatsSimulated();
            });
        });

        loadingMessage.style.display = 'none';
    }

    // Carregar dados inicialmente
    loadStats();

    // Adicionar evento ao filtro de status
    statusFilter.addEventListener('change', loadStats);

    // Adicionar evento ao botão de recarregar
    refreshBtn.addEventListener('click', loadStats);
}

// Inicializar o módulo
if (document.querySelector('.admin-dashboard-container')) initializeAdminDashboard();