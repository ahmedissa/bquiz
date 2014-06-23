'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var GameSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: 'User' },
  plants: [Number],
  right: Number,
  score: Number,
  date: Date,
});


// basex get plants :)  
// get latest games


GameSchema.statics.latestgames = function (user,cb) {
	this.find({'player': user}).sort('-date').limit(5).select('date score right').exec(cb);
}



mongoose.model('Game', GameSchema);
