/**
 * angular-mixin - Extending Angular to provide a mixin() method in an Angular module
 * @version v0.2.0
 * @link https://github.com/StackAndHeap/angular-mixin
 * @license MIT
 * @author Roland Zwaga <roland@stackandheap.com>
 */
(function() {
    'use strict';
    var angularmixin = angular.module('angular-mixin', ['ng']);

    angularmixin.provider('$angularTrait', [function() {

        var traitRegistry = {};

        this.register = function (name, instance) {
            traitRegistry[name] = instance;
            return this;
        };

        this.$get = [function() {
            return function(name) {
                return traitRegistry[name];
            };
        }];
    }]);

    angularmixin.provider('$angularMixin', ['$controllerProvider', '$provide',
        function($controllerProvider, $provide) {
            var mixinRegistry = {};
            var interceptorRegistry = {};
            var ctorRegistry = {};
            var getFn = $controllerProvider.$get;
            var instanceInjector;

            function extend(ctor, targetName, mixinReg, ctorReg, $angularTrait){
                mixinReg[targetName].forEach(function(name) {
                    var trait = $angularTrait(name);
                    if (angular.isFunction(trait)) {
                        trait.call(ctor.prototype);
                    } else {
                        angular.extend(ctor.prototype, trait);
                    }
                });
                delete ctorReg[targetName];
            }

            function interceptInstantiate(injector, $angularTrait) {
                var instantiateFn = injector.instantiate;
                instanceInjector.instantiate = function(Type, locals) {
                    var innerCtor = Type;
                    if (angular.isArray(innerCtor)) {
                        innerCtor = innerCtor[innerCtor.length-1];
                    }
                    if ((innerCtor.$$ngName) && (mixinRegistry[innerCtor.$$ngName])) {
                        extend(innerCtor, innerCtor.$$ngName, mixinRegistry, ctorRegistry, $angularTrait);
                    }
                    return instantiateFn(Type, locals);
                };
            }

            function interceptMethod(targetName, interceptorReg, ctorReg) {
                if (!angular.isString(targetName)) {
                    return;
                }
            }

            $controllerProvider.$get = ['$injector', '$window', '$angularTrait', '$rootElement', function($injector, $window, $angularTrait, $rootElement) {
                var instanceFn = getFn[2]($injector, $window);
                var intercept = function(expression, locals) {
                    if (!instanceInjector) {
                        instanceInjector = $rootElement.data("$injector");
                        interceptInstantiate(instanceInjector, $angularTrait);
                    }
                    if ((angular.isString(expression)) && (mixinRegistry[expression]) && (ctorRegistry[expression])) {
                        var ctor = ctorRegistry[expression];
                        extend(ctor, expression, mixinRegistry, ctorRegistry, $angularTrait);
                    }
                    interceptMethod(expression, interceptorRegistry, ctorRegistry);
                    return instanceFn(expression, locals);
                };
                return intercept;
            }];

            var registerFn = $controllerProvider.register;
            $controllerProvider.register = function(name, constructor) {
                var innerCtor = constructor;
                if (angular.isArray(innerCtor)) {
                    innerCtor = innerCtor[innerCtor.length-1];
                }
                ctorRegistry[name] = innerCtor;
                registerFn(name, constructor);
            };

            var serviceFn = $provide.service;
            $provide.service = function(name, constructor) {
                var innerCtor = constructor;
                if (angular.isArray(innerCtor)) {
                    innerCtor = innerCtor[innerCtor.length-1];
                }
                innerCtor.$$ngName = name;
                return serviceFn(name, constructor);
            };

            this.register = function (sourceName, mixins) {
                if (angular.isString(mixins)) {
                    mixins = [mixins];
                }
                mixinRegistry[sourceName] = mixins;
                return this;
            };

            this.registerInterceptor = function (pointcut, interceptor) {
                var parts = pointcut.split('.');
                interceptorRegistry[parts[0]] = [parts[1], interceptor];
                return this;
            };

            this.$get = [function() {
                return {};
            }];
        }
    ]);
})();