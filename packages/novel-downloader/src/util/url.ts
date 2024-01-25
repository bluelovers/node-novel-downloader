import { URL as _URL, URLImplCore } from 'jsdom-url';
import type NovelSite from '../site/index';
import { ITSOverwrite } from 'ts-type';
import { console } from './log';
import { LazyURL } from 'lazy-url';

export function createURL(...argv: ConstructorParameters<typeof URL>): URL
{
	//return new _URL(...argv) as any
	return new LazyURL(...argv) as any
}

export function isURL(obj): obj is URL
{
	if (obj instanceof URL || obj instanceof _URL || obj instanceof URLImplCore)
	{
		return true
	}

	return false
}

export interface IParseUrlRuntime extends ITSOverwrite<NovelSite.IParseUrl, {
	url: URL,
}>
{

}

export function _handleParseURL(url: string | URL | number, ...argv)
{
	if (typeof url === 'number')
	{
		url = String(url);
	}

	let urlobj: IParseUrlRuntime = {
		url: url as URL,

		novel_pid: null,
		novel_id: null,
		chapter_id: null,
	};

	try
	{
		urlobj.url = createURL(url as string);
		url = urlobj.url.href;
	}
	catch (e)
	{
		if (isURL(url))
		{
			url = url.href
		}
		else
		{
			console.warn(e.toString() + ` "${url}"`);
		}
	}

	if (typeof url != 'string')
	{
		throw new TypeError(`expected url can be string, but got ${url}`);
	}

	return {
		urlobj,
		url: url
	}
}

export default createURL
