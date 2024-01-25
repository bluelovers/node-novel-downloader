/**
 * Created by user on 2020/1/6.
 */
import { LazyURL } from 'lazy-url';

export function parse(input: string | URL)
{
	let u = new LazyURL(input);

	if (!/\.mitemin/.test(u.host))
	{
		throw new Error(`not support host ${u.host}`);
	}

	let subdomain = u.host.split('.')[0];

	if (/^img/.test(subdomain))
	{
		let basename: string = u.paths[u.paths.length - 1];

		let m = basename.match(/^(?<filename>.+?)(?:\.(?<size>\d+)\.(?:jpg|png|gif|bmp))?$/);

		let { filename, size } = m.groups;

		let u2 = new LazyURL(u);

		let paths = u2.paths.slice();
		paths[paths.length - 1] = filename;

		u2.pathname = paths.join('/');

		return {
			url: u.toString(),
			fullsize: u2.toString(),
			size,
			filename,
		}
	}
	else if (u.pathname.match(/\bviewimage(?<size>big)?\/icode\/(?<icode>\w+)/))
	{
		let size = RegExp.$1;
		let icode = RegExp.$2;

		let u2 = new LazyURL(u);

		let paths = u2.paths.slice();
		paths = paths.map(v => {
			if (/^(viewimage)(?:big)?$/.test(v))
			{
				return RegExp.$1;
			}

			return v;
		});

		u2.pathname = paths.join('/');

		let authorid: string = subdomain;

		return {
			url: u.toString(),
			fullsize: u2.toString(),
			size,
			icode,
			authorid,
		}
	}

	throw new Error(`unknown url ${u.toString()}`);
}

export async function parseAsync(input: string | URL)
{
	return parse(input)
}

export default parse
