/// <reference types="request-promise" />
/// <reference types="bluebird" />
/**
 * Created by user on 2018/2/9/009.
 */
import * as request from 'request-promise';
import * as Promise from 'bluebird';
export interface IOptions extends request.RequestPromiseOptions {
    retry?: number;
    delay?: number;
    libRequest?: (url: string, options?: IOptions) => request.RequestPromise;
}
export declare function retryRequest(url: any, options?: IOptions): Promise<any>;
import * as self from './fetch';
export default self;
