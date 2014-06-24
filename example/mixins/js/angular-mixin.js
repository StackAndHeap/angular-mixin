/**
 * angular-mixin - Angular providers for defining traits as mixins for Angular objects
 * @version v0.3.0
 * @link https://github.com/StackAndHeap/angular-mixin
 * @license MIT
 * @author Roland Zwaga <roland@stackandheap.com>
 */
(function() {
    'use strict';
    var angularmixin = angular.module('angular-mixin', ['ng']);
    var methodInjectorInstance;

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
            methodInjectorInstance = new MethodInjector();

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

            function interceptMethods(targetName, interceptorReg) {
                if (!angular.isString(targetName)) {
                    return;
                }
                if (interceptorReg[targetName]) {
                    methodInjectorInstance.injectInterceptors(targetName, interceptorReg);
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
                    var originalBind = Function.prototype.bind;
                    var instance;
                    try {
                        interceptMethods(expression, interceptorRegistry);
                        instance = instanceFn(expression, locals);
                    } finally {
                        Function.prototype.bind = originalBind;
                    }
                    return instance;
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
                var targetName = parts[0];
                var methodName = parts[1];
                if (!interceptorRegistry[targetName]) {
                    interceptorRegistry[targetName] = {};
                }
                if (!interceptorRegistry[targetName][methodName]) {
                    interceptorRegistry[targetName][methodName] = [];
                }
                interceptorRegistry[targetName][methodName].push(interceptor);
                return this;
            };

            this.$get = [function() {
                return {};
            }];
        }
    ]);

    var MethodInjector = function() {

        this.injectInterceptors = function(targetName, interceptorReg) {
            var ib = Function.prototype.bind;
            Function.prototype.bind = function() {
                var _this = this;
                var obj = arguments[0];
                var fnName = findMethodName(_this, obj);
                var intercept = _this;
                if (fnName) {
                    intercept = function () {
                        var interceptors = findInterceptorMethods(fnName, targetName, interceptorReg);
                        var fn = function () {
                            for (var i = 0, ii = interceptors.length; i < ii; i++) {
                                var args = [obj, fnName, _this, arguments];
                                interceptors[i].apply(obj, args);
                            }
                            return _this.apply(obj, arguments);
                        };
                        return fn.apply(obj, arguments);
                    };
                }
                return ib.apply(intercept, arguments);
            };
        };

        function findMethodName(fn, obj) {
            for(var name in obj) {
                if (obj[name] === fn) {
                    return name;
                }
            }
            return null;
        }

        function findInterceptorMethods(funcName, targetName, interceptorReg) {
            var methodInterceptorInfo = interceptorReg[targetName];
            if (!methodInterceptorInfo) {
                return null;
            } else {
                return methodInterceptorInfo[funcName];
            }
        }

    };
})();