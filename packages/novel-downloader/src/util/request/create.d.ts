/**
 * Created by user on 2019/4/28.
 */
import _request = require('request');
import BluebirdPromise = require('bluebird');
import RequestPromise = require('request-promise');
export declare type IRequest = typeof _request;
export declare type IRequestPromise = typeof RequestPromise;
export declare type IBluebirdPromise = typeof BluebirdPromise;
export declare function createStealthyRequest<T extends IRequest>(libRequest?: string | T): T;
export declare function createBluebirdPromise<P extends IBluebirdPromise>(libPromise?: string | P): P;
export declare function createCachedRequest<T extends IRequest>(libRequest?: string | T): T;
export declare function createRequestPromise<R extends IRequest, P extends IBluebirdPromise>(options?: {
    libRequest?: string | R;
    libPromise?: string | P;
}): IRequestPromise;
export default createRequestPromise;
