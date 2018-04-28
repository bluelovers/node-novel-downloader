/**
 * Created by user on 2018/4/28/028.
 */

import * as StrUtil from 'str-util';
import { zhRegExp } from 'regexp-cjk';
import { array_unique } from './util';

export function stripContent(text: string)
{
	[
		` *(?:uu看书.? *)*(?:https:\\\/*)*www.uukanshu.?c?om? *`,
		`(?:\\&?n?b?s?p?;?)*[ &~／\\/（;《＝＋+=(\\-\\[]*猪.{0,5}?猪.{0,5}?岛.{0,5}?小.{0,5}?说.{0,5}?www(?:.(?:huhu|huzu|zuhu|huuo|zhu(?:zud)?|zhzhuam|zhu.{0,5}zhu)?(.?c?om?)?)?[ &~／\\/;＝＋+={}]*(?:.?\\&?n?b?s?p?;?)*~?[ &~／\\/;＝＋+={}\\-()]*\\.?`,

		`^岛.小说www.zuzud;`,
		`小说 ww.zhu\.`,

		`&nbs.{0,5}?zhuzhu.{0,5}?..{0,5}?p;`,
		`&nb.{0,5}?zhu.{0,5}?zhu.{0,5}?.omsp;`,
		`@zzhdo.om;`,
		`\\$.{0,5}?zhu.{0,5}?zhu.{0,5}?..{0,5}?\\)`,

		`&@zzhdo.omnbsp;`,
		`｜.{0,5}?zhu.{0,5}?zhu.{0,5}?\\]`,

		`\\{zhuzhu.{0,5}?..{0,5}?\\}`,

		`&.{0,5}?zhudanbsp;`,

		`\\[zhu.{0,5}?..{0,5}?\\]`,
		`&nzhu＋;`,

		`\\[zhu\\]\\[\\].\\[\\]`,

	].forEach(function (v)
	{
		let s = char_autoFH(v);

		if (s.indexOf('^') != 0)
		{
			s = ' *' + s;
		}

		if (s[s.length - 1] != '$')
		{
			s = s + ' *';
		}

		let r = new zhRegExp(s, 'igm');

		//console.log(r);

		text = text.replace(r, '');
	});

	return text;
}

function char_autoFH(text: string)
{
	return text
		.replace(/([a-z])(\1)*/ig, function (ss, s)
		{
			s = s[0];

			let a = [].concat([
				s,
				s.toLowerCase(),
				s.toUpperCase(),
				s.toLocaleLowerCase(),
				s.toLocaleUpperCase(),
			]);

			a.forEach(function (v)
			{
				a.push(StrUtil.toFullWidth(v));
			});

			return '[' + array_unique(a).join('') + ']+';
		})
		;
}

import * as self from './strip';
export default self;

