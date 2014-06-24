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
              $scope.plants.push (plant);
            });
          });
        }, function  (err) {
          $location.path('/account');
        }

      );


    $scope.capitaliseFirstLetter = capitaliseFirstLetter;

  });

