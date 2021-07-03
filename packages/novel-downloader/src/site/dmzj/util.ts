import type NovelSite from '../index';
import createURL, { _handleParseURL } from '../../util/url';
import { TxtUrlCreator } from './v4/txtUrlCreator';
import { IParseUrlRuntime } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /dmzj\.com/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let url: string;

	//const api_url = 'http://v2.api.dmzj.com';
	//const api_url = 'http://nnv3api.dmzj1.com';
	const api_url = 'http://nnv4api.muwai.com';

	if (bool === 2 && urlobj.novel_id)
	{
		url = `http://q.dmzj.com/${urlobj.novel_id}/index.shtml`;
	}
	else if (!bool && urlobj.volume_id && urlobj.chapter_id)
	{
		//url = `${api_url}/novel/download/${urlobj.novel_id}_${urlobj.volume_id}_${urlobj.chapter_id}.txt`;
		url = TxtUrlCreator.newUrl(urlobj.volume_id, urlobj.chapter_id);
	}
	else if (bool === true && urlobj.novel_id)
	{
		url = `${api_url}/novel/chapter/${urlobj.novel_id}`;
		// url = `${api_url}/novel/chapter/${urlobj.novel_id}.json`;
	}
	else
	{
		url = `${api_url}/novel/detail/${urlobj.novel_id}`;
		// url = `${api_url}/novel/${urlobj.novel_id}.json`;
	}

	return createURL(url);
}

export function parseUrl(_url: string | URL | number, ...argv)
{
	const { urlobj, url } = _handleParseURL(_url, ...argv);

	let r: RegExp;
	let m: RegExpExecArray;

	r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/(\d+).json/;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /^(\d+)$/;
	if (m = r.exec(url as string))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/chapter\/(\d+)(?:.json|\/?$)/;
	if (m = r.exec(url as string))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/download\/(\d+)_(\d+)_(\d+).txt/;
	if (m = r.exec(url as string))
	{
		urlobj.novel_id = m[1];
		urlobj.volume_id = m[2];
		urlobj.chapter_id = m[3];

		return urlobj;
	}

	// 手機版網址
	r = /(?:q\.dmzj\.com\/|^\/)(?:(\d+)\/(?:(\d+)\/(?:(\d+)[\._])?)?)/;
	if (m = r.exec(url as string))
	{
		urlobj.novel_id = m[1];
		urlobj.volume_id = m[2];
		urlobj.chapter_id = m[3];
		return urlobj;
	}

	//v4
	r = /(?:api|nnv\dapi)\.(?:dmzj\d?|muwai)\.com\/novel\/detail\/(\d+)\/?$/;
	if (m = r.exec(url as string))
	{
		urlobj.novel_id = m[1];
		return urlobj;
	}

	r = /jurisdiction.(?:dmzj\d*|muwai)\.com\/lnovel\/(\d+)_(\d+).txt/;
	if (m = r.exec(url as string))
	{
		urlobj.volume_id = m[1];
		urlobj.chapter_id = m[2];
		return urlobj;
	}

	return urlobj;
}
