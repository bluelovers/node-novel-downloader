/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/novelup/index';

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',

		debugLog: true,
	});

	console.log(Site);

	await Promise.mapSeries([

		'https://novelup.plus/story/796116755',

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

