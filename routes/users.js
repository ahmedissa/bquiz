var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Game = mongoose.model('Game'),
  ObjectId = mongoose.Types.ObjectId;

  
exports.create = function(req, res){
  var newUser = new User(req.body);
  newUser.provider = 'local';

  newUser.save(function(err) {
    if (err) {
      return res.json(400, err);
    }

    req.logIn(newUser, function(err) {
      if (err) return next(err);
      return res.json(newUser.user_info);
    });
  });

};

exports.latestgames = function(req, res){
    var userId = req.params.userId;

    Game.latestgames(
      ObjectId(userId)
      ,function(err, games) {
        if (err) {
          return next(new Error('Failed to load Latest Games'));
        }
          return res.json(200, games);
        }

      );



};


exports.topusers = function(req, res){

  User.toptenplayers(function(err, users) {
    if (err) {
      return next(new Error('Failed to load Top Users'));
    }
    return res.json(200, users);

  });


};


exports.show = function(req, res){
	var userId = req.params.userId;

  User.findById(ObjectId(userId), function (err, user) {
    if (err) {
      return next(new Error('Failed to load User'));
    }
    if (user) {
      res.send({username: user.username, email: user.email, score: user.score });
    } else {
      res.send(404, 'USER_NOT_FOUND')
    }
  });
};