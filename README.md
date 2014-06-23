angular-mixin
=============

Extending Angular to provide a mixin() method in an Angular module.

## Installation

AngularJS is the only dependency.

Add the angular-mixin dependency to your Angular module definition:

```javascript
var app = angular.module('myModule', ['angular-mixin']);
```

## Usage

Define a trait:
```javascript
app.trait('myTrait', {
    someText: 'This is some text',
    someMethod: function() {
      alert('Hello there!');
    }
});
```

Mix the trait into one of your controllers:
```javascript
app.controller('myController', ['$scope', function($scope) {
    $scope.label = this.someText;
    $scope.onClick = this.someMethod;
}])
.mixin('myTrait');
```

And the mixed in behaviour is now available in your view:
```html
<div data-ng-controller="myController">
  <button ng-click="onClick()">{{label}}</button>
</div>
```

##Future

* Implement mixins for services
* Implement mixins for factories
* Investigate whether AOP-like behavior can be implemented
