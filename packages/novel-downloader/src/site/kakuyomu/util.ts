import type NovelSite from '../index';
import { createURL, _handleParseURL, IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /kakuyomu\.jp/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';

	let url = `https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`;

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /^(\d{10,})$/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		return urlobj;
	}

	r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	return urlobj;
}
