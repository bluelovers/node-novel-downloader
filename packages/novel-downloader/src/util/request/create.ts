/**
 * Created by user on 2019/4/28.
 */

import _request = require('request');
import { getNewLibraryCopy } from 'bluebird';
import BluebirdPromise = require('bluebird');
import _createCachedRequest = require('cached-request');
import RequestPromise = require('request-promise');
import configure = require('request-promise-core/configure/request2');
import stealthyRequire = require('stealthy-require');

export type IRequest = typeof _request;
export type IRequestPromise = typeof RequestPromise;
export type IBluebirdPromise = typeof BluebirdPromise;

let Bluebird: IBluebirdPromise;

export function createStealthyRequest<T extends IRequest>(libRequest?: string | T): T
{
	if (libRequest == null)
	{
		libRequest = 'request';
	}

	if (typeof libRequest === 'string')
	{
		libRequest = stealthyRequire(require.cache, function ()
		{
			return require('request');
		}, function ()
		{
			require('tough-cookie');
		}, module) as T
		;
	}

	return libRequest;
}

export function createBluebirdPromise<P extends IBluebirdPromise>(libPromise?: string | P): P
{
	if (libPromise == null)
	{
		if (Bluebird == null)
		{
			Bluebird = getNewLibraryCopy();
			Bluebird.config({ cancellation: true });
		}

		libPromise = Bluebird as P
	}

	if (typeof libPromise === 'string')
	{
		libPromise = (require(libPromise) as typeof BluebirdPromise)
			.getNewLibraryCopy() as P
		;

		libPromise.config({ cancellation: true });
	}

	return libPromise
}

export function createCachedRequest<T extends IRequest>(libRequest?: string | T): T
{
	return _createCachedRequest(createStealthyRequest(libRequest))
}

export function createRequestPromise<R extends IRequest, P extends IBluebirdPromise>(options: {
	libRequest?: string | R,
	libPromise?: string | P,

} = {}): IRequestPromise
{
	let { libRequest, libPromise } = options;

	libPromise = createBluebirdPromise(libPromise);
	libRequest = createStealthyRequest(libRequest);

	configure({
		request: libRequest,
		PromiseImpl: libPromise,
		expose: [
			'then',
			'catch',
			'finally',
			'cancel',
			'promise',
		],
		constructorMixin: function (resolve, reject, onCancel)
		{
			const self = this;
			onCancel(function ()
			{
				self.abort();
			});
		},
	});



	// @ts-ignore
	libRequest.bindCLS = function RP$bindCLS() {
		throw new Error('CLS support was dropped. To get it back read: https://github.com/request/request-promise/wiki/Getting-Back-Support-for-Continuation-Local-Storage');
	};

	return libRequest as any as IRequestPromise
}

export default createRequestPromise
