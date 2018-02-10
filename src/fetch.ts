/**
 * Created by user on 2018/2/9/009.
 */

import * as request from 'request-promise';
import * as Promise from 'bluebird';

import fetch from 'lets-fetch';
//fetch.retry((tries) => tries <= 3);

export interface IOptions extends request.RequestPromiseOptions
{
	retry?: number,
	delay?: number,
	libRequest?: (url: string, options?: IOptions) => request.RequestPromise,
}

export function retryRequest(url, options: IOptions = {
	retry: 3,
	delay: 1000,
})
{
	let retry = options.retry;
	let libRequest = options.libRequest || request;

	let tries = 0;

	function fn()
	{
		tries++;

		return libRequest(url, options)
			.catch(function (err)
			{
				if (retry-- > 0)
				{
					return Promise.delay(options.delay).then(fn);
				}

				err.tries = tries;

				return Promise.reject(err);
			})
		;
	}

	return Promise.resolve(fn());
}

import * as self from './fetch';
export default self;
//export default exports;
