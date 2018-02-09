/**
 * Created by user on 2017/9/10/010.
 */

import * as chapter from '../src/site/dmzj/chapter';
import * as novel from '../src/site/dmzj/novel';
import * as Promise from 'bluebird';

(async () =>
{
	let url = 'http://q.dmzj.com/1984/9099/81175.shtml';

	// 圖文混和
	url = 'http://q.dmzj.com/2277/9113/81321.shtml';
	// 純文字
	url = 'http://q.dmzj.com/2367/8997/79966.shtml';

	url = 'http://q.dmzj.com/2206/index.shtml';

	url = 'http://q.dmzj.com/1837/index.shtml';

	//console.log(await novel.download(url));

	{
		let _urls = [
			//'http://q.dmzj.com/1984/index.shtml',
			//'http://q.dmzj.com/2140/index.shtml',
			//'http://q.dmzj.com/2023/index.shtml',
			//'http://q.dmzj.com/2012/index.shtml',
			//'http://q.dmzj.com/1942/index.shtml',
			//'http://q.dmzj.com/2363/index.shtml',
			//'http://q.dmzj.com/1929/index.shtml',

			//'http://q.dmzj.com/1091/index.shtml',

			//'http://q.dmzj.com/2272/index.shtml',

			//'http://q.dmzj.com/672/index.shtml',

//			'http://q.dmzj.com/1648/index.shtml',

			'http://q.dmzj.com/2156/index.shtml',
		];

		_urls = array_unique(_urls);

		for (let url of _urls)
		{
			let ret = await novel.download(url);

			console.log(url);
			console.log(ret.files.length, ret.data.g_lnovel_name);

			await Promise.delay(1000);
		}
	}

})();

function array_unique(array: any[])
{
	return array.filter(function (el, index, arr)
	{
		return index == arr.indexOf(el);
	});
}
