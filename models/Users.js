const Sequelize  = require('sequelize');
const { sequelize } = require('../db/connection');
const Reservations = require('./Reservations');

const Users = sequelize.define('User', {

  id : {
    type:Sequelize.INTEGER,
    allowNull : false,
    autoIncrement : true,
    primaryKey : true
  },

  username : {
    type : Sequelize.STRING,
    allowNull : false,
  },

  email : {
    type : Sequelize.STRING,
    unique : true,
  },

  password : {
    type: Sequelize.STRING,
    allowNull: false,    
  },
});

Users.hasOne(Reservations, { foreignKey: 'creator_id' })
Users.sync({ force: false })

module.exports = Users