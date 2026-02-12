/**
 * Created by user on 2019/8/31.
 */

import _hashSum from 'hash-sum';

/**
 * 計算值的雜湊總和
 * Calculate the hash sum of a value
 */
export function hashSum(value: any): string
{
	return _hashSum(value)
}
