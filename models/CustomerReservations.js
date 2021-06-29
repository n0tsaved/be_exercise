const { sequelize } = require('../db/connection');
const Users = require('./Users');
const Reservations = require('./Reservations');

const CustomerReservation = sequelize.define('Customer_Reservations', {}, { timestamps: false });

Users.belongsToMany(Reservations, { through: CustomerReservation, as: 'reservations' })
Reservations.belongsToMany(Users, { through: CustomerReservation, as: 'customers' })
CustomerReservation.beforeCreate(customerReserv => {
  const customerRes = CustomerReservation.findAll({
   where: {
     reservationId: customerReserv.reservationId
   }
  })
  if (customerRes.length > 3) {
    throw new Error('This reservation is already full')
  }
})

CustomerReservation.sync({ force: false })

module.exports = CustomerReservation

