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

            function interceptInstantiate(injector, $angularTrait, interceptorReg) {
                var instantiateFn = injector.instantiate;
                instanceInjector.instantiate = function(Type, locals) {
                    var innerCtor = Type;
                    if (angular.isArray(innerCtor)) {
                        innerCtor = innerCtor[innerCtor.length-1];
                    }
                    if ((innerCtor.$$ngName) && (mixinRegistry[innerCtor.$$ngName])) {
                        extend(innerCtor, innerCtor.$$ngName, mixinRegistry, ctorRegistry, $angularTrait);
                    }
                    var instance = instantiateFn.call(injector, Type, locals);
                    if (innerCtor.$$ngName) {
                        interceptInstanceMethods(instance, innerCtor.$$ngName, interceptorReg);
                    }
                    return instance;
                };
            }

            function interceptCtorMethods(targetName, interceptorReg) {
                if (!angular.isString(targetName)) {
                    targetName = targetName.$$ngName;
                }
                if (targetName) {
                    if (interceptorReg[targetName]) {
                        methodInjectorInstance.injectCtorInterceptors(targetName, interceptorReg);
                    }
                }
            }

            function interceptInstanceMethods(instance, targetName, interceptorReg) {
                if (!angular.isString(targetName)) {
                    targetName = targetName.$$ngName;
                }
                if (targetName) {
                    if (interceptorReg[targetName]) {
                        methodInjectorInstance.injectInstanceMethods(instance, targetName, interceptorReg);
                    }
                }
            }

            $controllerProvider.$get = ['$injector', '$window', '$angularTrait', '$rootElement', function($injector, $window, $angularTrait, $rootElement) {
                var instanceFn = getFn[2]($injector, $window);
                var intercept = function(expression, locals) {
                    if (!instanceInjector) {
                        instanceInjector = $rootElement.data("$injector");
                        interceptInstantiate(instanceInjector, $angularTrait, interceptorRegistry);
                    }
                    if ((angular.isString(expression)) && (mixinRegistry[expression]) && (ctorRegistry[expression])) {
                        var ctor = ctorRegistry[expression];
                        extend(ctor, expression, mixinRegistry, ctorRegistry, $angularTrait);
                    }
                    var originalBind = Function.prototype.bind;
                    var instance;
                    try {
                        interceptCtorMethods(expression, interceptorRegistry);
                        instance = instanceFn.call($controllerProvider, expression, locals);
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
                innerCtor.$$ngName = name;
                ctorRegistry[name] = innerCtor;
                registerFn.call($controllerProvider, name, constructor);
            };

            var serviceFn = $provide.service;
            $provide.service = function(name, constructor) {
                var innerCtor = constructor;
                if (angular.isArray(innerCtor)) {
                    innerCtor = innerCtor[innerCtor.length-1];
                }
                innerCtor.$$ngName = name;
                return serviceFn.call($provide, name, constructor);
            };

            /*var factoryFn = $provide.factory;
            $provide.factory = function(name, constructor) {
                var innerCtor = constructor;
                if (angular.isArray(innerCtor)) {
                    innerCtor = innerCtor[innerCtor.length-1];
                }
                innerCtor.$$ngName = name;
                return factoryFn.call($provide, name, constructor);
            };*/

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

        this.injectCtorInterceptors = function(targetName, interceptorRegistry) {
            var originalBindMethod = Function.prototype.bind;
            Function.prototype.bind = function() {
                var _boundMethod = this;
                var methodOwner = arguments[0];
                var methodName = findMethodName(_boundMethod, methodOwner);
                var boundMethodOverride = _boundMethod;
                if (methodName) {
                    boundMethodOverride = function () {
                        var interceptorMethods = findInterceptorMethods(methodName, targetName, interceptorRegistry);
                        var methodOverride = function () {
                            for (var i = 0, ii = interceptorMethods.length; i < ii; i++) {
                                var args = [methodOwner, methodName, _boundMethod, arguments];
                                interceptorMethods[i].apply(methodOwner, args);
                            }
                            return _boundMethod.apply(methodOwner, arguments);
                        };
                        return methodOverride.apply(methodOwner, arguments);
                    };
                }
                return originalBindMethod.apply(boundMethodOverride, arguments);
            };
        };

        this.injectInstanceMethods = function(instance, targetName, interceptorReg) {
            var methodInterceptorInfo = interceptorReg[targetName];
            for(var fnName in methodInterceptorInfo) {
                if (instance.hasOwnProperty(fnName)) {
                    injectInstanceMethod(instance, fnName, methodInterceptorInfo[fnName]);
                }
            }
        };

        function injectInstanceMethod(instance, fnName, interceptors) {
            var originalFn = instance[fnName];
            instance[fnName] = function() {
                for (var i = 0, ii = interceptors.length; i < ii; i++) {
                    var args = [instance, fnName, originalFn, arguments];
                    interceptors[i].apply(instance, args);
                }
                return originalFn.apply(instance, arguments);
            };
        }

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