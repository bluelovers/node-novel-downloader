import NovelSite from '../index';
import createURL, { _handleParseURL } from '../../util/url';

export function check(url: string | URL | NovelSite.IParseUrl, options?): boolean
{
	return /esjzone\.cc/i.test(createURL(url as any).hostname || '');
}

export function makeUrl(urlobj: NovelSite.IParseUrl, bool ?: boolean | number, ...argv)
{
	let pad: string;

	if (!bool && urlobj.chapter_id)
	{
		pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`
	}
	else
	{
		pad = `detail/${urlobj.novel_id}.html`
	}

	return createURL(`https://www.esjzone.cc/${pad}`);
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

	r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];
		urlobj.chapter_id = m[2];

		return urlobj;
	}

	r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
	if (m = r.exec(url))
	{
		urlobj.novel_id = m[1];

		return urlobj;
	}

	return urlobj;
}

export function _p_2_br(target, $)
{
	return $(target)
		.each(function (i, elem)
		{
			let _this = $(elem);

			let _html = _this
				.html()
				.replace(/(?:&nbsp;?)/g, ' ')
				.replace(/[\xA0\s]+$/g, '')
			;

			if (_html == '<br/>' || _html == '<br>')
			{
				_html = '';
			}

			_this.after(`${_html}<br/>`);
			_this.remove()
		})
		;
}
