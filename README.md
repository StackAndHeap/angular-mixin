angular-mixin
=============

Angular providers for defining traits as mixins for Angular objects.

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

##Future

* Implement mixins for factories
* Investigate whether AOP-like behavior can be implemented
