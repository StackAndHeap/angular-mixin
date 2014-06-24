var app = angular.module('demo', ['angular-mixin']);

app.controller('testController', ['$scope', function($scope) {
    this.myMessage = "This is my own message";
    this.scope = $scope;
    this.scope.myMessage = this.myMessage;
    $scope.message = this.mixinMessage;
    $scope.onClick = this.someMethod.bind(this);
}]);

app.controller('testController2', ['$scope', 'testService', function($scope, testService) {
    this.scope = $scope;
    this.scope.anotherMessage = "This is another of my own messages";
    this.scope.label = "Label is mine";
    this.scope.onClick = this.alertMe.bind(this);
    testService.alertMe();
}]);

app.service('testService', ['$controller', function($controller) {
    //I don't do anything on my own...
}]);

app.config(['$angularTraitProvider', '$angularMixinProvider', function($angularTrait, $angularMixin){
    $angularTrait.register('testtrait', {
        mixinMessage: 'This is my mixed in message',
        someMethod:function() {
            alert(this.scope.myMessage);
        }
    })
    .register('functiontrait', function() {
            this.alertMe = function() {
                alert(this.scope.anotherMessage);
            };
            return this;
    })
    .register('servicetrait', function() {
            this.alertMe = function() {
                alert("This is a message from my service trait");
            }
            return this;
    });

    $angularMixin.register('testController', 'testtrait')
                 .register('testController2', 'functiontrait')
                 .register('testService', 'servicetrait');
}]);