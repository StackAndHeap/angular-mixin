var app = angular.module('demo', ['angular-mixin']);

var ctrl1 = function($scope, testService) {
    this.scope = $scope;
    this.onClick = function($event, msg) {
        alert(msg);
    };
    this.onChange = function() {
    }
    this.scope.onClick = this.onClick.bind(this);
    var _this = this;
    this.scope.onChange = function() {
        _this.onChange();
    };

    this.onChange(null);
}

app.controller('testController', ['$scope', 'testService', ctrl1]);

app.service('testService', [function() {
    //I don't do anything on my own...
}]);


app.config(['$angularMixinProvider', function($angularMixinProvider){
    $angularMixinProvider.registerInterceptor('testController.onClick', function(instance, methodName, originalMethod, args) {
        args[1] = "Intercepted hello!";
    })
    .registerInterceptor('testController.onChange', function(instance, methodName, originalMethod, args) {
        console.log('changed!');
    });
}]);