var app = angular.module('demo', ['angular-mixin']);

app.controller('testController', ['$scope', function($scope) {
    this.scope = $scope;
    this.click = function($event, msg) {
        this.onClick($event, msg);
    }
    this.onClick = function($event, msg) {
        msg = msg || 'Hello?';
        alert(msg);
    };
    this.scope.onClick = this.click.bind(this);
}]);

/*var myObject = function(){
    this.c = 1;
    this.doSomething = function(a, b) {
    return a + b + this.c;
    }
    this.scope = {};
    this.scope.fire = this.doSomething.bind(this);
    return this;
    };

var ib = Function.prototype.bind;
Function.prototype.bind = function() {
    var _this = this;
    var obj = arguments[0];
    var intercept = function() {
    arguments[1] = arguments[1]+1;
    return _this.apply(obj, arguments);
    }
    return ib.apply(intercept, arguments);
    }
var instance = new myObject();
Function.prototype.bind = ib;
console.log("instance.scope.fire:" + instance.scope.fire(1,2));
*/