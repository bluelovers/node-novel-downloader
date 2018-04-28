/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/uukanshu';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries([

		'https://www.uukanshu.com/b/24678/',

	], async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 3,

			//disableCheckExists: true,

			startIndex: 1,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

