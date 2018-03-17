/**
 * Created by user on 2018/3/18/018.
 */
import { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions } from 'jsdom-extra';
export { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions };
import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
export { LazyCookie, LazyCookieJar };
export declare type INovelOptionsJSDOM = IFromUrlOptions & IOptionsJSDOM;
export declare const defaultJSDOMOptions: IFromUrlOptions;
export declare function createOptionsJSDOM(options?: INovelOptionsJSDOM, ...opts: INovelOptionsJSDOM[]): INovelOptionsJSDOM;
import * as self from './jsdom';
export default self;
