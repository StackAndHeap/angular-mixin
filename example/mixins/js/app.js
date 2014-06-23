var app = angular.module('demo', ['angular-mixin']);

app.trait('testtrait', {
    mixinMessage: 'This is my mixed in message',
    someMethod:function() {
        alert(this.scope.myMessage);
    }
})
.trait('functiontrait', function() {
    this.alertMe = function() {
        alert(this.scope.anotherMessage);
    };
    return this;
})
.trait('servicetrait', function() {
    this.alertMe = function() {
        alert("its my service message");
    };
    return this;
});

app.controller('testController', ['$scope', function($scope) {
    this.myMessage = "This is my own message";
    this.scope = $scope;
    this.scope.myMessage = this.myMessage;
    $scope.message = this.mixinMessage;
    $scope.onClick = this.someMethod.bind(this);
}]).mixin('testtrait');

app.controller('testController2', ['$scope', 'testService', function($scope, testService) {
    this.scope = $scope;
    this.scope.anotherMessage = "This is another of my own messages";
    this.scope.label = "Label is mine";
    this.scope.onClick = this.alertMe.bind(this);
    testService.alertMe();
}]).mixin('functiontrait');

app.service('testService', [function() {

}]).mixin('servicetrait');