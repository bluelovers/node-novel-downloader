/**
 * Created by user on 2019/7/7.
 */

export function createStore<T extends any, K extends object>()
{
	const map = new WeakMap<K, T>();

	return map;
}
