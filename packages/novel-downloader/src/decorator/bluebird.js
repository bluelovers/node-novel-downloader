"use strict";
/**
 * Created by user on 2018/2/10/010.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZWJpcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJibHVlYmlyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscURBQWlEO0FBQ2pELHFDQUFxQztBQUNyQyw0Q0FBNEM7QUFFbkMsMENBQWU7QUFFWCxRQUFBLGlCQUFpQixHQUFHLGdDQUFjLENBQUMsZUFBZSxDQUFDO0lBQy9ELGdDQUFjLENBQUMsZ0JBQWdCLENBQUMsWUFBWTtJQUM1QyxnQ0FBYyxDQUFDLGdCQUFnQixDQUFDLGNBQWM7SUFDOUMsZ0NBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUI7SUFDckQsZ0NBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUI7Q0FDdkQsRUFBRSxDQUFJLE1BQWMsRUFBRSxXQUE0QixFQUFFLFVBQTZELEVBQUUsRUFBRTtJQUVySCxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBRTlCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUk7UUFFbkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLHNGQUFzRjtRQUN0RixPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFFOUIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUMsQ0FBb0IsQ0FBQztBQUV0QixTQUFnQixrQkFBa0IsQ0FBSSxNQUFXLEVBQUUsV0FBbUIsRUFBRSxVQUE4QjtJQUVyRzs7Ozs7TUFLRTtJQUNGLFVBQVUsQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFL0QsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQztBQVhELGdEQVdDO0FBRUQsa0JBQWUsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTAvMDEwLlxuICovXG5cbmltcG9ydCB7IERlY29yYXRvclV0aWxzIH0gZnJvbSBcImRlY29yYXRvci11dGlsc1wiO1xuaW1wb3J0ICogYXMgQmx1ZWJpcmQgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQgKiBhcyBQcm9taXNlQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuXG5leHBvcnQgeyBQcm9taXNlQmx1ZWJpcmQgfVxuXG5leHBvcnQgY29uc3QgYmx1ZWJpcmREZWNvcmF0b3IgPSBEZWNvcmF0b3JVdGlscy5jcmVhdGVEZWNvcmF0b3IoW1xuXHREZWNvcmF0b3JVdGlscy5kZWNsYXJhdGlvblR5cGVzLkNMQVNTX01FVEhPRCxcblx0RGVjb3JhdG9yVXRpbHMuZGVjbGFyYXRpb25UeXBlcy5DTEFTU19BQ0NFU1NPUixcblx0RGVjb3JhdG9yVXRpbHMuZGVjbGFyYXRpb25UeXBlcy5PQkpFQ1RfTElURVJBTF9NRVRIT0QsXG5cdERlY29yYXRvclV0aWxzLmRlY2xhcmF0aW9uVHlwZXMuT0JKRUNUX0xJVEVSQUxfQUNDRVNTT1Jcbl0sIDxUPih0YXJnZXQ6IE9iamVjdCwgcHJvcGVydHlLZXk6IHN0cmluZyB8IHN5bWJvbCwgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8KC4uLmFyZ3MpID0+IEJsdWViaXJkPFQ+PikgPT5cbntcblx0bGV0IG1ldGhvZCA9IGRlc2NyaXB0b3IudmFsdWU7XG5cblx0ZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICguLi5hcmdzKTogQmx1ZWJpcmQ8VD5cblx0e1xuXHRcdGxldCBzZWxmID0gdGhpcztcblx0XHQvL3JldHVybiByZXR1cm5WYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UgPyBCbHVlYmlyZC5yZXNvbHZlKHJldHVyblZhbHVlKSA6IHJldHVyblZhbHVlO1xuXHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiBtZXRob2QuYXBwbHkoc2VsZiwgYXJncyk7XG5cdFx0fSk7XG5cdH07XG5cblx0cmV0dXJuIGRlc2NyaXB0b3I7XG59KSBhcyBNZXRob2REZWNvcmF0b3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBibHVlYmlyZERlY29yYXRvcjI8VD4odGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcilcbntcblx0Lypcblx0aWYgKGRlc2NyaXB0b3IgPT09IHVuZGVmaW5lZClcblx0e1xuXHRcdGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuXHR9XG5cdCovXG5cdGRlc2NyaXB0b3IudmFsdWUgPSBQcm9taXNlQmx1ZWJpcmQubWV0aG9kPFQ+KGRlc2NyaXB0b3IudmFsdWUpO1xuXG5cdHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBibHVlYmlyZERlY29yYXRvcjI7XG4iXX0=