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
      alert(this.scope.myMessage);
    }
});
```

Mix the trait into one of your controllers:
```javascript
app.controller('myController', ['$scope', function($scope) {
    this.scope = $scope;
    this.scope.myMessage = "Hello there!";
    $scope.label = this.someText;
    $scope.onClick = this.someMethod.bind(this);
}])
.mixin('myTrait');
```

And the mixed in behaviour is now available in your view:
```html
<div data-ng-controller="myController">
  <button ng-click="onClick()">{{label}}</button>
</div>
```

Functional mixins are supported as well:
```javascript
app.trait('functionaltrait', function() {
    this.alertMe = function() {
        alert('Hello again!');
    };
    return this;
});
```

Services kan have mixins just the same:
```javascript
app.controller('myService', [function() {
  //omitted implementation...
}])
.mixin('myServiceTrait');
```

##Future

* Implement mixins for factories
* Investigate whether AOP-like behavior can be implemented
