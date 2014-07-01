var SparqlClient = require('sparql-client');
var endpoint = 'http://dbpedia.org/sparql';

// Get the leaderName(s) of the given citys
// if you do not bind any city, it returns 10 random leaderNames

// http://dbpedia.org/property/genus

// http://dbpedia.org/property/familia         
var client = new SparqlClient(endpoint);


var createQuery = function  (name) {

	return "SELECT ?z WHERE {" + 
       "?e rdf:type <http://dbpedia.org/ontology/Plant>; " + 
       "rdfs:label ?x;" +
       "dbpedia-owl:abstract ?z."+
       'FILTER regex(?x, "'+name+'$")'+  
       'FILTER langMatches( lang(?z),"de") ' +
	"} LIMIT 10";


}

exports.show = function(req, res){

    var plant = req.params.plant;
    if (plant) {
		client.query(createQuery(plant))
		  .execute(function(error, results) {
			  	if (error) {
		          	res.send(404, 'service not available')
		        }else if (results.results.bindings[0] && results.results.bindings[0].z) {

		          	res.json(200, results.results.bindings[0].z.value);
		        }else{
		          	res.send(200, 'no results');
		        }

		});

    };




};


