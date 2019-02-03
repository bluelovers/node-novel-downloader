/**
 * Created by user on 2018/2/9/009.
 */
import request = require('request-promise');
import Promise = require('bluebird');
export interface IOptions extends request.RequestPromiseOptions {
    retry?: number;
    delay?: number;
    jar?: any;
    libRequest?: (url: string, options?: IOptions) => request.RequestPromise;
}
export declare function retryRequest(url: any, options?: IOptions): Promise<any>;
export declare function manyRequest(url_arr: any[], options?: IOptions): Promise<any[]>;
declare const _default: typeof import("./fetch");
export default _default;
