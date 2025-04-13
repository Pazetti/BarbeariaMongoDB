import express from "express"
import {
    getTotalAgendamentos,
    getAgendamentos,
    getAgendamentoById,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    cancelarAgendamento,
    confirmarAgendamento
} from "../controllers/agendamentos.js"
 
/* Métodos de validação
import { 
    
} from "../middleware/validation.js" */

const router = express.Router()

// Get all agendamentos
router.get("/", getAgendamentos)

//Get count agendamentos
router.get("/total", getTotalAgendamentos)

// // Get agendamento by ID
router.get("/:id", getAgendamentoById)

// // Create new agendamento
router.post("/", createAgendamento)

// // Update agendamento
router.put("/:id", updateAgendamento)

// Patch status de um agendamento para cancelado
router.patch("/:id/cancelar", cancelarAgendamento)

// Patch status de um agendamento para confirmado
router.patch("/:id/confirmar", confirmarAgendamento)

// // Delete agendamento
router.delete("/:id", deleteAgendamento)

export default router