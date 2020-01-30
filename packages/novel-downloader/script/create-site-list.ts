/**
 * Created by user on 2019/1/3/003.
 */

import fg = require("@bluelovers/fast-glob");
import path = require("path");
import fs = require("fs-extra");

fg.async<string>([
	'*/**.ts',
], {
	cwd: path.join(__dirname, '..', 'src/site'),
	ignore: [
		'**/*.d.ts',
	],
})
	.then(function (ls)
	{
		//console.log(ls);

		return ls.sort().reduce(function (a, b)
		{
			b = b.replace(/\.ts$/, '');

			let basename = path.basename(b);
			let ds = b.split('/');

			let id: string;

			if (basename == 'index')
			{
				ds.pop();
			}

			let b2 = ds.join('/');

			ds = ds.map(function (s)
			{
				return s.replace(/^[a-z]/, function (s)
				{
					return s.toUpperCase();
				})
			});

			id = [
				'NovelSite',
			].concat(ds).join('');

			a.push([id, b2]);

			return a;
		}, [])
	})
	.then(ls => {
		//console.log(ls);

		let ret: string[] = [];

		let s: string;

		s = `import _NovelSite from './site';\nimport Bluebird = require("bluebird");`;

		ret.push(s);

		s = `export enum EnumNovelSiteList
{
	${ls.map(([k, v]) => `${k} = '${v}',`).join('\n\t')}
	${ls.map(([k, v]) => `'${v}' = '${v}',`).join('\n\t')}
	${ls.map(([k, v]) => `'./site/${v}' = '${v}',`).join('\n\t')}
}`;

		ret.push(s);

		s = `export interface INovelSiteList
{
	${ls.map(([k, v]) => `${k}: typeof import('./site/${v}').default`).join('\n\t')}
}`;

		ret.push(s);

		s = ls.map(([k, v]) => `export function requireNovelSiteClass(siteID: EnumNovelSiteList.${k} | '${v}'): INovelSiteList["${k}"]\n`).join('');

		s += `export function requireNovelSiteClass\<T extends typeof _NovelSite\>(siteID: EnumNovelSiteList | string): T
export function requireNovelSiteClass(siteID: EnumNovelSiteList | string)
{
	if (!(siteID in EnumNovelSiteList))
	{
		throw new RangeError(\`'\${siteID}' not exists\`);
	}
	return require(\`./site/\$\{EnumNovelSiteList[siteID]\}\`).default
}`;

		ret.push(s);

		s = `export default requireNovelSiteClass`;

		ret.push(s);

		ret.push('');

		return fs.writeFile(path.join(__dirname, '..', 'src/all.ts'), ret.join('\n\n'));
	})
;
