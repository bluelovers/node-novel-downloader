/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/uukanshu/index';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.dir(Site, {
		colors: true,
	});

	Promise.mapSeries([

		'https://www.uukanshu.com/b/24678/',

	], async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			//filePrefixMode: 5,

			//disableCheckExists: true,

			startIndex: 1,

		}).then(function (novel)
		{
			console.dir(novel, {
				colors: true,
			});

			console.dir(novel.novel_title, {
				colors: true,
			});
		})
		;
	});

})();

