'use strict';

angular.module('bqApp')
  .controller('LoginCtrl', function ($rootScope,$scope, Auth, $location) {
    if ($rootScope.currentUser) {
       $location.path('/account');
    };
    $scope.error = {};
    $scope.user = {};

    $scope.login = function(form) {
      Auth.login('password', {
          'email': $scope.user.email,
          'password': $scope.user.password
        },
        function(err) {
          $scope.errors = {};
          if (!err) {
            $location.path('/account');
          } else {
            console.log(err);

          }
      });
    };
  });