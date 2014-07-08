var   basex  = require("basex"),
      libxmljs = require("libxmljs"),
      _ = require("underscore");

var session = new basex.Session("localhost", 1984, "admin", "admin");
basex.debug_mode = false;

var input =  'declare namespace dwc ="http://rs.tdwg.org/dwc/terms"; '+
			 'declare namespace dc ="http://purl.org/dc/terms/"; '+
			 'let $x := db:open("bquiz")/plants '+
			 'for $i in random:seeded-integer(random:integer(500),40,100000) '+
			 'let $p := $x/plant[@id=$i] '+
			 'return <plant id="{$i}"> { $p/dc:title} {$p/dwc:associatedMedia} </plant>'


exports.get = function(id,cb) {
	var input =  
			 'let $x := db:open("bquiz")/plants '+
			 'return $x/plant[@id='+id+']'
	var query = session.query(input);
	query.results(
		function (err, reply) {

			var xmlDoc = libxmljs.parseXmlString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+reply.result.join(''));
			var _title = xmlDoc.get('/plant/dc:title[text()]',{dc: "http://purl.org/dc/terms/"});
			var _associatedMedia  = xmlDoc.get('/plant/dwc:associatedMedia[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"}).text();
			var _description  = xmlDoc.get('/plant/dc:description[text()]',{dc: "http://purl.org/dc/terms/"});
			var _family  = xmlDoc.get('/plant/dwc:Family[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"});
			var _genus  = xmlDoc.get('/plant/dwc:Genus[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"});
			var _specificEpithet  = xmlDoc.get('/plant/dwc:SpecificEpithet[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"});
			var _locality  = xmlDoc.get('/plant/dwc:Locality[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"});
			var _infos = [];
			if (_title){
				_infos.push(['ScientificName',_title.text()]);
			}
			if (_description){
				_infos.push(['Description',_description.text()]);

			}
			if (_family){
				_infos.push(['Family',_family.text()]);

			}
			if (_genus){
				_infos.push(['Genus',_genus.text()]);

			}
			if (_specificEpithet){ 
				_infos.push(['SpecificEpithet',_specificEpithet.text()]);

			}
			if (_locality){
				_infos.push(['Locality',_locality.text()]);
			}

			cb(false,{_id: id, associatedMedia:_associatedMedia,infos:_infos });

		}
	);


}

exports.qcreator = function(cb){
// create session
// create query instance
	var query = session.query(input);


	query.results(
		function (err, reply) {
			if (err) {
				console.log("Error: " + err);
			} else {
				var xmlDoc = libxmljs.parseXmlString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><source>"+reply.result.join('')+"</source>");
				//console.log(util.inspect();
				//console.log(util.inspect([0].text(), false, null));
				//console.log(util.inspect([0].text(), false, null));
				var ids   = xmlDoc.find('/source/plant/@id');
				var names = xmlDoc.find('/source/plant/dc:title[text()]',{dc: "http://purl.org/dc/terms/"});
				var imgs  = xmlDoc.find('/source/plant/dwc:associatedMedia[text()]',{dwc: "http://rs.tdwg.org/dwc/terms"});
				var res = [];
				for (var i = 0; i < 40; i++) {
					res.push({id: ids[i].value(), image: imgs[i].text(), name: names[i].text()});
				};

				var questions = []; 
				var ids = [];
				for (var i = 0; i < 10; i++) {
					questions.push({id: res[i].id, image: res[i].image, answers: _.shuffle([res[i].name,res[i+10].name,res[i+20].name,res[i+30].name]), solution: res[i].name});
					ids.push(res[i].id);
				};

				cb(ids,questions);


			}
		}

	);
}