use('barbearia')
db.agendamentos.find({date : '2025-02-20 06:43:56'})

use('barbearia')
db.agendamentos.find().sort({created_at : -1})

use('barbearia')
db.agendamentos.find({status : 'canceled'}).count()
use('barbearia')
db.agendamentos.find({status : 'confirmed'}).count()
use('barbearia')
db.agendamentos.find({status : 'scheduled'}).count()

use('barbearia')
db.agendamentos.drop()
