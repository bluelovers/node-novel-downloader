import type NovelSite from '../index';
import createURL, { _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /wenku8/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	if (bool < 0)
	{
		url = `http://www.wenku8.com/book/${urlobj.novel_id}.htm`;
	}
	else
	{
		let cid = (!bool && urlobj.chapter_id) ? '&cid=' + urlobj.chapter_id : '';

		url = `http://www.wenku8.com/modules/article/reader.php?aid=${urlobj.novel_id}${cid}`;
	}

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /modules\/article\/articleinfo\.php\?id=(\d+)/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /modules\/article\/reader\.php\?aid=(\d+)(?:&cid=(\d+))?/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	r = /book\/(\d+)\.htm/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /novel\/([\d]+)\/([\d]+)\/(?:([\d]+)\.html?)?/;
	if (m = r.exec(url))
	{
		urlobj.novel_pid = m[1];
		urlobj.novel_id = m[2];
		urlobj.chapter_id = m[3];
	}

	r = /^(\d+)$/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	return urlobj;
}
