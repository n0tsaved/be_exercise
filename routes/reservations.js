const express = require('express');
const router = express.Router();
const Reservations = require('../models/Reservations')
const Users = require('../models/Users');
const CustomerReservation = require('../models/CustomerReservations');
const { Op, literal } = require("sequelize");
const { sequelize } = require('../db/connection')
const R = require('ramda')
const { overlappingQuery, checkDateBetween, getPagination } = require('../utils/reservationHelper');

/* GET all reservations. */
router.get('/', async (req, res) => {
  try {
    const { page, size, startDate, endDate } = req.query
    const { limit, offset } = getPagination(page, size)
    let whereClause = literal('1=1')
    if(startDate !== undefined && endDate !== undefined) {
      whereClause = literal(overlappingQuery(startDate,endDate)())
    }
    const reservations = await Reservations.findAll({
      include: {
        model: Users,
        required: true,
        as: 'customers',
        attributes: ['id', 'username', 'email'],
        through: {attributes: []}
      },
      where: whereClause,
      limit,
      offset
    })
    return res.status(200).json(reservations)
  } catch(err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
});

/* create a reservation. */
router.post('/', async (req, res) => {
  const t = await sequelize.transaction({ autocommit:false })
  try {
    const user = await Users.findByPk(req.user.id, {transaction: t})
    const startDate = new Date(req.body.startDate)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    if(startDate < Date.now()) {
      await t.rollback()
      return res.status(401).json({ error: 'date must not be in the past' })
    }
    if(!checkDateBetween(startDate) || !checkDateBetween(endDate)) {
      await t.rollback()
      return res.status(401).json({ error: 'booking time is between 19:00 and 24:00 and seating time is 1h' })
    }
    //find overlappng reservation
    const overlappingReservations = await Reservations.findAndCountAll({
      where: {
        table: req.body.table,
        [Op.and] : [ literal(overlappingQuery(startDate,endDate)()) ]
      }
    }, { transaction: t })

    if (overlappingReservations.count > 0) {
      await t.rollback()
      return res.status(401).json({ error: 'table already booked at this hour' })
    }
    let reservation = await Reservations.create({
      creator_id: user.id,
      table: req.body.table,
      startDate: startDate,
      endDate: endDate,
    }, { transaction: t })
    // check user has no booked tables in this hour
    const overlappingTables = await Users.findAndCountAll({
      include: {
        model: Reservations,
        required: true,
        as: 'reservations'
      },
      where: {
        id: user.id,
        [Op.and] : [ literal(overlappingQuery(startDate,endDate)())]
      },
    }, { transaction: t})
    if(overlappingTables.count > 0) {
      throw new Error('user already booked a table at this hour')
    }
    await user.addReservations(reservation, { transaction: t})
    await t.commit()
    return res.status(201).json(reservation)
  } catch (err) {
    await t.rollback()
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})


/* add customer to reservation */
router.post('/:id/customers', async (req, res) => {
  const t = await sequelize.transaction({ autocommit:false })
  try {
    const reservation = await Reservations.findByPk(req.params['id'], {transaction: t})
    if(!reservation) {
      await t.rollback()
      return res.status(400).json({ error: 'reservation not found' })
    }
    const user = await Users.findByPk(req.user.id, {transaction: t})
    if(user.id !== reservation.creator_id) {
      await t.rollback()
      return res.status(401).json({error: 'only reservation creator can add customers'})
    }

    const userToAdd = await Users.findByPk(req.body.userId, { transaction: t})
    if(!userToAdd) {
      await t.rollback()
      return res.status(400).json({ error: 'user not found' })
    }
    // check userToAdd has no booked tables in this hour
    const overlappingTables = await Users.findAndCountAll({
      include: {
        model: Reservations,
        required: true,
        as: 'reservations'
      },
      where: {
        id: userToAdd.id,
        [Op.and] : [ literal(overlappingQuery(reservation.startDate, reservation.endDate)()) ]
      }
    }, { transaction: t})

    if(overlappingTables.count > 0) {
      await t.rollback()
      return res.status(401).json({ error: 'user already booked a table at this hour' })
    }
    //count booked customers for this reservation
    const bookedUsers = await reservation.getCustomers({ transaction: t })
    if(bookedUsers.length > 3) {
      await t.rollback()
      return res.status(401).json({ error: 'this reservation is already full' })
    }
    await reservation.addCustomers(userToAdd, { transaction: t })
    await t.commit()
    const ret = await Reservations.findAll({
      include: {
        model: Users,
        required: true,
        as: 'customers',
        attributes: ['id', 'username', 'email'],
        through: {attributes: []}
      },
      where: {
        id: reservation.id
      }
    })
    return res.status(200).json(ret)
  } catch (err) {
    await t.rollback()
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router;
