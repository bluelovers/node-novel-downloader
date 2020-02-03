/**
 * Created by user on 2018/3/18/018.
 */

import StrUtil = require('str-util');
import novelText from 'novel-text';
// @ts-ignore
import { minifyHTML } from 'jsdom-extra/lib/html';
import { array_unique } from 'array-hyper-unique';

export { minifyHTML, array_unique }

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

export function trim(str: string, bool?: boolean)
{
	let t = novelText.trim(str, {
		trim: '　',
	});

	if (bool)
	{
		t = t.replace(/^[　\s]+|[　\s]+$/g, '');
	}

	return t;
}

export function escapeRegexp(str: string)
{
	return str.replace(/[|\\{}()\[\]^$+*?.\/]/g, '\\$&');
}

export function _fixVolumeChapterName(name: string)
{
	return name.replace(/[?@!$#\\\/<>\[\]{}()*]+/g, s => StrUtil.toFullWidth(s))
}
