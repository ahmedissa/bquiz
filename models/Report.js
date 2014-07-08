'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ReportSchema = new Schema({
  plant: {
  	type: Number,
  	required: true
  },
  count: {
	type: Number
  }
});


// basex get plants :)  
// get latest games





mongoose.model('Report', ReportSchema);
