/**
 * Created by user on 2017/9/10/010.
 */

import NovelSite from '../src/site/dmzj';
import * as Promise from 'bluebird';

(async () =>
{
	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries(array_unique([
		//
		'http://q.dmzj.com/2156/index.shtml',
	]), async function (url)
	{
		let ret = await Site.download(url);

		console.log(url);
		console.log(ret);

		await Promise.delay(1000);
	});

})();

function array_unique(array: any[])
{
	return array.filter(function (el, index, arr)
	{
		return index == arr.indexOf(el);
	});
}
