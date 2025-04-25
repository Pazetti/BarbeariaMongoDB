import { fetchWithErrorHandling } from "./script.js"

// dashboard.js

// Módulo do Dashboard de Cliente
function initializeDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user"))
  if (!currentUser) window.location.href = "login.html"

  // Configurar informações do usuário
  document.getElementById("userName").textContent = currentUser.name
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user")
    window.location.href = "index.html"
  })

  // Sistema de Agendamento
  const timeSelect = document.getElementById("timeSelect")
  const barberSelect = document.getElementById("barberSelect")
  const scheduleForm = document.getElementById("scheduleForm")
  const dateInput = document.getElementById("dateInput")
  const scheduleMessage = document.getElementById("scheduleMessage")
  const serviceCheckboxes = document.querySelectorAll(".service-checkbox")
  const totalPriceDisplay = document.getElementById("totalPriceDisplay")

  // Elementos do card de visão geral do último agendamento
  const appointmentOverview = document.getElementById("appointmentOverview")
  const appointmentDate = document.getElementById("appointmentDate")
  const appointmentTime = document.getElementById("appointmentTime")
  const appointmentBarber = document.getElementById("appointmentBarber")
  const appointmentService = document.getElementById("appointmentService")
  const appointmentPrice = document.getElementById("appointmentPrice")
  const appointmentStatus = document.getElementById("appointmentStatus")
  const cancelAppointmentBtn = document.getElementById("cancelAppointmentBtn")

  // Elementos da lista de agendamentos do cliente
  const clientAppointmentsTableBody = document.getElementById("clientAppointmentsTableBody")

  // Elementos do modal de confirmação
  const confirmationModal = document.getElementById("confirmationModal")
  const confirmationMessage = document.getElementById("confirmationMessage")
  const confirmActionBtn = document.getElementById("confirmActionBtn")
  const cancelActionBtn = document.getElementById("cancelActionBtn")

  // Simulação de agendamentos (armazenados no localStorage para persistência temporária)
  let simulatedAppointments = JSON.parse(localStorage.getItem("simulatedAppointments")) || []

  let lastAppointment
  let lastAppointmentId

  const statusLabels = {
    canceled: "Cancelado",
    confirmed: "Confirmado",
    scheduled: "Agendado",
  }

  // Função para calcular o preço total com base nos serviços selecionados
  function calculateTotalPrice(checkboxes) {
    let total = 0
    let selectedCount = 0

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedCount++
        total += Number.parseFloat(checkbox.dataset.price)
      }
    })

    // Limitar a 3 serviços
    if (selectedCount > 3) {
      alert("Você pode selecionar no máximo 3 serviços.")
      return false
    }

    return total
  }

  // Função para atualizar o preço total exibido
  function updateTotalPrice() {
    const total = calculateTotalPrice(serviceCheckboxes)
    if (total !== false) {
      totalPriceDisplay.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      return true
    }
    return false
  }

  // Adicionar evento para atualizar o preço quando os checkboxes são alterados
  serviceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Verificar se já tem 3 serviços selecionados
      const selectedServices = document.querySelectorAll(".service-checkbox:checked")
      if (selectedServices.length > 3 && checkbox.checked) {
        checkbox.checked = false
        alert("Você pode selecionar no máximo 3 serviços.")
        return
      }
      updateTotalPrice()
    })
  })

  // Função para exibir o último agendamento no card
  async function displayLastAppointment() {
    const response = await fetchWithErrorHandling(
      `http://localhost:3000/api/agendamentos?client_name=${encodeURIComponent(currentUser.name)}&status=scheduled&status=confirmed&sort=date&order=desc`,
    )
    lastAppointment = response.data[0]
    if (lastAppointment) {
      if (lastAppointment.status == "scheduled") {
        cancelAppointmentBtn.style.display = "block"
        editAppointmentOverviewBtn.style.display = "block"
      } else {
        cancelAppointmentBtn.style.display = "none"
        editAppointmentOverviewBtn.style.display = "none"
      }
      appointmentOverview.style.display = "block"
      const [date, time] = lastAppointment.date.split(" ")
      appointmentDate.textContent = date.split("-").reverse().join("/")
      appointmentTime.textContent = time
      appointmentBarber.textContent = lastAppointment.barber_name
      appointmentService.textContent = lastAppointment.services.map((service) => service.name).join(", ")
      appointmentPrice.textContent = lastAppointment.total_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      appointmentStatus.textContent = statusLabels[lastAppointment.status]
      appointmentStatus.classList.add("status-" + lastAppointment.status)
    } else {
      appointmentOverview.style.display = "none"
    }
  }

  // Função para carregar e exibir todos os agendamentos do cliente
  async function loadClientAppointments() {
    try {
      const appointments = await fetchWithErrorHandling(
        `http://localhost:3000/api/agendamentos?client_name=${encodeURIComponent(currentUser.name)}&status=scheduled&status=confirmed`,
      )
      // Atualizar a tabela de agendamentos
      clientAppointmentsTableBody.innerHTML = ""
      appointments.data.forEach((appointment) => {
        const [date, time] = appointment.date.split(" ")
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${date.split("-").reverse().join("/")}</td>
                    <td>${time}</td>
                    <td>${appointment.barber_name}</td>
                    <td>${appointment.services.map((service) => service.name).join(", ")}</td>
                    <td>${appointment.total_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td class='status-${appointment.status}'>${statusLabels[appointment.status] || appointment.status}</td>
                    <td class='appointments-table-actions'>
                        ${
                          appointment.status === "scheduled"
                            ? `<button class="btn btn-secondary cancel-client-btn" data-id="${appointment._id}">Cancelar</button> 
                                <button class="btn btn-edit edit-client-btn" data-id="${appointment._id}">Editar</button>`
                            : "-"
                        }
                    </td>
                `
        clientAppointmentsTableBody.appendChild(row)
      })

      // Adicionar eventos aos botões de cancelar
      document.querySelectorAll(".cancel-client-btn").forEach((button) => {
        button.addEventListener("click", () => {
          showConfirmationModal(button.getAttribute("data-id"))
        })
      })
    } catch (error) {
      console.log("Erro: " + error)
      // Se o backend não estiver disponível, usar a simulação
      loadClientAppointmentsSimulated()
    }
  }

  // Função para mostrar o modal de confirmação
  function showConfirmationModal(appointmentId) {
    confirmationMessage.textContent = "Tem certeza que deseja cancelar este agendamento?"
    confirmationModal.style.display = "flex"

    // Remover eventos anteriores para evitar duplicação
    confirmActionBtn.replaceWith(confirmActionBtn.cloneNode(true))
    cancelActionBtn.replaceWith(cancelActionBtn.cloneNode(true))

    // Referenciar novamente após clonagem
    const newConfirmBtn = document.getElementById("confirmActionBtn")
    const newCancelBtn = document.getElementById("cancelActionBtn")

    // Adicionar novos eventos
    newConfirmBtn.addEventListener("click", async () => {
      confirmationModal.style.display = "none"
      await cancelAppointment(appointmentId)
    })

    newCancelBtn.addEventListener("click", () => {
      confirmationModal.style.display = "none"
    })
  }

  // Função para cancelar um agendamento
  async function cancelAppointment(appointmentId) {
    try {
      await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}/cancelar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })

      // Se o agendamento cancelado for o último, atualizar o card de visão geral
      if (lastAppointment && appointmentId === lastAppointment._id) {
        appointmentStatus.classList.remove(`status-${lastAppointment.status}`)
        lastAppointment = null
        displayLastAppointment()
      }

      scheduleMessage.textContent = "Agendamento cancelado com sucesso!"
      scheduleMessage.style.color = "#28a745"
      loadClientAppointments() // Recarregar a tabela
      populateTimeSlots() // Atualizar os horários disponíveis
    } catch (error) {
      // Simulação de cancelamento (se o backend não estiver disponível)
      simulatedAppointments = simulatedAppointments.map((appointment) => {
        if (appointment._id === appointmentId) {
          return { ...appointment, status: "canceled", updated_at: new Date().toISOString() }
        }
        return appointment
      })
      localStorage.setItem("simulatedAppointments", JSON.stringify(simulatedAppointments))

      if (lastAppointment && appointmentId === lastAppointment._id) {
        lastAppointment = null
        displayLastAppointment()
      }

      scheduleMessage.textContent = "Agendamento cancelado com sucesso (simulação)."
      scheduleMessage.style.color = "#28a745"
      loadClientAppointmentsSimulated() // Recarregar a tabela com simulação
      populateTimeSlots() // Atualizar os horários disponíveis
    }
  }

  // Função para carregar e exibir agendamentos simulados
  function loadClientAppointmentsSimulated() {
    const clientAppointments = simulatedAppointments.filter(
      (appointment) => appointment.client_name === currentUser.name,
    )

    clientAppointmentsTableBody.innerHTML = ""
    clientAppointments.forEach((appointment) => {
      const [date, time] = appointment.date.split(" ")
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${new Date(date).toLocaleDateString("pt-BR")}</td>
                <td>${time}</td>
                <td>${appointment.barber_name}</td>
                <td>${appointment.service.join(", ")}</td>
                <td>${appointment.status}</td>
                <td>
                    ${
                      appointment.status === "scheduled"
                        ? `<button class="btn btn-secondary cancel-client-btn" data-id="${appointment._id}">Cancelar</button>`
                        : "-"
                    }
                </td>
            `
      clientAppointmentsTableBody.appendChild(row)
    })

    // Adicionar eventos aos botões de cancelar
    document.querySelectorAll(".cancel-client-btn").forEach((button) => {
      button.addEventListener("click", () => {
        showConfirmationModal(button.getAttribute("data-id"))
      })
    })
  }

  // Carregar os agendamentos do cliente ao iniciar
  loadClientAppointments()

  // Exibir o último agendamento ao carregar a página
  displayLastAppointment()

  // Função para preencher os horários disponíveis
  async function populateTimeSlots() {
    timeSelect.innerHTML = ""
    const selectedDate = dateInput.value
    const selectedBarber = barberSelect.value

    // Verificar se a data e o barbeiro foram selecionados
    if (!selectedDate || !selectedBarber) {
      timeSelect.innerHTML = '<option value="">Selecione uma data e um barbeiro</option>'
      scheduleMessage.textContent = "Por favor, selecione uma data e um barbeiro para ver os horários disponíveis."
      scheduleMessage.style.color = "#dc3545"
      return
    }

    // Limpar mensagem de erro, se houver
    scheduleMessage.textContent = ""

    // Obter agendamentos existentes para a data e barbeiro selecionados
    let existingAppointments = []
    try {
      const url = `http://localhost:3000/api/agendamentos?barber_name=${encodeURIComponent(selectedBarber)}&start_date=${selectedDate}&end_date=${selectedDate}&status=scheduled&status=confirmed`

      existingAppointments = await fetchWithErrorHandling(url)
    } catch (error) {
      console.log(error)
      // Se o backend não estiver disponível, usar a simulação
      existingAppointments = simulatedAppointments.filter((appointment) => {
        const [appointmentDate, appointmentTime] = appointment.date.split(" ")
        return (
          appointmentDate === selectedDate &&
          appointment.barber_name === selectedBarber &&
          (appointment.status === "scheduled" || appointment.status === "confirmed")
        )
      })
    }

    // Extrair os horários ocupados
    const occupiedTimes = existingAppointments.data.map((appointment) => {
      const [, time] = appointment.date.split(" ")
      return time.slice(0, 5) // Pegar apenas "HH:MM"
    })

    // Preencher os horários disponíveis
    const start = 8 * 60 // 8:00
    const end = 18 * 60 // 18:00
    let hasAvailableSlots = false

    for (let i = start; i <= end; i += 30) {
      const hour = Math.floor(i / 60)
      const minute = i % 60
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const isOccupied = occupiedTimes.includes(time)
      const option = document.createElement("option")
      option.value = time
      option.textContent = time
      if (isOccupied) {
        option.disabled = true
        option.textContent += " (Ocupado)"
      } else {
        hasAvailableSlots = true
      }
      timeSelect.appendChild(option)
    }

    // Se não houver horários disponíveis, exibir uma mensagem
    if (!hasAvailableSlots) {
      timeSelect.innerHTML = '<option value="">Nenhum horário disponível</option>'
      scheduleMessage.textContent = `Nenhum horário disponível para ${selectedBarber} nesta data. Tente outro barbeiro ou outra data.`
      scheduleMessage.style.color = "#dc3545"
    }
  }

  // Atualizar os horários disponíveis quando a data ou o barbeiro mudar
  dateInput.addEventListener("change", populateTimeSlots)
  barberSelect.addEventListener("change", populateTimeSlots)
  populateTimeSlots()

  scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const barber = barberSelect.value
    const date = dateInput.value
    const time = timeSelect.value

    // Verificar se pelo menos um serviço foi selecionado
    const selectedServices = Array.from(serviceCheckboxes).filter((checkbox) => checkbox.checked)
    if (selectedServices.length === 0) {
      scheduleMessage.textContent = "Por favor, selecione pelo menos um serviço."
      scheduleMessage.style.color = "#dc3545"
      return
    }

    // Verificar se não excede o limite de 3 serviços
    if (selectedServices.length > 3) {
      scheduleMessage.textContent = "Você pode selecionar no máximo 3 serviços."
      scheduleMessage.style.color = "#dc3545"
      return
    }

    if (!time) {
      scheduleMessage.textContent = "Por favor, selecione um horário disponível."
      scheduleMessage.style.color = "#dc3545"
      return
    }

    // Preparar os serviços selecionados
    const services = selectedServices.map((checkbox) => ({
      name: checkbox.dataset.name,
      price: Number.parseFloat(checkbox.dataset.price),
    }))

    const agendamento = {
      client_name: currentUser.name,
      barber_name: barber,
      services: services,
      date: `${date} ${time}:00`,
    }

    console.log(agendamento)
    try {
      // Se não houver conflito, prosseguir com o agendamento
      const response = await fetchWithErrorHandling("http://localhost:3000/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agendamento),
      })

      console.log(response)

      scheduleMessage.textContent = "Agendamento realizado com sucesso!"
      scheduleMessage.style.color = "#28a745"
      updateProgress()
      displayLastAppointment()
      loadClientAppointments() // Atualizar a tabela de agendamentos
      populateTimeSlots() // Atualizar os horários disponíveis

      // Limpar os checkboxes
      serviceCheckboxes.forEach((checkbox) => {
        checkbox.checked = false
      })
      updateTotalPrice()
    } catch (error) {
      console.log(error)
      // Simulação temporária para agendamento (se o backend não estiver disponível)
      const hasConflict = simulatedAppointments.some(
        (appointment) =>
          appointment.barber_name === barber &&
          appointment.date === agendamento.date &&
          (appointment.status === "scheduled" || appointment.status === "confirmed"),
      )

      if (hasConflict) {
        scheduleMessage.textContent = `O barbeiro ${barber} já está ocupado neste horário. Por favor, escolha outro horário ou barbeiro.`
        scheduleMessage.style.color = "#dc3545"
        populateTimeSlots() // Atualizar os horários disponíveis para garantir consistência
        return
      }

      const simulatedId = `simulated_${Date.now()}` // Gerar um ID único para o agendamento simulado
      const simulatedAppointment = { ...agendamento, _id: simulatedId }
      simulatedAppointments.push(simulatedAppointment)
      localStorage.setItem("simulatedAppointments", JSON.stringify(simulatedAppointments))

      currentUser.appointments += 1
      localStorage.setItem("user", JSON.stringify(currentUser))

      lastAppointment = agendamento
      lastAppointmentId = simulatedId
      localStorage.setItem("lastAppointment", JSON.stringify(lastAppointment))
      localStorage.setItem("lastAppointmentId", lastAppointmentId)

      scheduleMessage.textContent = "Agendamento realizado com sucesso (simulação)."
      scheduleMessage.style.color = "#28a745"
      updateProgress()
      displayLastAppointment()
      loadClientAppointmentsSimulated() // Atualizar a tabela com simulação
      populateTimeSlots() // Atualizar os horários disponíveis

      // Limpar os checkboxes
      serviceCheckboxes.forEach((checkbox) => {
        checkbox.checked = false
      })
      updateTotalPrice()
    }
  })

  // Função para cancelar o último agendamento (via card de visão geral)
  cancelAppointmentBtn.addEventListener("click", () => {
    if (!lastAppointment) {
      scheduleMessage.textContent = "Nenhum agendamento para cancelar."
      scheduleMessage.style.color = "#dc3545"
      return
    }
    showConfirmationModal(lastAppointment._id)
  })

  // Assinatura
  const subscribeBtn = document.getElementById("subscribeBtn")
  const subscriptionStatus = document.getElementById("subscriptionStatus")

  subscribeBtn.addEventListener("click", () => {
    currentUser.subscription = true
    localStorage.setItem("user", JSON.stringify(currentUser))
    subscriptionStatus.textContent = "Você é assinante! 1 corte por semana liberado."
    updateProgress()
  })

  // Benefícios
  const progress = document.getElementById("progress")
  function updateProgress() {
    const text = currentUser.subscription ? "Assinante" : `${currentUser.appointments}/5`
    progress.textContent = text
    if (!currentUser.subscription && currentUser.appointments >= 5) {
      currentUser.appointments = 0
      localStorage.setItem("user", JSON.stringify(currentUser))
      alert("Parabéns! Você ganhou um agendamento grátis!")
    }
  }

  updateProgress()

  // ===== INÍCIO DO CÓDIGO ADICIONAL PARA O MODAL DE EDIÇÃO =====

  // Variáveis para o modal de edição
  const editAppointmentModal = document.getElementById("editAppointmentModal")
  const editAppointmentForm = document.getElementById("editAppointmentForm")
  const editBarberSelect = document.getElementById("editBarberSelect")
  const editDateInput = document.getElementById("editDateInput")
  const editTimeSelect = document.getElementById("editTimeSelect")
  const editTotalPrice = document.getElementById("editTotalPrice")
  const closeEditModalBtn = document.getElementById("closeEditModalBtn")
  const editAppointmentOverviewBtn = document.getElementById("editAppointmentOverviewBtn")
  const editServiceCheckboxes = document.querySelectorAll(".edit-service-checkbox")

  // Variável para armazenar o ID do agendamento sendo editado
  let currentEditingAppointmentId = null

  // Função para calcular o preço total no formulário de edição
  function updateEditTotalPrice() {
    let total = 0
    let selectedCount = 0

    editServiceCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedCount++
        total += Number.parseFloat(checkbox.dataset.price)
      }
    })

    // Limitar a 3 serviços
    if (selectedCount > 3) {
      return false
    }

    editTotalPrice.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    return true
  }

  // Adicionar evento para atualizar o preço quando os checkboxes são alterados no modal de edição
  editServiceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Verificar se já tem 3 serviços selecionados
      const selectedServices = document.querySelectorAll(".edit-service-checkbox:checked")
      if (selectedServices.length > 3 && checkbox.checked) {
        checkbox.checked = false
        alert("Você pode selecionar no máximo 3 serviços.")
        return
      }
      updateEditTotalPrice()
    })
  })

  // Função para abrir o modal de edição
  function openEditModal(appointmentId) {
    currentEditingAppointmentId = appointmentId

    // Buscar os dados do agendamento
    fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}`)
      .then((appointment) => {
        // Preencher o formulário com os dados do agendamento
        const [date, time] = appointment.date.split(" ")

        // Limpar todos os checkboxes primeiro
        editServiceCheckboxes.forEach((checkbox) => {
          checkbox.checked = false
        })

        // Marcar os serviços do agendamento
        appointment.services.forEach((service) => {
          const checkbox = Array.from(editServiceCheckboxes).find(
            (cb) => cb.dataset.name.toLowerCase() === service.name.toLowerCase(),
          )
          if (checkbox) {
            checkbox.checked = true
          }
        })

        // Definir o barbeiro
        editBarberSelect.value = appointment.barber_name

        // Definir a data
        editDateInput.value = date

        // Preencher os horários disponíveis
        populateEditTimeSlots(date, appointment.barber_name, time.slice(0, 5))

        // Atualizar o preço total
        updateEditTotalPrice()

        // Exibir o modal
        editAppointmentModal.style.display = "block"
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do agendamento:", error)
        alert("Não foi possível carregar os dados do agendamento. Tente novamente mais tarde.")
      })
  }

  // Função para fechar o modal de edição
  function closeEditModal() {
    editAppointmentModal.style.display = "none"
    currentEditingAppointmentId = null
  }

  // Função para preencher os horários disponíveis no formulário de edição
  async function populateEditTimeSlots(selectedDate, selectedBarber, currentTime) {
    editTimeSelect.innerHTML = ""

    // Verificar se a data e o barbeiro foram selecionados
    if (!selectedDate || !selectedBarber) {
      editTimeSelect.innerHTML = '<option value="">Selecione uma data e um barbeiro</option>'
      return
    }

    // Obter agendamentos existentes para a data e barbeiro selecionados
    try {
      const url = `http://localhost:3000/api/agendamentos?barber_name=${encodeURIComponent(selectedBarber)}&start_date=${selectedDate}&end_date=${selectedDate}&status=scheduled&status=confirmed`
      const existingAppointments = await fetchWithErrorHandling(url)

      // Extrair os horários ocupados (exceto o horário atual sendo editado)
      const occupiedTimes = existingAppointments.data
        .filter((appointment) => appointment._id !== currentEditingAppointmentId)
        .map((appointment) => {
          const [, time] = appointment.date.split(" ")
          return time.slice(0, 5) // Pegar apenas "HH:MM"
        })

      // Preencher os horários disponíveis
      const start = 8 * 60 // 8:00
      const end = 18 * 60 // 18:00

      for (let i = start; i <= end; i += 30) {
        const hour = Math.floor(i / 60)
        const minute = i % 60
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const isOccupied = occupiedTimes.includes(time)
        const option = document.createElement("option")
        option.value = time
        option.textContent = time

        if (isOccupied) {
          option.disabled = true
          option.textContent += " (Ocupado)"
        }

        // Selecionar o horário atual do agendamento
        if (time === currentTime) {
          option.selected = true
        }

        editTimeSelect.appendChild(option)
      }
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error)
      editTimeSelect.innerHTML = '<option value="">Erro ao carregar horários</option>'
    }
  }

  // Evento para atualizar os horários disponíveis quando a data ou o barbeiro mudar
  editDateInput.addEventListener("change", () => {
    populateEditTimeSlots(editDateInput.value, editBarberSelect.value)
  })

  editBarberSelect.addEventListener("change", () => {
    populateEditTimeSlots(editDateInput.value, editBarberSelect.value)
  })

  // Evento para fechar o modal
  closeEditModalBtn.addEventListener("click", closeEditModal)

  // Evento para enviar o formulário de edição
  editAppointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!currentEditingAppointmentId) {
      alert("ID do agendamento não encontrado.")
      return
    }

    // Verificar se pelo menos um serviço foi selecionado
    const selectedServices = Array.from(editServiceCheckboxes).filter((checkbox) => checkbox.checked)
    if (selectedServices.length === 0) {
      alert("Por favor, selecione pelo menos um serviço.")
      return
    }

    // Verificar se não excede o limite de 3 serviços
    if (selectedServices.length > 3) {
      alert("Você pode selecionar no máximo 3 serviços.")
      return
    }

    // Preparar os serviços selecionados
    const services = selectedServices.map((checkbox) => ({
      name: checkbox.dataset.name,
      price: Number.parseFloat(checkbox.dataset.price),
    }))

    const updatedAppointment = {
      barber_name: editBarberSelect.value,
      services: services,
      date: `${editDateInput.value} ${editTimeSelect.value}:00`,
    }

    console.log(updatedAppointment)

    try {
      await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${currentEditingAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAppointment),
      })

      // Fechar o modal
      closeEditModal()

      // Atualizar a interface
      scheduleMessage.textContent = "Agendamento atualizado com sucesso!"
      scheduleMessage.style.color = "#28a745"

      // Recarregar os dados
      displayLastAppointment()
      loadClientAppointments()
      populateTimeSlots()
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error)
      alert(`Erro ao atualizar agendamento: ${error.message || "Tente novamente mais tarde."}`)
    }
  })

  // Adicionar evento ao botão de editar na visão geral do último agendamento
  if (editAppointmentOverviewBtn) {
    editAppointmentOverviewBtn.addEventListener("click", () => {
      if (lastAppointment && lastAppointment._id) {
        openEditModal(lastAppointment._id)
      } else {
        alert("Nenhum agendamento disponível para edição.")
      }
    })
  }

  // Adicionar eventos aos botões de editar na tabela de agendamentos
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("edit-client-btn")) {
      const appointmentId = e.target.getAttribute("data-id")
      if (appointmentId) {
        openEditModal(appointmentId)
      }
    }
  })
}

// Inicializar o módulo
if (document.querySelector(".dashboard-container")) initializeDashboard()
