'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto');

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: String,
  salt: String,
  name: String,
  score:{ 
  	type: Number,
    default: 0,
  },
  admin: Boolean,
  guest: Boolean,
  provider: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

UserSchema
  .virtual('user_info')
  .get(function () {
    return { '_id': this._id, 'username': this.username, 'admin': this.admin, 'email': this.email, 'score' : this.score};
  });

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length;
};

UserSchema.path('email').validate(function (email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
}, 'The specified email is invalid.')

UserSchema.path('email').validate(function(value, respond) {
  mongoose.models["User"].findOne({email: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'The specified email address is already in use.');

UserSchema.path('username').validate(function(value, respond) {
  mongoose.models["User"].findOne({username: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'The specified username is already in use.');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  }
  else {
    next();
  }
});

UserSchema.statics.toptenplayers = function (cb) {
	this.find().sort('-score').limit(5).select('username score').exec(cb);
};

UserSchema.statics.addScore = function (playerId, scorev){
  var conditions = { _id: playerId }
    , update = { $inc: { score: scorev}}
    , options = {  };

  this.update(conditions, update, options, 

  function callback (err, numAffected) {
      if (err) console.log(err);
  });
/*
  this.findById(playerId, function(err, p) {
    if (!p)
      return next(new Error('Could not load Document'));
    else {
      // do your updates here
      var temp = p.score;
      p.score = temp  + parseInt(scorev);
      console.log(p.score);
      console.log(parseInt(scorev));


      p.save(function(err) {
        if (err)
          console.log(err)
        else
          console.log('success')
      });
    }
  });
*/
}


/**
 * Methods
 */

UserSchema.methods = {

  // get top players



  /**
   * Authenticate - check if the passwords are the same
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   */

  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   */

  encryptPassword: function(password) {
    if (!password) {
      return '';
    }
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  }
};

mongoose.model('User', UserSchema);