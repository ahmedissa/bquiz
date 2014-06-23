'use strict';

angular.module('bqApp')
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });