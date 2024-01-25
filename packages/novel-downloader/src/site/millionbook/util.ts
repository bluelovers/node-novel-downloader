import type NovelSite from '../index';
import { createURL, _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /millionbook/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.htm` : 'index.html';

	url = `http://www.millionbook.net/${urlobj.novel_pid}/${urlobj.novel_id}/${cid}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /www\.millionbook\.net\/([\w\/]+)\/(\w+)\/(?:(\d+)|index)\.html?/;
	m = r.exec(url);

	if (m)
	{
		urlobj.novel_pid = m[1];
		urlobj.novel_id = m[2];
		urlobj.chapter_id = m[3];

		return urlobj;
	}

	return urlobj;
}
