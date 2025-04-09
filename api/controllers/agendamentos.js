import { ObjectId } from "mongodb"

const collectionAgendamentos = 'agendamentos'

// Get all Agendamentos
export const getAgendamentos = async (req, res) => {
    try {
        const db = req.app.locals.db
        const agendamentos = await db
            .collection(collectionAgendamentos)
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

        const agendamento = await db.collection(collectionAgendamentos).findOne({
            _id : new ObjectId(id)
        })
        if (!agendamento) 
            return res.status(404).json({ error: true, message: "Agendamento não encontrado" })
        
        res.status(200).json(agendamento)
    } catch (error) {
        console.error("Falha ao procurar por agendamento:", error)
        res.status(500).json({ error: true, message: "Falha ao procurar por agendamento" })
    }
}

// Create new agendamento
export const createAgendamento = async (req, res) => {
    try {
        const { client_name,
            barber_name,
            service,
            date,
            status,
            created_at,
            updated_at } = req.body
        const db = req.app.locals.db
      
        //Checando se uma data já existe
        const existingAgendamento = await db.collection(collectionAgendamentos).findOne({ date })
        if (existingAgendamento) {
          return res.status(409).json({
            error: true,
            message: "Já existe um agendamento marcado para essa data",
          })
        }
      
        const newAgendamento = {
            client_name,
            barber_name,
            service,
            date,
            status,
            created_at,
            updated_at
        }
      
        const result = await db.collection(collectionAgendamentos).insertOne(newAgendamento)
      
        res.status(201).json({
          _id: result.insertedId,
          ...newAgendamento,
        })
      } catch (error) {
        console.error("Problema ao criar um agendamento:", error)
        res.status(500).json({ error: true, message: "Falhou ao criar Agendamento" })
      }
}

// Update agendamento
export const updateAgendamento = async (req, res) => {
    try {
        const {id} = req.params
        const updateData = req.body
        const db = req.app.locals.db

        if(updateData.date){
            const existingAgendamento = await db.collection(collectionAgendamentos).findOne({
                date : updateData.date,
                _id : {$ne : new ObjectId(id)}
            })

            if(existingAgendamento){
                return  res.status(409).json({
                    error: true,
                    message: "Outro agendamento já está marcado para essa data",
                })
            }
        }

        const result = await db.collection(collectionAgendamentos).updateOne(
            {_id : new ObjectId(id)},
            {$set : updateData}
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: true, message: "Agendamento não encontrado" })
        }
        
        const updatedAgendamento = await db.collection(collectionAgendamentos).findOne({
            _id: new ObjectId(id),
        })
    
        res.status(200).json(updatedAgendamento)
    } catch (error) {
        console.error("Problema ao atualizar um agendamento:", error)
        res.status(500).json({ error: true, message: "Falhou ao atualizar Agendamento" })
    }
}

// Delete agendamento
export const deleteAgendamento = async (req, res) => {
    try {
        const {id} = req.params
        const db = req.app.locals.db
        const result = await db.collection(collectionAgendamentos).deleteOne({
            _id : new ObjectId(id)
        })

        if(result.deletedCount === 0)
            return res.status(404).json({
                error : true,
                message : 'Nenhum agendamento encontrado'
            })

        res.status(200).json(result)
        
    } catch (error) {
        console.error("Problema ao deletar um agendamento:", error)
        res.status(500).json({ error: true, message: "Falhou ao remover Agendamento" })
    }
}