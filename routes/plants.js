 var mongoose = require('mongoose'),
  	 Report = mongoose.model('Report'),
     basex = require('../Basex'),
 	   _ = require('underscore');


exports.show = function(req, res){
    var plantId = req.params.plantId;
    basex.get(plantId,
		function(err, plant) {
		        if (err) {
		          return next(new Error('Failed to load  PLants'));
		        }else{
		          return res.json(200, plant);
		        }
		 }
	);
};


exports.report = function(req, res){
    var plantId = req.params.plantId;
    if (plantId) {
		Report.find({ plant: plantId }, function(err, p) {
		  if (!p || p.length == 0){
		  	var report = new Report();
	        report.plant = plantId;
	        report.count = 1;
	        report.save(function(err) {
	            if (err) {
	              res.json(200, {error: true});
	              console.log(err);
	            }
	            res.json(200, {error: false});
	        });
		  }else {
		    // do your updates here

		  	var report = new Report(p[0]);
		    report.update({$inc: {count:1}},null, 
		    	function(err) {
		            if (err) {
		              res.json(200, {error: true});
		              console.log(err);
		            }
		            	res.json(200, {error: false});
			    	}
		    	);
		  }
		});


    };
};

exports.allreports = function(req, res){

		Report.find({}, function(err, p) {
	        if (err) {
	              res.json(200, {error: true});
	              console.log(err);
	        }
	        res.json(200, p);
		});


};