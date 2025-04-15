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
db.agendamentos.find({
    $and : [
        {date : {$lte : '2024-07-22 23:59:59'}},
        {date : {$gte : '2024-07-22 00:00:00'}},
    ]
})

use('barbearia')
db.agendamentos.find({
    $and : [
        {date : {$lte : '2025-07-22 23:59:59'}},
        {date : {$gte : '2024-07-22 00:00:00'}},
    ]
})

use('barbearia')
db.agendamentos.drop()

use('barbearia')
db.agendamentos.updateMany({client_name :'Isabela Cardoso'},
    {$set : {status : 'scheduled'}}
)