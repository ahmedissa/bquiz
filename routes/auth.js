var passport = require('passport');

exports.login = function(req, res, next){
 	passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json(404, 'No user found...');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json(200, user.user_info);
    });
  })(req, res, next);
};


exports.logout = function(req, res){
  if(req.user) {
    console.log("logout");
    req.logout();
    res.send(200);
  } else {
    res.send(400, "Not logged in");
  }
};

exports.session = function(req, res){
  res.json(req.user);
};