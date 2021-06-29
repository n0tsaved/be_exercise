const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const Users = require('../models/Users')
const jwtStrategy = require('passport-jwt').Strategy
const extractJWT = require('passport-jwt').ExtractJwt
const { secret } = require('../config/conf')


passport.use(
  new jwtStrategy({ 
    secretOrKey: secret, 
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken() 
  },
  async (token, done) => {
    try {
      return done(null, token.user)
    } catch (error) {
      done(error)
    }
  })
)

module.exports = passport.authenticate('jwt', { session: false })