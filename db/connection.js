const Sequelize  = require('sequelize');
const conf = require('../config/conf')

const sequelize = new Sequelize(conf.database, conf.username, conf.password, {
    host: conf.host,
    dialect:  conf.dialect ,
    operatorsAliases:false
  });

async function connect() {
  let connection = false;
  while (!connection) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await sequelize.authenticate().then(() => {
      console.log('Connection established successfully.');
      connection = true
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
    })
  }
}

module.exports = { sequelize, connect }