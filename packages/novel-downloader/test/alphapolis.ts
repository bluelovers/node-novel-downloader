/**
 * Created by user on 2017/12/29/029.
 */

import Promise from 'bluebird'
import NovelSite from '../src/site/alphapolis/index';
import ProjectConfig from '../_root';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: ProjectConfig.tempPath,
	});

	console.log(Site);

	Promise.mapSeries([
//		'https://www.alphapolis.co.jp/novel/979291234/759157420',

		'https://www.alphapolis.co.jp/novel/675104537/65069615',

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

