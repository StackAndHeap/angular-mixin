var app = angular.module('demo', ['angular-mixin']);

app.controller('testController', ['$scope', function($scope) {
    this.scope = $scope;
    this.onClick = function($event, msg) {
        alert(msg);
    };
    this.onChange = function($event) {
        var s = $event;
    }
    this.scope.onClick = this.onClick.bind(this);
    this.scope.onChange = this.onChange.bind(this);

    this.onChange(null);
}]);

app.config(['$angularMixinProvider', function($angularMixinProvider){
    $angularMixinProvider.registerInterceptor('testController.onClick', function(instance, methodName, originalMethod, args) {
        args[1] = "Intercepted hello!";
    })
    .registerInterceptor('testController.onChange', function(instance, methodName, originalMethod, args) {
        console.log('changed!');
    });
}]);