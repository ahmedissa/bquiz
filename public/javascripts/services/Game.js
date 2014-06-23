
'use strict';

angular.module('bqApp')
  .factory('Game', function ($resource) {
    return $resource('/auth/games/:id/', {},
      {
        'update': {
          method:'PUT'
        }
      });
  });