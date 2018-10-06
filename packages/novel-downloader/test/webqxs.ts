/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/webqxs/index';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries([
		'http://www.webqxs.com/0/103/',

	],async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

			noFirePrefix: true,
			noFilePadend: true,

			startIndex: 1,

			disableCheckExists: true,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

