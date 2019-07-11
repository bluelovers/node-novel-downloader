/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/esjzone/index';

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',

		debugLog: true,
	});

	console.log(Site);

	Promise.mapSeries([

		'https://www.esjzone.cc/detail/1549069251.html',

	], async function (value, index, array)
	{
		await Site.download(value, {
//			disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 1,

//			disableCheckExists: true,

			//startIndex: 1,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

