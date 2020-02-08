import type NovelSite from '../index';
import createURL, { _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /syosetu/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let subdomain = urlobj.novel_r18 ? 'novel18' : 'ncode';

	if (urlobj.novel_pid && urlobj.chapter_id)
	{
		// @ts-ignore
		return new URL(`https://${subdomain}.syosetu.com/txtdownload/dlstart/ncode/${urlobj.novel_pid}/?no=${urlobj.chapter_id}&hankaku=0&code=utf-8&kaigyo=crlf`);
	}

	let pad = (!bool && urlobj.chapter_id) ? urlobj.chapter_id : '';

	let url: string = `http://${subdomain}.syosetu.com/${urlobj.novel_id}/${pad}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv): IParseUrlRuntime
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /^(n[\w]{5,6})$/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		return urlobj;
	}

	r = /(novel18)\.syosetu\.com/;
	if (m = r.exec(url))
	{
		urlobj.novel_r18 = m[1];
	}

	r = /txtdownload\/dlstart\/ncode\/(\d+)/;
	if (m = r.exec(url))
	{
		urlobj.novel_pid = m[1];

		return urlobj;
	}

	r = /\.syosetu\.com\/(n\w+)(?:\/?(\d+))?/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	return urlobj;
}
