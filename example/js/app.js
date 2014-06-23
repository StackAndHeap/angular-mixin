var app = angular.module('demo', ['angular-mixin']);

app.trait('testtrait', {
    mixinMessage: 'This is my mixed in message',
    someMethod:function() {
        alert(this.myMessage);
    }
});

app.controller('testController', ['$scope', function($scope) {
    this.myMessage = "This is my own message";
    $scope.message = this.mixinMessage;
    $scope.onClick = this.someMethod.bind(this);
}]).mixin('testtrait');
