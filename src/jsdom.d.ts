/**
 * Created by user on 2018/3/18/018.
 */
import { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions } from 'jsdom-extra';
export { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions };
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
export { LazyCookie, LazyCookieJar };
import { IOptions, IOptionsCreateQuery } from 'jsdom-extra';
import { IRequestOptions } from 'jsdom-extra/lib/from-url';
export declare type INovelOptionsJSDOM = IFromUrlOptions & IOptionsJSDOM;
export declare const defaultJSDOMOptions: IFromUrlOptions;
export declare function createOptionsJSDOM<T = INovelOptionsJSDOM>(options?: Partial<T & INovelOptionsJSDOM>, ...opts: INovelOptionsJSDOM[]): Partial<T & INovelOptionsJSDOM>;
export declare function getOptions(options: any): {
    options: Partial<IOptionsJSDOM>;
    fromURLOptions: Partial<IOptionsCreateQuery & IOptions & {
        minifyHTML?: boolean;
    } & IFromUrlOptions>;
    requestOptions: Partial<IRequestOptions>;
};
import * as self from './jsdom';
export default self;
