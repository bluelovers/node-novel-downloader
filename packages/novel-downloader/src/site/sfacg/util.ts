import type NovelSite from '../index';
import createURL, { _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /book\.sfacg/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	if (bool < 0)
	{
		url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/`;
	}
	else if (urlobj.chapter_vip && urlobj.chapter_id)
	{
		url = `http://book.sfacg.com/vip/c/${urlobj.chapter_id}/`;
	}
	else
	{
		let cid = (!bool && urlobj.chapter_id) ? [urlobj.novel_pid, urlobj.chapter_id].join('/') : 'MainIndex';

		url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/${cid}/`;
	}

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:(\d+)\/(\d+))/;
	m = r.exec(url);
	if (m)
	{
		urlobj.novel_pid = m[2];
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[3];

		return urlobj;
	}

	r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:MainIndex)?/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /book\.sfacg\.com\/vip\/c\/(\d+)/;
	if (m = r.exec(url))
	{
		urlobj.chapter_id = m[1];
		urlobj.chapter_vip = true;

		return urlobj;
	}

	return urlobj;
}
