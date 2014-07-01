
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , path = require('path')
  , fs = require('fs')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , errorHandler = require('express-error-handler')
  , http = require('http')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , methodOverride = require('method-override')
  , passport = require('passport')
  , passportSocketIo = require("passport.socketio")
  , LocalStrategy = require('passport-local').Strategy;

var app = module.exports = express();
var server = http.createServer(app);
var io = require('socket.io')(server);


// Connect to Database
var mongoOptions = { db: { safe: true } };

db = mongoose.connect('mongodb://localhost/bq', mongoOptions, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' +  'mongodb://localhost/bq'+ '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + 'mongodb://localhost/bq');
  }
});


// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});



app.disable('etag');
// cookieParser should be above session
app.use(cookieParser());

// bodyParser should be above methodOverride
app.use(bodyParser());
app.use(methodOverride());


// express session storage
sessionStore = new session.MemoryStore();
var redisStore = new RedisStore();
app.use(session({
  name: 'connect.sid',
  secret: 'u3i59jldsgj9023458',
  store: redisStore,
  
}));

// Use local strategy
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          'errors': {
            'email': { type: 'Email is not registered.' }
          }
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          'errors': {
            'password': { type: 'Password is incorrect.' }
          }
        });
      }
      return done(null, user);
    });
  }
));


// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });

});

// Configuration
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

if ('production' == env) {
  app.use(errorHandler());
}



// use passport session
app.use(passport.initialize());
app.use(passport.session());

// Socket.io passport
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,

  key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      'u3i59jldsgj9023458',    // the session_secret to parse the cookie
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
  store: redisStore
}));

function onAuthorizeSuccess(data, accept){

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);

  // We use this callback to log all of our failed connections.
  accept(null, false);
}

io.on('connection',  require('./routes/socket') );

// Routes

// User Routes
var users = require('./routes/users');
  app.post('/auth/users', users.create);
  app.get('/auth/users/:userId', users.show);
  app.get('/auth/users/:userId/games', users.latestgames);
  app.get('/auth/users/:userId/topusers', users.topusers);


var games = require('./routes/game');
  app.get('/auth/games/:gameId', games.show);

var plants = require('./routes/plants');
  app.get('/auth/plants/:plantId', plants.show);

var sparql = require('./routes/sparql');
  app.get('/auth/sparql/:plant', sparql.show);


var session = require('./routes/auth');

app.get('/auth/session', 
   function ensureAuthenticated(req, res, next) {
      console.log(req.user);
      if (req.isAuthenticated()) { return next(); }
      res.send(401);
    }
  , session.session);
app.post('/auth/session', session.login);
app.delete('/auth/session', session.logout);

var routes = require('./routes/index');

 app.get('/partials/*', function(req, res) {
   // var requestedView = path.join('./', req.url);
    res.render(req.url.substr(1));
  });
   app.get('/*', function(req, res) {

    if(req.user) {
      res.cookie('user', JSON.stringify(req.user));
    }

    res.render('index.html');
  });



//app.get('/', routes.index);

server.listen(3550, function(){
  console.log("Express server listening ");
});



