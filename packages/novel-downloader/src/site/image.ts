/**
 * Created by user on 2018/1/17/017.
 */

import fs, { trimFilename } from 'fs-iconv';
import * as request from 'request-promise';
import { URL } from 'jsdom-extra';
import * as Promise from 'bluebird';

import * as path from 'path';

export function download_image(img: string | URL, options: {
	name?: string,

	dir?: string,
	fromfile?: string,

	prefix?: string,
}): Promise<{
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

	return Promise.resolve(ret);
}

export default download_image;
//export default exports;