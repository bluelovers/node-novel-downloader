/**
 * Created by user on 2018/3/18/018.
 */

import _jsdom, { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions } from 'jsdom-extra';

import NovelSite from './site/index';
export { IFromUrlOptions, VirtualConsole, IOptionsJSDOM, IFromFileOptions }

import { LazyCookie, LazyCookieJar } from 'jsdom-extra';
export { LazyCookie, LazyCookieJar }

import { packOptions as _packOptions, IOptions, IOptionsCreateQuery } from 'jsdom-extra';
import { normalizeFromURLOptions, normalizeRequestOptions, IRequestOptions } from 'jsdom-extra/lib/from-url';

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

export function getOptions(options)
{
	let opts = _packOptions(options.optionsJSDOM || options);

	let fromURLOptions = normalizeFromURLOptions(opts);
	let requestOptions = normalizeRequestOptions(fromURLOptions);

	return {
		options: opts,
		fromURLOptions,
		requestOptions,
	}
}

export default exports as typeof import('./jsdom');
