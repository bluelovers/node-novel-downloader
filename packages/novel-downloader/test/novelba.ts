/**
 * Created by user on 2017/12/29/029.
 */

import Promise from 'bluebird'
import NovelSite from '../src/site/novelba/index';

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries([

		'https://novelba.com/works/851684',

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

