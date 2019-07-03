const passport = require('passport');

function checkRoleWithPassport(adminRequired) {
  return (req, res, next) => {
    console.log('3');
    passport.authenticate('jwt', { session: false }, (err, user) => {
      req.user = user;
      console.log('6');
      if (err) res.status(403).send('forbidden');
      else if (!user) res.status(403).send('forbidden');
      else if (!adminRequired) next();
      else if (user.isAdmin) next();
      else res.status(403).send('forbidden');
    })(req, res, next);
  };
}

module.exports = checkRoleWithPassport;
