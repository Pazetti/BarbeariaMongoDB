import express from "express"
/* Métodos de ação (criar, remover, editar)
import {
    
} from "../controllers/municipios.js" */
 
/* Métodos de validação
import { 
    
} from "../middleware/validation.js" */

const router = express.Router()

// Get all agendamento
router.get("/", (req,res) => {
    res.send('teste');
})

// // Get agendamento by ID
router.get("/:id", (req,res) => {
    res.send(req.params.id);
})

// // Create new agendamento
router.post("/", (req,res) => {
    res.send('teste');
})

// // Update agendamento
router.put("/:id", (req,res) => {
    res.send('teste');
})

// // Delete agendamento
router.delete("/:id", (req,res) => {
    res.send('teste');
})

export default router