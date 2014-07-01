'use strict';
angular.module('bqApp')
  .controller('GameInfoCtrl', function ($scope,$location,$http,$rootScope,$routeParams,Game) {
    $scope.name = capitaliseFirstLetter($rootScope.currentUser.username);
    $scope.score = $rootScope.currentUser.score;
    $scope.plants = [];
    var game = undefined;
    Game.get(
      {id: $routeParams.gameId}, function(_game) {
          game = _game;
          $scope.points = game.score;
          $scope.date = moment(game.date).fromNow();
          $.each(game.plants, function( index, value ) {
            $http.get('/auth/plants/' + value ).success(function(plant) {
              plant.sparql = {};
              plant.sparql.data = [];
              plant.sparql.active = [];
              plant.sparql.clickable = false;
              $scope.plants.push (plant);
            });
          });
        }, function  (err) {
          $location.path('/account');
        }

      );

    $scope.getInformation = function  (plant) {
      if (!plant.sparql.clickable) {
          plant.sparql.clickable = true;
          $.each([plant.infos[0][1],capitaliseFirstLetter(plant.infos[2][1].toLowerCase()),plant.infos[3][1]], function( index, value ) {
                $http.get('/auth/sparql/' + value ).success(function(sp) {
                  plant.sparql.data.push([value,sp]); 
                  if(plant.sparql.active == ""){
                    plant.sparql.active[0] = 0;
                    plant.sparql.active[1] = sp;
                  }
                });
          });      


      };

    };

    $scope.changeContent = function  (info,plant,index) {

      plant.sparql.active[1] = info[1];
      plant.sparql.active[0] = index;


    }

    $scope.capitaliseFirstLetter = capitaliseFirstLetter;

  });


function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
