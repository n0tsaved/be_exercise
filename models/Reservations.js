const Sequelize  = require('sequelize');
const { sequelize } = require('../db/connection');

const Reservations = sequelize.define('Reservations', {

  id : {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },

  startDate : {
    type : Sequelize.DATE,
    allowNull : false,
  },
  
  endDate : {
    type : Sequelize.DATE,
    allowNull : false,
  },
  creator_id : {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  
  table : {
    type: Sequelize.ENUM({
      values: [
        'TABLE 1',
        'TABLE 2',
        'TABLE 3',
        'TABLE 4',
        'TABLE 5'
      ]
    }),
    allowNull: false,    
  },
});


Reservations.sync({ force: false })

module.exports = Reservations