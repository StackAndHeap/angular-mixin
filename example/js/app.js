/**
 * Created by Roland on 6/23/2014.
 */
var app = angular.module('demo', ['angular-mixin']);

app.trait('testtrait', {
    mixinMessage: 'This is my mixed in message'
});

app.controller('testController', ['$scope', function($scope) {
    $scope.message = this.mixinMessage;
}]).mixin('testtrait');
