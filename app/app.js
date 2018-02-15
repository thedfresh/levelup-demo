'use strict';

// Declare app level module which depends on views, and components
angular.module('levelUp', [
    'ngRoute',
    'levelUp.locator'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');

    $routeProvider.otherwise({ redirectTo: '/locator' });
}]);