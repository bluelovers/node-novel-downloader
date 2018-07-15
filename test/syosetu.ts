/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSiteSyosetu from '../src/site/syosetu';
import ProjectConfig from '../_root';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSiteSyosetu({
		outputDir: ProjectConfig.tempPath,
	});

	console.log(Site);

	Promise.mapSeries([
		//
		//'https://ncode.syosetu.com/n1110eb/',
		//'http://ncode.syosetu.com/n4805cx/',

		//'http://ncode.syosetu.com/n1745ct/',

//		'https://ncode.syosetu.com/n3512ds/',

		//'https://novel18.syosetu.com/n1413cw/',

		//'https://ncode.syosetu.com/n4842df/',
		//'https://ncode.syosetu.com/n8697cx/',
		//'http://ncode.syosetu.com/n5645ci/',

		//'http://ncode.syosetu.com/n3512ds/',

		//'http://ncode.syosetu.com/n8125cd/',

		//'http://ncode.syosetu.com/n4128bn/',

		//'n7933eb',

		//'n8514bp',

		//'n6789do',

		//'n6006cw',

//		'n2027de',

		//'n9055cl',

		//'n1354dw',

		//'n5705ch',
		//'http://novel18.syosetu.com/n9119ci/',

		//'http://ncode.syosetu.com/n1678cx/',

		//'https://ncode.syosetu.com/n6990ch/',

		//'http://ncode.syosetu.com/n9814bu/',

		//'http://ncode.syosetu.com/n6778x/',

		//'http://ncode.syosetu.com/n4449cj/',

//		'http://ncode.syosetu.com/n1721cj/',

//		'http://ncode.syosetu.com/n8162cb/',

//		'http://ncode.syosetu.com/n6337cb/',

		//'http://ncode.syosetu.com/n5361em',

		//'http://ncode.syosetu.com/n3219ck/',

		//'http://ncode.syosetu.com/n4696dd/',

		//'https://ncode.syosetu.com/n1406cr/',

		//'http://ncode.syosetu.com/n9442cw/',
		//'https://ncode.syosetu.com/n7971ec/',

		//'https://ncode.syosetu.com/n1110eb/',
//		'http://novel18.syosetu.com/n2794ec/',

		//'http://ncode.syosetu.com/n1980bm/',
//		'http://ncode.syosetu.com/n7940cn/',

		//'http://ncode.syosetu.com/n0612dm/',

		//'n5991bu',

		//'http://ncode.syosetu.com/n2627t/',

		//'http://ncode.syosetu.com/n0089bk/',

		//'http://ncode.syosetu.com/n4434cx/',

		//'https://ncode.syosetu.com/n0822cl/',

//		'https://ncode.syosetu.com/n1132dk/',

//		'n4399ci',
//		'n4805cx',

//		'http://ncode.syosetu.com/n1898i/',

//		'http://ncode.syosetu.com/n3701cp',

		'https://novel18.syosetu.com/n0153ce/',

	],async function (value, index, array)
	{
		await Site.download(value, {
			disableTxtdownload: true,
			disableDownload: true,

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

