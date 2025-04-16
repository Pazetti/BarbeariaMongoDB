import { ObjectId } from "mongodb"

const collectionAgendamentos = 'agendamentos'

export const getTotalAgendamentos = async (req,res) => {
    try {
        const db = req.app.locals.db;
        const total = await db.collection(collectionAgendamentos).find().count()

        res.status(200).json({total})
    } catch (error) {
        console.error("Erro ao contar agendamentos:", error)
        res.status(500).json({ error: true, message: "Falha ao contar agendamentos" })
    }
}

// Get all Agendamentos
export const getAgendamentos = async (req, res) => {
    try {
        const {
            client_name, 
            barber_name,
            service, 
            start_date,
            end_date, 
            status, 
            sort, 
            page = 1, 
            limit = 20, 
            order = "asc"
        } = req.query
        const skip = (page - 1) * limit

        const query = {}
        if(client_name){
            query.client_name = {$regex : client_name, $options : "i"}
        }
        if(barber_name){
            query.barber_name = {$regex : barber_name, $options : "i"}
        }
        if(service) {
            query["services.name"] = { $regex: service, $options: "i" };
        }
        if (start_date && end_date) {
            const start = start_date + " 00:00:00";
            const end = end_date + " 23:59:59";
          
            query.date = {
              $gte: start,
              $lte: end
            };
          }
        if(status) {
            if(Array.isArray(status)){
                query.status = {$in : status}
            }
            else{
                query.status = status
            }
        }

        const sortOptions = {}
        if (sort) {
            sortOptions[sort] = order.toLowerCase() === "desc" ? -1 : 1
        } else {
            // Ordenação padrão por nome se nenhuma for especificada
            sortOptions.date = 1
        }

        const db = req.app.locals.db
        const agendamentos = await db
            .collection(collectionAgendamentos)
            .find(query)
            .sort(sortOptions) 
            .skip(Number.parseInt(skip))
            .limit(Number.parseInt(limit))
            .toArray()

        const total = await db.collection(collectionAgendamentos).find(query).count()
        res.status(200).json({
            data : agendamentos,
            pagination : {
                total,
                page: Number.parseInt(page),
                limit: Number.parseInt(limit),
                pages: limit != 0 ? Math.ceil(total / limit) : 1
            }
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
            services,
            total_price,
            date,
            status} = req.body
        const db = req.app.locals.db
      
        //Checando se uma data já existe
        const existingAgendamento = await db.collection(collectionAgendamentos).findOne(
            { date, barber_name, status : {$ne : 'canceled'}}
        )

        if (existingAgendamento) {
          return res.status(409).json({
            error: true,
            message: "Um agendamento já foi marcado para essa data com nosso barbeiro",
          })
        }
      
        const newAgendamento = {
            client_name,
            barber_name,
            services,
            total_price,
            date,
            status
        }
      
        const result = await db.collection(collectionAgendamentos).insertOne({
            ...newAgendamento,
            created_at : new Date(),
            updated_at : new Date()
        })

        console.log(result)
      
        res.status(201).json({
            _id: result.insertedId,
            ...newAgendamento,
            created_at : new Date().toISOString(),
            updated_at : new Date().toISOString()
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
        const updatedData = req.body
        const db = req.app.locals.db

        if(updatedData.date){
            const existingAgendamento = await db.collection(collectionAgendamentos).findOne({
                date : updatedData.date,
                barber_name : updatedData.barber_name,
                status : {$ne : 'canceled'},
                _id : {$ne : new ObjectId(id)}
            })

            if(existingAgendamento){
                return res.status(409).json({
                    error: true,
                    message: "Outro agendamento já está marcado para essa data",
                })
            }
        }

        console.log(updatedData)

        const result = await db.collection(collectionAgendamentos).updateOne(
            {_id : new ObjectId(id)},
            {$set : updatedData}
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

export const cancelarAgendamento = async (req,res) => mudarStatusAgendamento(req,res,"canceled")

export const confirmarAgendamento = async (req,res) => mudarStatusAgendamento(req,res,"confirmed")

const mudarStatusAgendamento = async (req, res, newStatus) => {
    try {
        const {id} = req.params
        const db = req.app.locals.db
        const text = newStatus == 'canceled' ? 'cancelado' : 'confirmado' 
           
        const result = await db.collection(collectionAgendamentos).updateOne(
            {
                _id : new ObjectId(id), 
                status : "scheduled"
            },
            {
                $set : {
                    status : newStatus,
                    updated_at : new Date().toISOString()
                }
            }
        )
        if(result.modifiedCount === 0){
            res.status(404).json({
                error : true,
                message : `Agendamento não encontrado ou já ${text}`
            })
            return
        }

        const updatedAgendamento = await db.collection(collectionAgendamentos).findOne({
            _id : new ObjectId(id)
        })

        res.status(200).json({
            error: false,
            message : `Agendamento ${text} com sucesso`,
            data : updatedAgendamento
        })
    } catch (error) {
        console.error(`Agendamento não ${text}, ocorreu um problema ao alterar o status, : `, error)
        res.status(500).json({ error: true, message: `Agendamento não ${text}, ocorreu um erro ao alterar status, ` })
    }
}