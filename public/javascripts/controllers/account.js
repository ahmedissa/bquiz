'use strict';

angular.module('bqApp')
  .controller('AccountCtrl', function ($scope,$location,$http,$rootScope,User,Socket,Auth) {
    $scope.name = capitaliseFirstLetter($rootScope.currentUser.username);
    $scope.score = $rootScope.currentUser.score;
    User.get(
      {id: $rootScope.currentUser._id}, function(user) {
          $scope.score = user.score;
        }
      );

  	Socket.on('send:time', function (data) {
    	$scope.time = data;
  	});

    Socket.on('game:status', function (data) {
      $scope.game = data;
    });

    $http.get('/auth/users/' + $rootScope.currentUser._id + '/games').success(function(games) {
          $scope.lgames = games;
    });

    $http.get('/auth/users/' + $rootScope.currentUser._id + '/topusers').success(function(users) {
          $scope.tusers= users;
    });

  	$scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');

        }
      });
    };
    $scope.convertdate = function (argument) {
      return moment(argument).fromNow();
    };

    $scope.capitaliseFirstLetter = capitaliseFirstLetter;

  });

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}