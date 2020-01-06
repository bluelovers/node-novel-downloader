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

	await Promise.mapSeries([

//		'https://www.esjzone.cc/detail/1549069251.html',
//
//		'https://www.esjzone.cc/detail/1553655445.html',
//
//		'https://www.esjzone.cc/detail/1548762549.html',
//
//		'https://www.esjzone.cc/detail/1558630189.html',
//
//		'https://www.esjzone.cc/detail/1562435808.html',
//
//		'https://www.esjzone.cc/detail/1546323204.html',
//
//		'https://www.esjzone.cc/detail/1566804047.html',
//
//		'https://www.esjzone.cc/detail/1572969953.html',

		'https://www.esjzone.cc/detail/1546793005.html',

		'https://www.esjzone.cc/detail/1546060392.html',

		'https://www.esjzone.cc/detail/1563843171.html',

		'https://www.esjzone.cc/detail/1553499716.html',

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

