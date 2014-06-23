var mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  ObjectId = mongoose.Types.ObjectId;



exports.show = function(req, res){
  if(req.user) {
	var gameId = req.params.gameId;
	
	Game.findById(ObjectId(gameId), function (err, game) {
	    if (err) {
	      return next(new Error('Failed to load User'));
	    }
	    if (game) {
	      res.send(200,{plants: game.plants, date: game.date, score: game.score });
	    } else {
	      res.send(404, 'USER_NOT_FOUND')
	    }
	 });

  } else {
    res.send(400, "Not logged in");
  }
};
