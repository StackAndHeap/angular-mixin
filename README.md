angular-mixin
=============

Angular providers for defining traits as mixins for Angular objects.
Also implements some basic AOP style interception.

Attention: _This code is all pretty experimental/unoptimized and serves as a proof of concept right now.
So, don't use this in production, but ideas, comments and criticism are very welcome._

## Installation

AngularJS is the only dependency.

Add the angular-mixin dependency to your Angular module definition:

```javascript
var app = angular.module('myModule', ['angular-mixin']);
```

## Usage

Define a trait:
```javascript
app.config(['$angularTraitProvider', function($angularTrait){
    $angularTrait.register('myTrait', {
        mixinMessage: 'This is my mixed in message',
        someMethod:function() {
            alert(this.scope.myMessage);
        }
    });
}];
```

Mix the trait into one of your controllers:
```javascript
app.controller('myController', ['$scope', function($scope) {
    this.scope = $scope;
    this.scope.myMessage = "Hello there!";
    $scope.label = this.someText;
    $scope.onClick = this.someMethod.bind(this);
}])
.config(['$angularMixinProvider', function($angularMixin) {
    $angularMixin.register('myController', 'myTrait');
}]);
```

And the mixed in behaviour is now available in your view:
```html
<div data-ng-controller="myController">
  <button ng-click="onClick()">{{label}}</button>
</div>
```

Functional mixins are supported as well:
```javascript
app.config(['$angularTraitProvider', function($angularTrait){
    $angularTrait.register('functionalTrait', function() {
      this.alertMe = function() {
        alert('Hello again!');
      };
      return this;
    }
}]);
```

Services kan have mixins just the same:
```javascript
app.service('myService', [function() {
  //omitted implementation...
}])
.config(['$angularMixinProvider', function($angularMixin) {
    $angularMixin.register('myService', 'functionalTrait');
}]);
```

##Method interception

To intercept a method on a controller register your interceptor like this:
```javascript
app.controller('testController', ['$scope', function($scope) {
    this.scope = $scope;
    this.onClick = function($event, msg) {
        alert(msg);
    };
    this.scope.onClick = this.onClick.bind(this);
}]);

app.config(['$angularMixinProvider', function($angularMixinProvider){
    $angularMixinProvider.registerInterceptor('testController.onClick', function(instance, methodName, originalMethod, args) {
        args[1] = "Intercepted hello!";
    });
}]);
```
With HTML like this:
```html
<div data-ng-controller="testController">
  <button data-ng-click="onClick($event, 'Hello?')">Click me</button>
</div>
```
Now, after clicking the button the alert will show 'Intercepted hello!'.

The interceptor signature should look like this:
```javascript
function(instance, methodName, originalMethod, args);
```
Where:
* instance is the original object whose method is being intercepted
* methodName is the name of the intercepted method,
* originalMethod is the actual function reference to the intercepted method
* args is the arguments object that was passed to the original method.


##Future

* Implement interceptors for services
* Implement interceptors for factories
* Implement mixins for factories
