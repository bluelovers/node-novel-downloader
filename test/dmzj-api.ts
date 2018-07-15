/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSiteClass from '../src/site/dmzj/api';
import ProjectConfig from '../_root';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSiteClass({
		outputDir: ProjectConfig.tempPath,
	});

	console.log(Site);

	Promise.mapSeries([

		'http://v2.api.dmzj.com/novel/2229.json',
		//'http://v2.api.dmzj.com/novel/download/2229_8303_69136.txt',

	],async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

//			noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 4,

			startIndex: 1,

			//disableCheckExists: true,

			//fetchMetaDataOnly: true,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

