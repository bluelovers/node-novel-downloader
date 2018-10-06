/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from './site/kakuyomu/index';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries([
		'https://kakuyomu.jp/works/4852201425154898215',

//		'https://kakuyomu.jp/works/1177354054880238351',

		//'https://kakuyomu.jp/works/1177354054884214319',

//		'https://kakuyomu.jp/works/1177354054882154317',

	], async function (value, index, array)
	{
		await Site.download(value, {
			disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 1,

			//startIndex: 1,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

