"use strict";
/**
 * Created by user on 2018/2/10/010.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bluebirdDecorator2 = exports.bluebirdDecorator = exports.PromiseBluebird = void 0;
const decorator_utils_1 = require("decorator-utils");
const Bluebird = require("bluebird");
const PromiseBluebird = require("bluebird");
exports.PromiseBluebird = PromiseBluebird;
exports.bluebirdDecorator = decorator_utils_1.DecoratorUtils.createDecorator([
    decorator_utils_1.DecoratorUtils.declarationTypes.CLASS_METHOD,
    decorator_utils_1.DecoratorUtils.declarationTypes.CLASS_ACCESSOR,
    decorator_utils_1.DecoratorUtils.declarationTypes.OBJECT_LITERAL_METHOD,
    decorator_utils_1.DecoratorUtils.declarationTypes.OBJECT_LITERAL_ACCESSOR
], (target, propertyKey, descriptor) => {
    let method = descriptor.value;
    descriptor.value = function (...args) {
        let self = this;
        //return returnValue instanceof Promise ? Bluebird.resolve(returnValue) : returnValue;
        return Bluebird.resolve().then(function () {
            return method.apply(self, args);
        });
    };
    return descriptor;
});
function bluebirdDecorator2(target, propertyKey, descriptor) {
    /*
    if (descriptor === undefined)
    {
        descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }
    */
    descriptor.value = PromiseBluebird.method(descriptor.value);
    return descriptor;
}
exports.bluebirdDecorator2 = bluebirdDecorator2;
exports.default = bluebirdDecorator2;
//# sourceMappingURL=bluebird.js.map