import type NovelSite from '../index';
import createURL, { _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /x23qb/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	let pad: string;

	if (!bool && urlobj.chapter_id)
	{
		pad = `book/${urlobj.novel_id}/${urlobj.chapter_id}.html`
	}
	else
	{
		pad = `book/${urlobj.novel_id}/`
	}

	//url = `https://www.x23qb.com/${pad}`;
	url = `https://www.23qb.com/${pad}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /^(\d+)$/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		return urlobj;
	}

	r = /book\/(\d+)(?:\/(\d+).html|\/?)/g;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	return urlobj;
}
