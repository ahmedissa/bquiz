'use strict';

angular.module('bqApp')
  .controller('SignupCtrl', function ($scope, Auth, $location) {
    $scope.register = function(form) {
      Auth.createUser({
          email: $scope.user.email,
          username: $scope.user.username,
          password: $scope.user.password
        },
        function(err) {
          $scope.errors = {};

          if (!err) {
            $location.path('/');
          } else {
            console.log(err);
          }
        }
      );
    };
  });