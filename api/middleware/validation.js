import { check, param, validationResult } from "express-validator"
import { ObjectId } from "mongodb"

// Middleware para verificar resultados da validação
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: "Erro de validação",
      errors: errors.array(),
    })
  }
  next()
}

// Validar ObjectId
export const validateObjectId = [param("id").isMongoId().withMessage("Formato de ID inválido"), validateRequest]

// Validações para o município
export const validateAgendamento = [
  // Aplica as validações
  validateRequest,
]

// Validações para atualização parcial do município (PUT/PATCH)
export const validateUpdateAgendamento = [
  // Aplica as validações
  validateRequest,
]