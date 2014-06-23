var app = angular.module('demo', ['angular-mixin']);

app.trait('testtrait', {
    mixinMessage: 'This is my mixed in message',
    someMethod:function() {
        alert(this.scope.myMessage);
    }
});

app.controller('testController', ['$scope', function($scope) {
    this.myMessage = "This is my own message";
    this.scope = $scope;
    this.scope.myMessage = this.myMessage;
    $scope.message = this.mixinMessage;
    $scope.onClick = this.someMethod.bind(this);
}]).mixin('testtrait');
