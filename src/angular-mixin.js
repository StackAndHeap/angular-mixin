/**
 * angular-mixin - Extending Angular to provide a mixin() method in an Angular module
 * @version v0.1.0
 * @link https://github.com/StackAndHeap/angular-mixin
 * @license MIT
 * @author [object Object]
 */
(function() {
    'use strict';
    var angularmixin = angular.module('angular-mixin', ['ng']);

    angularmixin.provider('$angularTrait', [function() {

        var traitRegistry = {};

        this.register = function (name, instance) {
            traitRegistry[name] = instance;
        };

        this.$get = [function() {
            return function(name) {
                return traitRegistry[name];
            };
        }];
    }]);

    angularmixin.provider('$angularMixin', ['$controllerProvider',
        function($controllerProvider) {
            var mixinRegistry = {};
            var ctorRegistry = {};
            var getFn = $controllerProvider.$get;
            $controllerProvider.$get = ['$injector', '$window', '$angularTrait', function($injector, $window, $angularTrait) {
                var instanceFn = getFn[2]($injector, $window);
                var intercept = function(expression, locals) {
                    if ((angular.isString(expression)) && (mixinRegistry[expression]) && (ctorRegistry[expression])) {
                        var ctor = ctorRegistry[expression];
                        mixinRegistry[expression].forEach(function(name) {
                            var trait = $angularTrait(name);
                            if (angular.isFunction(trait)) {
                                trait.call(ctor.prototype);
                            } else {
                                angular.extend(ctor.prototype, trait);
                            }
                        });
                        delete ctorRegistry[expression];
                    }
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

            this.register = function (sourceName, mixins) {
                mixinRegistry[sourceName] = mixins;
            };

            this.$get = [function() {
                return {};
            }];
        }
    ]);

    function trait(mod, name, ctor) {
        var invocation = [name, ctor];
        mod._invokeQueue.push(["$angularTraitProvider", "register", invocation]);
        return mod;
    }

    function mixin(mod, mixinNames) {
        var mixins;
        if (angular.isString(mixinNames)) {
            mixins = [mixinNames];
        } else if (angular.isArray(mixinNames)) {
            mixins = mixinNames;
        } else {
            return mod;
        }
        var prevInvoc = mod._invokeQueue[mod._invokeQueue.length - 1];
        if (prevInvoc[0] === "$controllerProvider") {
            var invocation = [prevInvoc[2][0], mixins];
            mod._invokeQueue.push(["$angularMixinProvider", "register", invocation]);
        }
        return mod;
    }

    var moduleFn = angular.module;
    angular.module = function (name, requires, configFn) {
        var mod = moduleFn(name, requires, configFn);
        mod.mixin = function(mixinNames){
            return mixin(mod, mixinNames);
        };
        mod.trait = function(name, ctor){
            return trait(mod, name, ctor);
        };
        return mod;
    };

})();