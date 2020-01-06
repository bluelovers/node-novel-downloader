/// <reference types="jquery" />

import NovelSite from '../site/index';
import { hashSum } from './hash';

export function keepFormatTag<O = NovelSite.IOptionsRuntime, E extends unknown | JQueryStatic = unknown>(target: E, opts: {
	$: JQueryStatic,
	optionsRuntime: O & NovelSite.IOptionsRuntime,
})
{
	let { optionsRuntime, $ } = opts;

	let _target: JQuery = $(target as HTMLElement);

	if (optionsRuntime.keepRuby)
	{
		[
			'rp',
			'rt',
			'ruby',
		].forEach(tag =>
		{
			_tagToFormat(_target, tag, $)
		})
		;
	}

	if (optionsRuntime.keepFormat)
	{
		[
			's',
			'i',
			'b',
			'sup',
			'sub',
		].forEach(tag =>
		{
			_tagToFormat(_target, tag, $)
		})
		;
	}

	return _target
}

export function _keepImageInContext(_imgs: JQuery, $: JQueryStatic, prefix = '插圖')
{
	_imgs.each((i, elem) => {

		let img = $(elem);
		let src = img.prop('src');

		img.after(`（${prefix}${hashSum(src)}）`);
		img.remove();

	});

	return _imgs;
}

export function _tagToFormat(_target: JQuery, tag: string, $: JQueryStatic)
{
	_target.find(tag)
		.each((i, elem) =>
		{
			let _this = $(elem);

			_this.after(`＜${tag}＞${_this.html()}＜/${tag}＞`);
			_this.remove();

		})
	;

	return _target;
}
