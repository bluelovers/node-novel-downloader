/**
 * Created by user on 2018/3/18/018.
 */

import { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions } from 'jsdom-extra';
import NovelSite from './site/index';
export { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions }

import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
export { LazyCookie, LazyCookieJar }

export type INovelOptionsJSDOM = IFromUrlOptions & IOptionsJSDOM;

export const defaultJSDOMOptions: IFromUrlOptions = {
	//virtualConsole: new VirtualConsole,
	//runScripts: 'dangerously',
	disableCheerio: true,
	minifyHTML: true,
};

export function createOptionsJSDOM<T = INovelOptionsJSDOM>(options: Partial<T & INovelOptionsJSDOM> = {}, ...opts: INovelOptionsJSDOM[]): Partial<T & INovelOptionsJSDOM>
{
	options = Object.assign({}, defaultJSDOMOptions, options, ...opts);
	options.cookieJar = options.cookieJar || new LazyCookieJar();

	return options;
}

import * as self from './jsdom';
export default self;
