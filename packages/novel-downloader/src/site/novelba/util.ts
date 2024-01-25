import type NovelSite from '../index';
import { createURL, _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /novelba/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';

	url = `https://novelba.com/works/${urlobj.novel_id}${pad}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /^(\d{6,})$/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		return urlobj;
	}

	r = /novelba\.com\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	return urlobj;
}
