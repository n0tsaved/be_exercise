var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const Users = require('../models/Users')
const auth = require('../auth/auth')
const jwt = require('jsonwebtoken')
const { secret } = require('../config/conf')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({message: 'users and reservations'});
});

router.post('/signup', async (req, res) => {
  try {
    const passwd = await bcrypt.hash(req.body.password, 10)
    const user = await Users.build({
      username: req.body.username,
      password: passwd,
      email: req.body.email
    })
    await user.save()
    return res.status(201).json({message: 'user created succesfully'})
  } catch (err) {
    console.error(err)
    res.status(500).json({error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }
    const body = { id: user.id, username: user.username, email: user.email }
    const token = jwt.sign({ user: body }, secret)
    body.token = token
    return res.status(200).json(body)
  } catch (err) {
    console.error(err)
    return res.status(500).json({error: err.message })
  }
})

module.exports = router;
