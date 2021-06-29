const express = require('express');
const router = express.Router();
const Users = require('../models/Users')


/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'username', 'email']
    })
    return res.status(200).json(users)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
});


module.exports = router;
