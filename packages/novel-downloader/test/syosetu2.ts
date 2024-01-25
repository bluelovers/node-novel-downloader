/**
 * Created by user on 2017/12/29/029.
 */

import Promise from 'bluebird'
import NovelSiteSyosetu, { EnumProtocolMode } from '../src/site/syosetu/index';
import ProjectConfig from '../_root';
import path from 'path';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSiteSyosetu({
		outputDir: ProjectConfig.tempPath,
	});

	console.log(Site);

	Promise.mapSeries([

//		'https://ncode.syosetu.com/n3711cs/',

//		'https://ncode.syosetu.com/n5191ey/',
//		'https://ncode.syosetu.com/n7933eb/',

//		'https://novel18.syosetu.com/n6111fe/',

//		'http://novel18.syosetu.com/n3640eg/',

//		'n8792em',

//		'http://ncode.syosetu.com/n5964cj/',
//
//		'https://ncode.syosetu.com/n0865em',

		'https://ncode.syosetu.com/n9551ee',

	],async function (value, index, array)
	{
		await Site.download(value, {
			disableTxtdownload: true,
//			disableDownload: true,

//			noFirePrefix: true,
			noFilePadend: true,

//			filePrefixMode: 3,
//			filePrefixMode: 4,
			filePrefixMode: 1,

//			startIndex: 0,
			startIndex: 1,

			//disableCheckExists: true,

			//fetchMetaDataOnly: true,

			outputDir: path.join(__dirname, 'temp2'),

			keepFormat: true,
			keepRuby: true,
			keepImage: true,

			debugLog: true,

			protocolMode: EnumProtocolMode.HTTPS,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

