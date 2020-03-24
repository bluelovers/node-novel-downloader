/**
 * Created by user on 2018/1/17/017.
 */

import fs from 'fs-iconv';
import { trimFilename } from 'fs-iconv/util';
import request from 'request-promise';
import { URL } from 'jsdom-extra';
import Bluebird from "bluebird";

import path from 'upath2';

export function download_image(img: string | URL, options: {
	name?: string,

	dir?: string,
	fromfile?: string,

	prefix?: string,
}): Bluebird<{
	body: Buffer;
	url: URL;
	dirname: string;
	filename: string;
	outputFile: string;
}>
{
	let dirname = options.dir || path.dirname(options.fromfile);

	if (!dirname)
	{
		throw new Error();
	}

	// @ts-ignore
	let url = new URL(img);

	let filename = options.name || path.basename(url.href);

	if (typeof options.prefix == 'string')
	{
		filename = options.prefix + filename;
	}

	filename = trimFilename(filename);

	let file = path.join(dirname, filename);

	let ret = request(url.href, {
		encoding: null,
		resolveWithFullResponse: true,
	})
		.then(async function (res)
		{
			//console.log(res);

			await fs.saveFile(file, res.body);

			return {
				body: res.body as Buffer,
				url,
				dirname,
				filename,
				outputFile: file,
			}
		})
	;

	// @ts-ignore
	return Bluebird.resolve(ret);
}

export default download_image;
//export default exports;
