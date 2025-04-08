import express from "express"
import {
    getAgendamentos,
    getAgendamentoById,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento
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

// // Delete agendamento
router.delete("/:id", deleteAgendamento)

export default router