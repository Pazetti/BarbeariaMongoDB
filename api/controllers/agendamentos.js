import { ObjectId } from "mongodb"

// Get all Agendamentos
export const getAgendamentos = async (req, res) => {
    try {
        const db = req.app.locals.db
        const agendamentos = await db
            .collection("agendamentos")
            .find()
            .toArray()

        res.status(200).json({
            data: agendamentos,
        })
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error)
        res.status(500).json({ error: true, message: "Falha ao buscar agendamentos" })
    }
}

// Get agendamento by ID
export const getAgendamentoById = async (req, res) => {
    try {
        const {id} = req.params
        const db = req.app.locals.db

        const agendamento = await db.collection('agendamentos').findOne({
            _id : new ObjectId(id)
        })
        if (!agendamento) {
            return res.status(404).json({ error: true, message: "Agendamento não encontrado" })
        }
        res.status(200).json(agendamento)
    } catch (error) {
        console.error("Falha ao procurar por agendamento:", error)
        res.status(500).json({ error: true, message: "Falha ao procurar por agendamento" })
    }
}

// Create new agendamento
export const createAgendamento = async (req, res) => {
    try {
        const db = req.app.locals.db
        const 
        {
            client_name,
            barber_name,
            service,
            date,
            status,
            created_at,
            updated_at
        } = req.body

        const agendamentoExiste = await db.collection('agendamentos').findOne({date})
        
        if (agendamentoExiste) {
            res.status(409).json({
                "error": true,
                "message": "Já existe um agendamento para esta data"
            })
            return
        }

        const novoAgendamento = {
            client_name,
            barber_name,
            service,
            date,
            status,
            created_at,
            updated_at
        }
        
        const result = await db.collection('agendamentos').insertOne({
            novoAgendamento
        })

        res.status(201).json({ 
            "message": "Agendamento realizado com sucesso", 
            "agendamento" : [
            {_id : result.insertedId,
            ...novoAgendamento }]
        })
    } catch (error) {
        console.error("Falha ao criar um agendamento:", error)
        res.status(500).json({ error: true, message: "Falha ao criar um agendamento" })
    }
}

// Update agendamento
export const updateAgendamento = async (req, res) => {
    try {
    
    } catch (error) {

    }
}

// Delete agendamento
export const deleteAgendamento = async (req, res) => {
    try {
    
    } catch (error) {
    
    }
}