/**
 * 小说附件输出工具函数
 * Novel attachment output utility function
 * 
 * 将小说中的图片信息输出到 ATTACH.md 文件中，支持图片去重和格式处理
 * Outputs image information from novels to ATTACH.md file, supporting image deduplication and format handling.
 * 
 * Created by user on 2020/3/30.
 */

import { array_unique_overwrite } from "array-hyper-unique";
import { join, relative } from "upath2";
import { consoleDebug } from './log';
import { hashSum } from './hash';
import { readFile, outputFile } from "fs-extra";
import { stringify as mdconf_stringify, parse as mdconf_parse } from 'mdconf2';

/**
 * 输出小说图片到附件文件的函数
 * Function to output novel images to attachment file
 * 
 * 将图片信息保存到 ATTACH.md 文件中，支持图片去重和格式处理
 * Saves image information to ATTACH.md file, supporting image deduplication and format handling.
 * 
 * @param param0 参数对象
 * @returns Promise<object> 返回包含图片信息的对象
 */
export async function outputNovelToAttach({
	/** 图片 URL 数组 */
	imgs,
	/** 输出目录路径 */
	dirname,
	/** 是否保留图片哈希值作为键 */
	keepImage,
	/** 小说根目录路径 */
	path_novel,
}: {
	imgs: string[],
	dirname: string,
	keepImage: boolean,
	path_novel: string,
})
{
	// 图片去重和过滤
	imgs = array_unique_overwrite(imgs)
		.filter(v => v)
		;

	const file = join(dirname, 'ATTACH.md');

	let md_data = {
		attach: {
			images: {} as Record<string, string>,
		},
	};

	// 读取已存在的 ATTACH.md 文件（如果存在）
	if (keepImage || 1)
	{
		await readFile(file)
			.then(v => mdconf_parse(v))
			// @ts-ignore
			.then((data: typeof md_data) =>
			{
				data.attach = data.attach || {} as any;
				data.attach.images = data.attach.images || {};
				md_data = data;
				consoleDebug.debug(`Load data from exists ATTACH.md`)
			})
			.catch(e => null)
	}

	// 处理并添加图片信息到数据对象
	md_data.attach.images = Object
		.entries(imgs)
		.reduce((a, [k, v]) =>
		{
			if (keepImage)
			{
				// 使用哈希值作为图片的键
				a[hashSum(v)] = v;
			}
			else
			{
				// 使用索引（填充到3位数字）作为图片的键
				a[k.toString().padStart(3, '0')] = v;
			}
			return a
		}, md_data.attach.images);

	// 转换为 MDConf 格式并输出到文件
	const md = mdconf_stringify(md_data);

	return outputFile(file, md)
		.then(r =>
		{
			consoleDebug.success(`[ATTACH]`, `[SAVE]`, `${relative(path_novel, file)}`);
			return md_data;
		});
}

export default outputNovelToAttach
