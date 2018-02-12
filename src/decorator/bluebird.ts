/**
 * Created by user on 2018/2/10/010.
 */

import { DecoratorUtils } from "decorator-utils";
import * as Bluebird from "bluebird";

export default DecoratorUtils.createDecorator([
	DecoratorUtils.declarationTypes.CLASS_METHOD,
	DecoratorUtils.declarationTypes.CLASS_ACCESSOR,
	DecoratorUtils.declarationTypes.OBJECT_LITERAL_METHOD,
	DecoratorUtils.declarationTypes.OBJECT_LITERAL_ACCESSOR
], <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args) => Bluebird<T>>) =>
{
	let method = descriptor.value;

	descriptor.value = function (...args): Bluebird<T>
	{
		let self = this;
		//return returnValue instanceof Promise ? Bluebird.resolve(returnValue) : returnValue;
		return Bluebird.resolve().then(function ()
		{
			return method.apply(self, args);
		});
	};

	return descriptor;
}) as MethodDecorator;
