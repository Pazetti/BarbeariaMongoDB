import express from "express"
import {
    getAgendamentos,
    getAgendamentoById,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    cancelarAgendamento,
    confirmarAgendamento,
    getCountAgendamentos
} from "../controllers/agendamentos.js"
import { validateAgendamento, validateObjectId, validateUpdateAgendamento } from "../middleware/validation.js"

const router = express.Router()

// Get all agendamentos
router.get("/", getAgendamentos)

//Get count agendamentos
router.get("/total", getCountAgendamentos)

// // Get agendamento by ID
router.get("/:id",validateObjectId, getAgendamentoById)

// // Create new agendamento
router.post("/",validateAgendamento, createAgendamento)

// // Update agendamento
router.put("/:id",validateObjectId, validateUpdateAgendamento, updateAgendamento)

// Patch status de um agendamento para cancelado
router.patch("/:id/cancelar",validateObjectId,validateUpdateAgendamento, cancelarAgendamento)

// Patch status de um agendamento para confirmado
router.patch("/:id/confirmar",validateObjectId, validateUpdateAgendamento, confirmarAgendamento)

// // Delete agendamento
router.delete("/:id", validateObjectId, deleteAgendamento)

export default router