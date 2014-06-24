'use strict';

angular.module('bqApp')
  .controller('LoginCtrl', function ($rootScope,$scope, Auth, $location) {
    if ($rootScope.currentUser) {
        console.log($rootScope.currentUser);
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
            $scope.error = {"display": "none"};
            $scope.errormsg = "";
            $location.path('/account');
          } else {
            $scope.error = {"display": "block"};
            $scope.errormsg = err;
          }
      });
    };
  });