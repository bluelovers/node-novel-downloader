/**
 * Created by user on 2018/2/9/009.
 */
import request from 'request-promise';
import Bluebird from 'bluebird';
import { IRequestPromise } from './util/request/create';
export interface IOptions extends request.RequestPromiseOptions {
    retry?: number;
    delay?: number;
    jar?: any;
    libRequest?: ((url: string, options?: IOptions) => request.RequestPromise) | IRequestPromise;
}
export declare function retryRequest(url: any, options?: IOptions): Bluebird<any>;
export declare function manyRequest(url_arr: any[], options?: IOptions): Bluebird<any[]>;
