 var   basex = require('../Basex'),
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