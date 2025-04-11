import express from "express"
import {
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

// Get all agendamento
router.get("/", getAgendamentos)

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