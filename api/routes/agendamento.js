import express from "express"
import {
    //Métodos de ação controller
} from "../controllers/municipios.js"
import { 
    //Métodos de validação do middleware
} from "../middleware/validation.js"

const router = express.Router()

// Get all agendamento
router.get("/")

// Get agendamento by ID
router.get("/:id")

// Create new agendamento
router.post("/")

// Update agendamento
router.put("/:id")

// Delete agendamento
router.delete("/:id")

export default router