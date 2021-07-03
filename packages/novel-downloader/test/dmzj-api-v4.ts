/**
 * Created by user on 2017/12/29/029.
 */

import Promise from 'bluebird'
import { join } from 'upath2';
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

		2784,

	],async function (value, index, array)
	{
		await Site.download(value.toString(), {
			//disableDownload: true,

//			noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 4,

			startIndex: 1,

			//disableCheckExists: true,

			//fetchMetaDataOnly: true,

			outputDir: join(__dirname, 'temp-dmzj-v4'),

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

