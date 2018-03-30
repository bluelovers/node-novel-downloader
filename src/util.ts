/**
 * Created by user on 2018/3/18/018.
 */

import novelText from 'novel-text';
import { minifyHTML } from 'jsdom-extra/lib/html';

export { minifyHTML }

export function isUndef(v, opts: any = null, strict?: boolean): boolean
{
	let bool = typeof v == 'undefined' || v === null;

	if (!bool && !isUndef(opts))
	{
		opts = Array.isArray(opts) ? opts : [opts];

		for (let t of opts)
		{
			let bool = strict ? v === t : v == t;

			if (bool)
			{
				return bool;
			}
		}
	}

	return bool;
}

export function trim(str: string)
{
	return novelText.trim(str, {
		trim: '　',
	});
}

import * as self from './util';
export default self;

