// Get all municipios with optional pagination and sorting
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
        res.status(404).send('deu ruim' + error)
    }
}

// Get municipio by ID
export const getMunicipioById = async (req, res) => {
    try {
        
    } catch (error) {

    }
}

// Create new municipio
export const createMunicipio = async (req, res) => {
    try {

    } catch (error) {
    
    }
}

// Update municipio
export const updateMunicipio = async (req, res) => {
    try {
    
    } catch (error) {

    }
}

// Delete municipio
export const deleteMunicipio = async (req, res) => {
    try {
    
    } catch (error) {
    
    }
}