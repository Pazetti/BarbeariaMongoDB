// dashboard.js

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
    const barberSelect = document.getElementById('barberSelect');
    const scheduleForm = document.getElementById('scheduleForm');
    const dateInput = document.getElementById('dateInput');
    const scheduleMessage = document.getElementById('scheduleMessage');

    // Elementos do card de visão geral do último agendamento
    const appointmentOverview = document.getElementById('appointmentOverview');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    const appointmentBarber = document.getElementById('appointmentBarber');
    const appointmentService = document.getElementById('appointmentService');
    const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');

    // Elementos da lista de agendamentos do cliente
    const clientAppointmentsTableBody = document.getElementById('clientAppointmentsTableBody');

    // Carregar último agendamento do localStorage, se existir
    let lastAppointment = JSON.parse(localStorage.getItem('lastAppointment')) || null;
    let lastAppointmentId = localStorage.getItem('lastAppointmentId') || null;

    // Simulação de agendamentos (armazenados no localStorage para persistência temporária)
    let simulatedAppointments = JSON.parse(localStorage.getItem('simulatedAppointments')) || [];

    // Função para exibir o último agendamento no card
    function displayLastAppointment() {
        if (lastAppointment) {
            appointmentOverview.style.display = 'block';
            const [date, time] = lastAppointment.date.split(' ');
            appointmentDate.textContent = new Date(date).toLocaleDateString('pt-BR');
            appointmentTime.textContent = time;
            appointmentBarber.textContent = lastAppointment.barber_name;
            appointmentService.textContent = lastAppointment.service.join(', ');
        } else {
            appointmentOverview.style.display = 'none';
        }
    }

    // Função para carregar e exibir todos os agendamentos do cliente
    async function loadClientAppointments() {
        try {
            const appointments = await fetchWithErrorHandling('http://localhost:3000/api/agendamentos');
            // Filtrar agendamentos do cliente logado
            const clientAppointments = appointments.filter(appointment => appointment.client_name === currentUser.name);

            // Atualizar a tabela de agendamentos
            clientAppointmentsTableBody.innerHTML = '';
            clientAppointments.forEach(appointment => {
                const [date, time] = appointment.date.split(' ');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(date).toLocaleDateString('pt-BR')}</td>
                    <td>${time}</td>
                    <td>${appointment.barber_name}</td>
                    <td>${appointment.service.join(', ')}</td>
                    <td>${appointment.status}</td>
                    <td>
                        ${appointment.status === 'scheduled' ? 
                            `<button class="btn btn-secondary cancel-client-btn" data-id="${appointment._id}">Cancelar</button>` : 
                            '-'}
                    </td>
                `;
                clientAppointmentsTableBody.appendChild(row);
            });

            // Adicionar eventos aos botões de cancelar
            document.querySelectorAll('.cancel-client-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const appointmentId = button.getAttribute('data-id');
                    try {
                        await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'canceled', updated_at: new Date().toISOString() })
                        });

                        // Se o agendamento cancelado for o último, atualizar o card de visão geral
                        if (appointmentId === lastAppointmentId) {
                            lastAppointment = null;
                            lastAppointmentId = null;
                            localStorage.removeItem('lastAppointment');
                            localStorage.removeItem('lastAppointmentId');
                            displayLastAppointment();
                        }

                        scheduleMessage.textContent = 'Agendamento cancelado com sucesso!';
                        scheduleMessage.style.color = '#28a745';
                        loadClientAppointments(); // Recarregar a tabela
                        populateTimeSlots(); // Atualizar os horários disponíveis
                    } catch (error) {
                        // Simulação de cancelamento (se o backend não estiver disponível)
                        simulatedAppointments = simulatedAppointments.map(appointment => {
                            if (appointment._id === appointmentId) {
                                return { ...appointment, status: 'canceled', updated_at: new Date().toISOString() };
                            }
                            return appointment;
                        });
                        localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));

                        if (appointmentId === lastAppointmentId) {
                            lastAppointment = null;
                            lastAppointmentId = null;
                            localStorage.removeItem('lastAppointment');
                            localStorage.removeItem('lastAppointmentId');
                            displayLastAppointment();
                        }

                        scheduleMessage.textContent = 'Agendamento cancelado com sucesso (simulação).';
                        scheduleMessage.style.color = '#28a745';
                        loadClientAppointmentsSimulated(); // Recarregar a tabela com simulação
                        populateTimeSlots(); // Atualizar os horários disponíveis
                    }
                });
            });
        } catch (error) {
            // Se o backend não estiver disponível, usar a simulação
            loadClientAppointmentsSimulated();
        }
    }

    // Função para carregar e exibir agendamentos simulados
    function loadClientAppointmentsSimulated() {
        const clientAppointments = simulatedAppointments.filter(appointment => appointment.client_name === currentUser.name);

        clientAppointmentsTableBody.innerHTML = '';
        clientAppointments.forEach(appointment => {
            const [date, time] = appointment.date.split(' ');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(date).toLocaleDateString('pt-BR')}</td>
                <td>${time}</td>
                <td>${appointment.barber_name}</td>
                <td>${appointment.service.join(', ')}</td>
                <td>${appointment.status}</td>
                <td>
                    ${appointment.status === 'scheduled' ? 
                        `<button class="btn btn-secondary cancel-client-btn" data-id="${appointment._id}">Cancelar</button>` : 
                        '-'}
                </td>
            `;
            clientAppointmentsTableBody.appendChild(row);
        });

        // Adicionar eventos aos botões de cancelar
        document.querySelectorAll('.cancel-client-btn').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = button.getAttribute('data-id');
                simulatedAppointments = simulatedAppointments.map(appointment => {
                    if (appointment._id === appointmentId) {
                        return { ...appointment, status: 'canceled', updated_at: new Date().toISOString() };
                    }
                    return appointment;
                });
                localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));

                if (appointmentId === lastAppointmentId) {
                    lastAppointment = null;
                    lastAppointmentId = null;
                    localStorage.removeItem('lastAppointment');
                    localStorage.removeItem('lastAppointmentId');
                    displayLastAppointment();
                }

                scheduleMessage.textContent = 'Agendamento cancelado com sucesso (simulação).';
                scheduleMessage.style.color = '#28a745';
                loadClientAppointmentsSimulated();
                populateTimeSlots(); // Atualizar os horários disponíveis
            });
        });
    }

    // Carregar os agendamentos do cliente ao iniciar
    loadClientAppointments();

    // Exibir o último agendamento ao carregar a página
    displayLastAppointment();

    // Função para preencher os horários disponíveis
    async function populateTimeSlots() {
        timeSelect.innerHTML = '';
        const selectedDate = dateInput.value;
        const selectedBarber = barberSelect.value;

        // Verificar se a data e o barbeiro foram selecionados
        if (!selectedDate || !selectedBarber) {
            timeSelect.innerHTML = '<option value="">Selecione uma data e um barbeiro</option>';
            scheduleMessage.textContent = 'Por favor, selecione uma data e um barbeiro para ver os horários disponíveis.';
            scheduleMessage.style.color = '#dc3545';
            return;
        }

        // Limpar mensagem de erro, se houver
        scheduleMessage.textContent = '';

        // Obter agendamentos existentes para a data e barbeiro selecionados
        let existingAppointments = [];
        try {
            const appointments = await fetchWithErrorHandling('http://localhost:3000/api/agendamentos');
            existingAppointments = appointments.filter(appointment => {
                const [appointmentDate, appointmentTime] = appointment.date.split(' ');
                return appointmentDate === selectedDate &&
                       appointment.barber_name === selectedBarber &&
                       (appointment.status === 'scheduled' || appointment.status === 'confirmed');
            });
        } catch (error) {
            // Se o backend não estiver disponível, usar a simulação
            existingAppointments = simulatedAppointments.filter(appointment => {
                const [appointmentDate, appointmentTime] = appointment.date.split(' ');
                return appointmentDate === selectedDate &&
                       appointment.barber_name === selectedBarber &&
                       (appointment.status === 'scheduled' || appointment.status === 'confirmed');
            });
        }

        // Extrair os horários ocupados
        const occupiedTimes = existingAppointments.map(appointment => {
            const [, time] = appointment.date.split(' ');
            return time.slice(0, 5); // Pegar apenas "HH:MM"
        });

        // Preencher os horários disponíveis
        const start = 8 * 60; // 8:00
        const end = 18 * 60;  // 18:00
        let hasAvailableSlots = false;

        for (let i = start; i < end; i += 30) {
            const hour = Math.floor(i / 60);
            const minute = i % 60;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isOccupied = occupiedTimes.includes(time);

            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            if (isOccupied) {
                option.disabled = true;
                option.textContent += ' (Ocupado)';
            } else {
                hasAvailableSlots = true;
            }
            timeSelect.appendChild(option);
        }

        // Se não houver horários disponíveis, exibir uma mensagem
        if (!hasAvailableSlots) {
            timeSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
            scheduleMessage.textContent = `Nenhum horário disponível para ${selectedBarber} nesta data. Tente outro barbeiro ou outra data.`;
            scheduleMessage.style.color = '#dc3545';
        }
    }

    // Atualizar os horários disponíveis quando a data ou o barbeiro mudar
    dateInput.addEventListener('change', populateTimeSlots);
    barberSelect.addEventListener('change', populateTimeSlots);
    populateTimeSlots();

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const service = document.getElementById('serviceSelect').value;
        const barber = barberSelect.value;
        const date = dateInput.value;
        const time = timeSelect.value;
        const price = service === 'corte' ? 40 : service === 'barba' ? 25 : 55;

        if (!time) {
            scheduleMessage.textContent = 'Por favor, selecione um horário disponível.';
            scheduleMessage.style.color = '#dc3545';
            return;
        }

        const agendamento = {
            client_name: currentUser.name,
            barber_name: barber,
            service: service === 'combo' ? ['corte de cabelo masculino', 'barba completa'] : [service === 'corte' ? 'corte de cabelo masculino' : 'barba completa'],
            date: `${date} ${time}:00`,
            status: 'scheduled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            price
        };

        try {
            // Verificar se já existe um agendamento no mesmo horário com o mesmo barbeiro (independentemente do serviço)
            const appointments = await fetchWithErrorHandling('http://localhost:3000/api/agendamentos');
            const hasConflict = appointments.some(appointment => 
                appointment.barber_name === barber &&
                appointment.date === agendamento.date &&
                (appointment.status === 'scheduled' || appointment.status === 'confirmed')
            );

            if (hasConflict) {
                scheduleMessage.textContent = `O barbeiro ${barber} já está ocupado neste horário. Por favor, escolha outro horário ou barbeiro.`;
                scheduleMessage.style.color = '#dc3545';
                populateTimeSlots(); // Atualizar os horários disponíveis para garantir consistência
                return;
            }

            // Se não houver conflito, prosseguir com o agendamento
            const response = await fetchWithErrorHandling('http://localhost:3000/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamento)
            });

            currentUser.appointments += 1;
            localStorage.setItem('user', JSON.stringify(currentUser));

            // Armazenar o último agendamento e seu ID no localStorage
            lastAppointment = agendamento;
            lastAppointmentId = response._id;
            localStorage.setItem('lastAppointment', JSON.stringify(lastAppointment));
            localStorage.setItem('lastAppointmentId', lastAppointmentId);

            scheduleMessage.textContent = 'Agendamento realizado com sucesso!';
            scheduleMessage.style.color = '#28a745';
            updateProgress();
            displayLastAppointment();
            loadClientAppointments(); // Atualizar a tabela de agendamentos
            populateTimeSlots(); // Atualizar os horários disponíveis
        } catch (error) {
            // Simulação temporária para agendamento (se o backend não estiver disponível)
            const hasConflict = simulatedAppointments.some(appointment => 
                appointment.barber_name === barber &&
                appointment.date === agendamento.date &&
                (appointment.status === 'scheduled' || appointment.status === 'confirmed')
            );

            if (hasConflict) {
                scheduleMessage.textContent = `O barbeiro ${barber} já está ocupado neste horário. Por favor, escolha outro horário ou barbeiro.`;
                scheduleMessage.style.color = '#dc3545';
                populateTimeSlots(); // Atualizar os horários disponíveis para garantir consistência
                return;
            }

            const simulatedId = `simulated_${Date.now()}`; // Gerar um ID único para o agendamento simulado
            const simulatedAppointment = { ...agendamento, _id: simulatedId };
            simulatedAppointments.push(simulatedAppointment);
            localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));

            currentUser.appointments += 1;
            localStorage.setItem('user', JSON.stringify(currentUser));

            lastAppointment = agendamento;
            lastAppointmentId = simulatedId;
            localStorage.setItem('lastAppointment', JSON.stringify(lastAppointment));
            localStorage.setItem('lastAppointmentId', lastAppointmentId);

            scheduleMessage.textContent = 'Agendamento realizado com sucesso (simulação).';
            scheduleMessage.style.color = '#28a745';
            updateProgress();
            displayLastAppointment();
            loadClientAppointmentsSimulated(); // Atualizar a tabela com simulação
            populateTimeSlots(); // Atualizar os horários disponíveis
        }
    });

    // Função para cancelar o último agendamento (via card de visão geral)
    cancelAppointmentBtn.addEventListener('click', async () => {
        if (!lastAppointmentId) {
            scheduleMessage.textContent = 'Nenhum agendamento para cancelar.';
            scheduleMessage.style.color = '#dc3545';
            return;
        }

        try {
            await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${lastAppointmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'canceled', updated_at: new Date().toISOString() })
            });

            // Limpar o último agendamento do localStorage
            lastAppointment = null;
            lastAppointmentId = null;
            localStorage.removeItem('lastAppointment');
            localStorage.removeItem('lastAppointmentId');

            scheduleMessage.textContent = 'Agendamento cancelado com sucesso!';
            scheduleMessage.style.color = '#28a745';
            displayLastAppointment();
            loadClientAppointments(); // Atualizar a tabela de agendamentos
            populateTimeSlots(); // Atualizar os horários disponíveis
        } catch (error) {
            // Simulação de cancelamento
            simulatedAppointments = simulatedAppointments.map(appointment => {
                if (appointment._id === lastAppointmentId) {
                    return { ...appointment, status: 'canceled', updated_at: new Date().toISOString() };
                }
                return appointment;
            });
            localStorage.setItem('simulatedAppointments', JSON.stringify(simulatedAppointments));

            lastAppointment = null;
            lastAppointmentId = null;
            localStorage.removeItem('lastAppointment');
            localStorage.removeItem('lastAppointmentId');

            scheduleMessage.textContent = 'Agendamento cancelado com sucesso (simulação).';
            scheduleMessage.style.color = '#28a745';
            displayLastAppointment();
            loadClientAppointmentsSimulated();
            populateTimeSlots(); // Atualizar os horários disponíveis
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

// Inicializar o módulo
if (document.querySelector('.dashboard-container')) initializeDashboard();