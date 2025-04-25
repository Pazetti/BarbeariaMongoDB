import { check, param, validationResult } from "express-validator"

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

// Validações para a criação de agendamento
export const validateAgendamento = [
  //Nome do Cliente
  check('client_name')
  .notEmpty()
  .withMessage('O nome do cliente não pode estar vazio')
  .isLength({max : 100})
  .withMessage("O nome do cliente deve ter no máximo 100 caracteres")
  .matches(/^[A-Za-zÀ-ú\s()\-.,'"!?]+$/, "i")
  .withMessage("O nome do cliente deve conter apenas letras, espaços e caracteres especiais válidos"),
  //Nome do barbeiro
  check('barber_name')
  .notEmpty()
  .withMessage('O nome do barbeiro não pode estar vazio')
  .isLength({max : 100})
  .withMessage("O nome do barbeiro deve ter no máximo 100 caracteres")
  .matches(/^[A-Za-zÀ-ú\s()\-.,'"!?]+$/, "i")
  .withMessage("O nome do barbeiro deve conter apenas letras, espaços e caracteres especiais válidos"),
  //Services
  check('services')
  .notEmpty()
  .withMessage("O campo services é obrigatório")
  .isArray(),
  check('services.*.name')
  .notEmpty()
  .withMessage("O campo services deve ter um nome"),
  check('services.*.price')
  .notEmpty()
  .withMessage("O campo services deve ter um preço"),
  check('date')
  .notEmpty().withMessage("A data é obrigatória")
  .matches(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  .withMessage('A data precisa estar no formato YYYY-MM-DD HH:mm:ss'),
  
  // Aplica as validações
  validateRequest,
]

// Validações para atualização parcial do agendamento (PUT/PATCH)
export const validateUpdateAgendamento = [
  check('client_name')
  .optional()
  .isLength({max : 100})
  .withMessage("O nome do cliente deve ter no máximo 100 caracteres")
  .matches(/^[A-Za-zÀ-ú\s()\-.,'"!?]+$/, "i")
  .withMessage("O nome do cliente deve conter apenas letras, espaços e caracteres especiais válidos"),
  //Nome do barbeiro
  check('barber_name')
  .optional()
  .isLength({max : 100})
  .withMessage("O nome do barbeiro deve ter no máximo 100 caracteres")
  .matches(/^[A-Za-zÀ-ú\s()\-.,'"!?]+$/, "i")
  .withMessage("O nome do barbeiro deve conter apenas letras, espaços e caracteres especiais válidos"),
  //Services
  check('services')
  .optional()
  .isArray(),
  check('date')
  .optional()
  .matches(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  .withMessage('A data precisa estar no formato YYYY-MM-DD HH:mm:ss'),
  
  // Aplica as validações
  validateRequest,
]