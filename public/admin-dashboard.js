// admin-dashboard.js
import { fetchWithErrorHandling } from "./script.js"

// Módulo do Dashboard de Administrador
function initializeAdminDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user"))
  if (!currentUser || !currentUser.isAdmin) window.location.href = "login.html"

  // Configurar informações do administrador
  document.getElementById("adminName").textContent = currentUser.name
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user")
    window.location.href = "index.html"
  })

  // Elementos do DOM
  const statusFilter = document.getElementById("statusFilter")
  const filterType = document.getElementById("filterType")
  const filterInput = document.getElementById("filterInput")
  const startDateFilter = document.getElementById("startDateFilter")
  const endDateFilter = document.getElementById("endDateFilter")
  const singleDayFilter = document.getElementById("singleDayFilter")
  const todayBtn = document.getElementById("todayBtn")
  const refreshBtn = document.getElementById("refreshBtn")
  const clearFiltersBtn = document.getElementById("clearFiltersBtn")
  const loadingMessage = document.getElementById("loadingMessage")
  const tableBody = document.getElementById("appointmentsTableBody")
  const resultsCount = document.getElementById("resultsCount")
  const prevPageBtn = document.getElementById("prevPageBtn")
  const nextPageBtn = document.getElementById("nextPageBtn")
  const paginationNumbers = document.getElementById("paginationNumbers")
  const itemsPerPageSelect = document.getElementById("itemsPerPage")

  // Estado da paginação
  let currentPage = 1
  let totalPages = 1
  let itemsPerPage = Number.parseInt(itemsPerPageSelect.value)
  let totalItems = 0

  // Simulação de agendamentos (usando os mesmos dados simulados do dashboard de cliente)
  let simulatedAppointments = JSON.parse(localStorage.getItem("simulatedAppointments")) || []

  // Função para carregar estatísticas e agendamentos
  async function loadStats(page = 1) {
    loadingMessage.style.display = "block"
    tableBody.innerHTML = "" // Limpar tabela enquanto carrega
    currentPage = page

    try {
      // Atualizar o número de itens por página
      itemsPerPage = Number.parseInt(itemsPerPageSelect.value)

      // Montar filtros
      const filters = {
        page: page,
        limit: itemsPerPage,
      }

      // Pegando valores dos inputs/selects
      if (statusFilter.value && statusFilter.value !== "all") {
        filters.status = statusFilter.value
      }

      // Adicionar filtro baseado no tipo selecionado
      if (filterInput.value.trim()) {
        const selectedFilter = filterType.value
        switch (selectedFilter) {
          case "client_name":
            filters.client_name = filterInput.value.trim()
            break
          case "barber_name":
            filters.barber_name = filterInput.value.trim()
            break
          case "service":
            filters.service = filterInput.value.trim()
            break
        }
      }

      // Adicionar filtro de data
      if (startDateFilter.value) {
        filters.start_date = startDateFilter.value
      }

      if (endDateFilter.value) {
        filters.end_date = endDateFilter.value
      }

      //filters.sort = 'client_name'

      // Montar query string com URLSearchParams
      const queryString = new URLSearchParams(filters).toString()
      const appointmentsUrl = `http://localhost:3000/api/agendamentos${queryString ? "?" + queryString : ""}`

      console.log(appointmentsUrl) // conferindo a URL final

      const appointments = await fetchWithErrorHandling(appointmentsUrl)
      //const clients = await fetchWithErrorHandling("http://localhost:3000/api/users")

      // Atualizar estatísticas
      const totalAppointments = await fetchWithErrorHandling("http://localhost:3000/api/agendamentos/total")
      document.getElementById("totalAppointments").textContent = totalAppointments.count
      //document.getElementById("totalClients").textContent = clients.length

      // Atualizar informações de paginação
      totalItems = appointments.pagination.total
      totalPages = appointments.pagination.pages
      currentPage = appointments.pagination.page
      itemsPerPage = appointments.pagination.limit

      // Atualizar contador de resultados
      updateResultsCount(appointments.data.length, totalItems)

      // Atualizar controles de paginação
      updatePaginationControls()

      const statusLabels = {
        canceled: "Cancelado",
        confirmed: "Confirmado",
        scheduled: "Agendado",
      }

      // Carregar agendamentos na tabela
      appointments.data.forEach((appointment) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${new Date(appointment.date).toLocaleString("pt-BR")}</td>
          <td>${appointment.client_name}</td>
          <td>${appointment.services.map(service => service.name).join(", ")}</td>
          <td>${appointment.barber_name}</td>
          <td class='status-${appointment.status}'>${statusLabels[appointment.status] || appointment.status}</td>
          <td class='appointments-table-actions'>
            ${
              appointment.status === "scheduled"
                ? `<button class="btn btn-confirm confirm-btn" data-id="${appointment._id}">Confirmar</button>
                   <button class="btn btn-secondary cancel-btn" data-id="${appointment._id}">Cancelar</button>`
                : appointment.status === "canceled" 
                ? `<button class="btn btn-secondary delete-btn" data-id="${appointment._id}">Deletar</button>`
                : "-"
            }
          </td>
        `
        tableBody.appendChild(row)
      })

      // Adicionar eventos aos botões de confirmar
      document.querySelectorAll(".confirm-btn").forEach((button) => {
        button.addEventListener("click", () => clickActionButton(button, "confirmed"))
      })

      // Adicionar eventos aos botões de cancelar
      document.querySelectorAll(".cancel-btn").forEach((button) => {
        button.addEventListener("click", () => clickActionButton(button, "canceled"))
      })

      document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener("click", async () => {
          const appointmentId = button.getAttribute("data-id")
          const row = button.closest("tr")
          try {
            row.style.opacity = "0.4" // Feedback visual
            await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            })
          } catch (error) {
            console.error(`Falha ao deletar:`, error)
            // Rollback visual se necessário
            row.style.opacity = "1"
          }
        })
      })

    } catch (error) {
      console.log("Não foi possível exibir dados da API " + error)
      // Se o backend não estiver disponível, usar a simulação
      loadStatsSimulated(page)
    } finally {
      loadingMessage.style.display = "none"
    }
  }

  async function clickActionButton(button, statusValue) {
    const appointmentId = button.getAttribute("data-id")
    const row = button.closest("tr")

    const action = statusValue == "canceled" ? "cancelar" : "confirmar"
    const statusTextContent = statusValue == "canceled" ? "Cancelado" : "Confirmado"

    try {
      row.style.opacity = "0.7" // Feedback visual
      await fetchWithErrorHandling(`http://localhost:3000/api/agendamentos/${appointmentId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })

      // Atualização direta do DOM (sem recarregar tudo)
      row.cells[4].textContent = statusTextContent // Status
      row.cells[4].classList.remove(`status-scheduled`)
      row.cells[4].classList.add(`status-${statusValue}`)
      row.cells[5].innerHTML = "-" // Ações
    } catch (error) {
      console.error(`Falha ao ${action}:`, error)
      // Rollback visual se necessário
      row.style.opacity = "1"
    }
  }

  // Função para carregar estatísticas e agendamentos simulados
  function loadStatsSimulated(page = 1) {
    loadingMessage.style.display = "block"
    tableBody.innerHTML = "" // Limpar tabela enquanto carrega

    // Atualizar o número de itens por página
    itemsPerPage = Number.parseInt(itemsPerPageSelect.value)

    // Simulação de clientes (apenas para exibir algo nas estatísticas)
    const simulatedClients = JSON.parse(localStorage.getItem("simulatedClients")) || [{ name: currentUser.name }]

    // Atualizar estatísticas
    document.getElementById("totalAppointments").textContent = simulatedAppointments.length
    document.getElementById("totalClients").textContent = simulatedClients.length

    // Aplicar filtros aos dados simulados
    let filteredAppointments = [...simulatedAppointments]

    // Filtrar por status
    const selectedStatus = statusFilter.value
    if (selectedStatus !== "all") {
      filteredAppointments = filteredAppointments.filter((appointment) => appointment.status === selectedStatus)
    }

    // Aplicar filtro baseado no tipo selecionado
    if (filterInput.value.trim()) {
      const selectedFilter = filterType.value
      const searchTerm = filterInput.value.trim().toLowerCase()

      switch (selectedFilter) {
        case "client_name":
          filteredAppointments = filteredAppointments.filter((appointment) =>
            appointment.client_name.toLowerCase().includes(searchTerm),
          )
          break
        case "barber_name":
          filteredAppointments = filteredAppointments.filter((appointment) =>
            appointment.barber_name.toLowerCase().includes(searchTerm),
          )
          break
        case "service":
          filteredAppointments = filteredAppointments.filter((appointment) =>
            appointment.service.some((service) => service.toLowerCase().includes(searchTerm)),
          )
          break
      }
    }

    // Filtrar por data
    if (startDateFilter.value) {
      const startDate = new Date(startDateFilter.value)
      startDate.setHours(0, 0, 0, 0)

      filteredAppointments = filteredAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate >= startDate
      })
    }

    if (endDateFilter.value) {
      const endDate = new Date(endDateFilter.value)
      endDate.setHours(23, 59, 59, 999)

      filteredAppointments = filteredAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate <= endDate
      })
    }

    // Atualizar informações de paginação para simulação
    totalItems = filteredAppointments.length
    totalPages = Math.ceil(totalItems / itemsPerPage)
    currentPage = page > totalPages ? 1 : page

    // Aplicar paginação aos dados simulados
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

    // Atualizar contador de resultados
    updateResultsCount(paginatedAppointments.length, totalItems)

    // Atualizar controles de paginação
    updatePaginationControls()

    // Carregar agendamentos na tabela
    paginatedAppointments.forEach((appointment) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${new Date(appointment.date).toLocaleString("pt-BR")}</td>
        <td>${appointment.client_name}</td>
        <td>${appointment.service.join(", ")}</td>
        <td>${appointment.barber_name}</td>
        <td class="status-${appointment.status}">${appointment.status}</td>
        <td>
          ${
            appointment.status === "scheduled"
              ? `<button class="btn btn-confirm confirm-btn" data-id="${appointment._id}">Confirmar</button>
                 <button class="btn btn-secondary cancel-btn" data-id="${appointment._id}">Cancelar</button>`
              : "-"
          }
        </td>
      `
      tableBody.appendChild(row)
    })

    // Adicionar eventos aos botões de confirmar
    document.querySelectorAll(".confirm-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const appointmentId = button.getAttribute("data-id")
        simulatedAppointments = simulatedAppointments.map((appointment) => {
          if (appointment._id === appointmentId) {
            return { ...appointment, status: "confirmed", updated_at: new Date().toISOString() }
          }
          return appointment
        })
        localStorage.setItem("simulatedAppointments", JSON.stringify(simulatedAppointments))
        loadStatsSimulated(currentPage)
      })
    })

    // Adicionar eventos aos botões de cancelar
    document.querySelectorAll(".cancel-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const appointmentId = button.getAttribute("data-id")
        simulatedAppointments = simulatedAppointments.map((appointment) => {
          if (appointment._id === appointmentId) {
            return { ...appointment, status: "canceled", updated_at: new Date().toISOString() }
          }
          return appointment
        })
        localStorage.setItem("simulatedAppointments", JSON.stringify(simulatedAppointments))
        loadStatsSimulated(currentPage)
      })
    })

    loadingMessage.style.display = "none"
  }

  // Função para atualizar o contador de resultados
  function updateResultsCount(currentCount, totalCount) {
    resultsCount.textContent = `Exibindo ${currentCount} de ${totalCount} agendamentos`
  }

  // Função para atualizar os controles de paginação
  function updatePaginationControls() {
    // Atualizar botões de navegação
    prevPageBtn.disabled = currentPage <= 1
    nextPageBtn.disabled = currentPage >= totalPages

    // Limpar e recriar números de página
    paginationNumbers.innerHTML = ""

    // Se não houver páginas, não mostrar paginação
    if (totalPages <= 0) {
      return
    }

    // Determinar quais números de página mostrar
    let startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)

    // Ajustar se estamos perto do final
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4)
    }

    // Adicionar primeira página se não estiver incluída
    if (startPage > 1) {
      addPageNumber(1)
      if (startPage > 2) {
        addEllipsis()
      }
    }

    // Adicionar números de página
    for (let i = startPage; i <= endPage; i++) {
      addPageNumber(i)
    }

    // Adicionar última página se não estiver incluída
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        addEllipsis()
      }
      addPageNumber(totalPages)
    }
  }

  // Função para adicionar um número de página
  function addPageNumber(pageNum) {
    const pageElement = document.createElement("div")
    pageElement.className = `page-number ${pageNum === currentPage ? "active" : ""}`
    pageElement.textContent = pageNum
    pageElement.addEventListener("click", () => {
      if (pageNum !== currentPage) {
        loadStats(pageNum)
      }
    })
    paginationNumbers.appendChild(pageElement)
  }

  // Função para adicionar reticências na paginação
  function addEllipsis() {
    const ellipsis = document.createElement("div")
    ellipsis.className = "page-number"
    ellipsis.textContent = "..."
    ellipsis.style.cursor = "default"
    paginationNumbers.appendChild(ellipsis)
  }

  // Função para limpar todos os filtros
  function clearFilters() {
    statusFilter.value = "all"
    filterType.value = "client_name"
    filterInput.value = ""
    startDateFilter.value = ""
    endDateFilter.value = ""
    singleDayFilter.checked = false
    loadStats(1)
  }

  // Função para definir a data de hoje
  function setToday() {
    const today = new Date().toISOString().split("T")[0]
    startDateFilter.value = today
    endDateFilter.value = today
    singleDayFilter.checked = true
  }

  // Função para sincronizar datas quando o filtro de dia único está ativado
  function syncDates() {
    if (singleDayFilter.checked) {
      if (this === startDateFilter) {
        endDateFilter.value = startDateFilter.value
      } else {
        startDateFilter.value = endDateFilter.value
      }
    }
    loadStats()
  }

  // Carregar dados inicialmente
  loadStats(1)

  // Adicionar eventos aos filtros
  statusFilter.addEventListener("change", () => loadStats(1))
  filterType.addEventListener("change", () => {
    // Atualizar placeholder do input baseado no tipo selecionado
    const placeholders = {
      client_name: "Digite o nome do cliente...",
      barber_name: "Digite o nome do barbeiro...",
      service: "Digite o tipo de serviço...",
    }
    filterInput.placeholder = placeholders[filterType.value]
  })

  filterInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") loadStats(1)
  })

  startDateFilter.addEventListener("change", syncDates)
  endDateFilter.addEventListener("change", syncDates)

  singleDayFilter.addEventListener("change", function () {
    if (this.checked && startDateFilter.value) {
      endDateFilter.value = startDateFilter.value
    } else if (this.checked && endDateFilter.value) {
      startDateFilter.value = endDateFilter.value
    }
  })

  todayBtn.addEventListener("click", () => {
    setToday()
    loadStats(1)
  })

  // Adicionar evento ao seletor de itens por página
  itemsPerPageSelect.addEventListener("change", () => {
    // Ao mudar o número de itens por página, voltar para a primeira página
    loadStats(1)
  })

  // Adicionar evento ao botão de recarregar
  refreshBtn.addEventListener("click", () => loadStats(currentPage))

  // Adicionar evento ao botão de limpar filtros
  clearFiltersBtn.addEventListener("click", clearFilters)

  // Adicionar eventos aos botões de paginação
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      loadStats(currentPage - 1)
    }
  })

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      loadStats(currentPage + 1)
    }
  })
}

// Inicializar o módulo
if (document.querySelector(".admin-dashboard-container")) initializeAdminDashboard()
