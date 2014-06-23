var  _ = require('underscore'),
    redis = require("redis"),
    client = redis.createClient(),
    pub = redis.createClient(),
    storge = redis.createClient();
    mongoose = require('mongoose'),
    basex = require('../Basex'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User');
    






var ClientsToGame = {};
var Questions = [
			{id: 1,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/18/47/B_-W_18472%20-01%200.jpg", answers: ["2","4","41","6"], solution: 0 },
			{id: 2,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/19/91/B_-W_19916%20-01%200.jpg", answers: ["2","4","5","13"], solution: 1 },
			{id: 3,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/19/63/B_-W_19635%20-00%200.jpg", answers: ["4","4","5","6"], solution: 2 },
			{id: 4,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/19/93/B_-W_19932%20-01%200.jpg", answers: ["2","4","5","6"], solution: 1 },
			{id: 5,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/20/21/B_-W_20217%20-01%200.jpg", answers: ["1","3","5","4"], solution: 3 },
			{id: 6,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/17/55/B_-W_17555%20-01%200.jpg", answers: ["2","4","5","6"], solution: 3 },
			{id: 7,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/18/06/B_-W_18061%20-00%200.jpg", answers: ["2","4","5","6"], solution: 2 },
			{id: 8,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/17/75/B_-W_17755%20-05%200.jpg", answers: ["2","s","5","6"], solution: 2 },
			{id: 9,  image: "http://ww2.bgbm.org/herbarium/images/B/-W/18/11/B_-W_18115%20-01%200.jpg", answers: ["12","4","5","6"], solution: 1 },
			{id: 10, image: "http://ww2.bgbm.org/herbarium/images/B/-W/19/38/B_-W_19387%20-01%200.jpg", answers: ["2","4","5","6"], solution: 0 }];




storge.keys('user:*', function (err, keys) {
  if (err) return console.log(err);

  for(var i = 0, len = keys.length; i < len; i++) {

    storge.hget(keys[i], 'game', function (err, obj) {
      if (err) throw(err);
      if (obj != null) {
          _game = JSON.parse(obj);
          ClientsToGame[_game.username] = _game;
      };


    });
  };
});


client.on("subscribe", function (channel, count) {
    
 });



client.on("message", function (channel, message) {
      console.log("redis message json");
      var _message = JSON.parse(message);
      if (_message.type === 'set') {
        console.log("redis message set");

        storge.HSET("user:"+_message.data.username,'game', JSON.stringify(_message.data));

      } else{
        console.log("redis message save game");
        var game = new Game();
        console.log(_message.data.date);

        game.player = _message.user._id;
        game.plants = _message.data.plants;
        game.right  = _message.data.righta;
        game.date   = Date.parse(_message.data.date);
        game.score  =  _message.data.righta;
        game.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("a game has been saved");
            }
        });
        User.addScore(_message.user._id,_message.data.righta);
        storge.DEL("user:"+_message.data.username)
      };

});

 client.subscribe("save");


// save game first in mogogdb 
// change the data after the finisch ? 
// send data it then to user. 

module.exports = function (socket) {
  var username = socket.client.request.user.username;

  if (ClientsToGame[username] == undefined) {

      socket.emit('game:status',"new game");
  }else{
      socket.emit('game:status',"game resume");
  }



  socket.on('game:new', function(msg){
  	var uname = socket.client.request.user.username;

  	if (ClientsToGame[uname] == undefined) {
      basex.qcreator(function  (ids,qs) {
        ClientsToGame[uname] = {date: (new Date()).toString(), username:uname, righta: 0, plants: ids, questions: qs, playeranswers: [false,false,false,false,false,false,false,false,false,false], postion: 0};
        socket.emit('game:new',ClientsToGame[uname]);

        pub.publish('save',JSON.stringify({type: 'set', data: ClientsToGame[uname]}));
        console.log("new game");


      });
  	}else{
            console.log("resume game");

      socket.emit('game:new',ClientsToGame[uname]);

    }

  });


  socket.on('game:answer', function(msg,func){
    console.log("game:answer data");
    if (msg <0 || msg < 4) { return;};
        console.log("game:answer " + msg); 

  	var username = socket.client.request.user.username;
  	var game = ClientsToGame[username];
  	if (game != undefined) {
      console.log("game:answer " + game.questions[game.postion].solution)
      if (msg == game.questions[game.postion].solution) {
        console.log("game:answer true"); 
        game.righta =  game.righta +1;
        game.playeranswers[game.postion] = true;
      };

      // redis update
      pub.publish('save', JSON.stringify({type: 'set', data: game}));

      if (game.postion != 9 ) {

        game.postion = game.postion + 1;

        func(game);

      }else{

        pub.publish('save', JSON.stringify({type: 'remove', data: game, user:socket.client.request.user }));

        // remove redis -> save data mongodb -> send to user all data
        ClientsToGame[username] = undefined;

        //Send to client ? 
        func("finish");
        
      };
      



      
  	};
  });

  socket.on('game:end',function(msg){
    //save and remove data redis -> mongodb
  	var username = socket.client.request.user.username;
     pub.publish('remove', JSON.stringify({type: 'remove', data: ClientsToGame[username], user:socket.client.request.user }));

  	 ClientsToGame[username] = undefined;

  });


  setInterval(function () {
    socket.emit('send:time', {
      time: (new Date()).toString()
    });
  }, 1000);


  socket.on('disconnect',function(msg){

  });

};
