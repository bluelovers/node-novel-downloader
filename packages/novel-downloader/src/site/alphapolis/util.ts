import type NovelSite from '../index';
import createURL, { _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /alphapolis/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	let cid = (!bool && urlobj.chapter_id) ? `episode\/${urlobj.chapter_id}` : '';

	url = `https://www.alphapolis.co.jp/novel/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /alphapolis\.co\.jp\/novel\/([^\/]+)\/([^\/]+)(?:\/episode\/([^\/]+))?/;
	m = r.exec(url as string);

	if (!m)
	{
		r = /novel\/([^\/]+)\/([^\/]+)(?:\/episode\/([^\/]+))?/;
		m = r.exec(url as string)
	}

	if (m)
	{
		urlobj.novel_pid = m[1];
		urlobj.novel_id = m[2];
		urlobj.chapter_id = m[3];

		return urlobj;
	}

	return urlobj;
}
