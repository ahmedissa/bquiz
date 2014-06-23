'use strict';
angular.module('bqApp', [  
	'ngCookies',
 	'ngResource',
  'btford.socket-io',
  'http-auth-interceptor',
 	'ngRoute'])
.factory('Socket', function (socketFactory) {
  return socketFactory({
    ioSocket: io.connect('http://localhost:3000')
  });
})
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/account', {
        templateUrl: 'partials/account.html',
        controller: 'AccountCtrl'
      })
      .when('/game', {
        templateUrl: 'partials/game.html',
        controller: 'GameCtrl'
      })
      .when('/game/:gameId', {
        templateUrl: '/partials/gameinfo.html',
        controller: 'GameInfoCtrl'
      })      
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);

})

.run(function ($rootScope, $location, Auth) {

    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });

    // On catching 401 errors, redirect to the login page.
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
      return false;
    });
  });


