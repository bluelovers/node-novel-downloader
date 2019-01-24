/**
 * Created by user on 2018/2/10/010.
 */
import PromiseBluebird = require("bluebird");
export { PromiseBluebird };
export declare const bluebirdDecorator: MethodDecorator;
export declare function bluebirdDecorator2<T>(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export default bluebirdDecorator2;
