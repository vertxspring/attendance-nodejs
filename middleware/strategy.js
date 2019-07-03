const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require('config');
const { userModel } = require('../models/user');

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.get('jwt-key');

const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  console.log('payload received', jwtPayload);
  const user = await userModel.findOne({ email: jwtPayload.email });
  if (user) {
    next(null, user);
  } else {
    next(null, 'false');
  }
});

passport.use(strategy);

module.exports.passport = passport;
module.exports.jwtOptions = jwtOptions;
