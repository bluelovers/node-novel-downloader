/**
 * Created by user on 2020/3/30.
 */

import { array_unique_overwrite } from "array-hyper-unique";
import { join, relative } from "upath2";
import { consoleDebug } from './log';
import { hashSum } from './hash';
import { readFile, outputFile } from "fs-extra";
import { stringify as mdconf_stringify, parse as mdconf_parse } from 'mdconf2';

export async function outputNovelToAttach({
	imgs,
	dirname,
	keepImage,
	path_novel,
}: {
	imgs: string[],
	dirname: string,
	keepImage: boolean,
	path_novel: string,
})
{
	imgs = array_unique_overwrite(imgs)
		.filter(v => v)
	;

	const file = join(dirname, 'ATTACH.md');

	let md_data = {
		attach: {
			images: {} as Record<string, string>,
		},
	};

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

	md_data.attach.images = Object
		.entries(imgs)
		.reduce((a, [k, v]) =>
		{

			if (keepImage)
			{
				a[hashSum(v)] = v;
			}
			else
			{
				a[k.toString().padStart(3, '0')] = v;
			}

			return a
		}, md_data.attach.images);

	const md = mdconf_stringify(md_data);

	return outputFile(file, md)
		.then(r =>
		{

			consoleDebug.success(`[ATTACH]`, `[SAVE]`, `${relative(path_novel, file)}`);

			return md_data;
		})
		;
}

export default outputNovelToAttach
