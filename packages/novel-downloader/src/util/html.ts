/// <reference types="jquery" />

import NovelSite from '../site/index';
import { hashSum } from './hash';

/**
 * 保留格式化标签的函数
 * Function to keep format tags
 * 
 * 根据运行时选项保留特定的 HTML 格式化标签，如 ruby（注记）和其他格式标签
 * Keeps specific HTML format tags based on runtime options, such as ruby (annotation) and other format tags.
 * 
 * @param target 目标元素（jQuery 选择器、DOM 元素或 jQuery 对象）
 * @param opts 选项对象，包含 jQuery 实例和运行时配置
 * @returns 处理后的 jQuery 对象
 */
export function keepFormatTag<O = NovelSite.IOptionsRuntime, E extends unknown | JQueryStatic = unknown>(target: E, opts: {
	/** jQuery 静态实例 */
	$: JQueryStatic,
	/** 运行时选项配置 */
	optionsRuntime: O & NovelSite.IOptionsRuntime,
})
{
	let { optionsRuntime, $ } = opts;

	let _target: JQuery = $(target as HTMLElement);

	// 保留 Ruby 注记标签
	if (optionsRuntime.keepRuby)
	{
		[
			// Ruby 注记括号标签
			'rp',
			// Ruby 注记文本标签
			'rt',
			// Ruby 注记容器标签
			'ruby',
		].forEach(tag =>
		{
			_tagToFormat(_target, tag, $)
		});
	}

	// 保留格式化标签
	if (optionsRuntime.keepFormat)
	{
		[
			// 删除线标签
			's',
			// 斜体标签
			'i',
			// 粗体标签
			'b',
			// 上标标签
			'sup',
			// 下标标签
			'sub',
		].forEach(tag =>
		{
			_tagToFormat(_target, tag, $)
		});
	}

	return _target
}

/**
 * 保存图片到附件的函数
 * Function to save images to attachments
 * 
 * 将图片源 URL 保存到小说、卷和章节的图片数组中
 * Saves image source URLs to the images arrays of novel, volume, and chapter.
 * 
 * @param $ jQuery 静态实例
 * @param _imgs jQuery 图片集合
 * @param cache 缓存对象，包含小说、卷和章节信息
 * @param cb 可选的回调函数，用于自定义图片处理逻辑
 * @returns 处理后的 jQuery 图片集合（如果有图片）
 */
export function _saveImageToAttach($: JQueryStatic, _imgs: JQuery, cache: {
	novel: NovelSite.INovel,
	volume: NovelSite.IVolume,
	chapter: NovelSite.IChapter,
}, cb?: (elem: HTMLElement | HTMLImageElement, i: number) => any) 
{
	if (_imgs.length) 
	{
		cache.chapter.imgs = cache.chapter.imgs || [];
		cache.novel.imgs = cache.novel.imgs || [];
		cache.volume.imgs = cache.volume.imgs || [];

		return _imgs.each((i, elem) => 
		{
			if (cb != null)
			{
				return cb(elem, i)
			}

			let src = $(elem).prop('src')?.trim();

			if (src)
			{
				cache.chapter.imgs = cache.chapter.imgs || [];
				cache.chapter.imgs.push(src);
				cache.novel.imgs.push(src);
				cache.volume.imgs.push(src);
			}
		});
	}
}

/**
 * 在上下文中保留图片的函数
 * Function to keep images in context
 * 
 * 用图片的哈希值替换图片元素，以便在文本中保留对图片的引用
 * Replaces image elements with their hash values to preserve references to images in text.
 * 
 * @param _imgs jQuery 图片集合
 * @param $ jQuery 静态实例
 * @param opts 选项对象，包含前缀和后缀
 * @returns 处理后的 jQuery 图片集合
 */
export function _keepImageInContext(_imgs: JQuery, $: JQueryStatic, {
	/** 图片引用的前缀，默认为"插圖" */
	prefix = '插圖',
	/** 图片引用的后缀，默认为空字符串 */
	append = '',
} = {})
{
	_imgs.each((i, elem) => {
		let img = $(elem);
		let src = img.prop('src');

		img.after(`（${prefix}${hashSum(src)}）${append}`);
		img.remove();
	});

	return _imgs;
}

/**
 * 将 HTML 标签转换为格式标签的内部函数
 * Internal function to convert HTML tags to format tags
 * 
 * 将指定标签转换为保留格式的标签，以便在文本输出中保留原始格式
 * Converts specified tags to format-preserving tags for preserving original formatting in text output.
 * 
 * @param _target 目标 jQuery 对象
 * @param tag 标签名称
 * @param $ jQuery 静态实例
 * @returns 处理后的 jQuery 对象
 */
export function _tagToFormat(_target: JQuery, tag: string, $: JQueryStatic)
{
	_target.find(tag)
		.each((i, elem) =>
		{
			let _this = $(elem);
			_this.after(`＜${tag}＞${_this.html()}＜/${tag}＞`);
			_this.remove();
		});

	return _target;
}
