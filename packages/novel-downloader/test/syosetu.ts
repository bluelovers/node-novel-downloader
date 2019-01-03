/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSiteSyosetu from '../src/site/syosetu/index';
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

//		'n1354dw',

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
		//'http://ncode.syosetu.com/n7940cn/',

		//'http://ncode.syosetu.com/n0612dm/',

		//'n5991bu',

//		'http://ncode.syosetu.com/n2627t/',

//		'http://ncode.syosetu.com/n0089bk/',

		//'http://ncode.syosetu.com/n4434cx/',

		//'https://ncode.syosetu.com/n0822cl/',

//		'https://ncode.syosetu.com/n1132dk/',

//		'n4399ci',
//		'n4805cx',

//		'http://ncode.syosetu.com/n1898i/',

//		'http://ncode.syosetu.com/n3701cp',

		//'https://novel18.syosetu.com/n0153ce/',

//		'http://novel18.syosetu.com/n6426w/',

//		'n8697cx',
//		'n9795dx',

//		'https://ncode.syosetu.com/n1075eh/',

//		'https://ncode.syosetu.com/n6887dt/',

//		'https://ncode.syosetu.com/n5963et/',

//		'https://ncode.syosetu.com/n8961ch/',

		//'http://ncode.syosetu.com/n2100di',

		//'http://ncode.syosetu.com/n6673cu',

		//'https://ncode.syosetu.com/n5943db/',

		//'http://ncode.syosetu.com/n2435cr',

		//'http://ncode.syosetu.com/n1592db/',

		//'https://ncode.syosetu.com/n2880eh/',

		//'http://ncode.syosetu.com/n3475df/',

		//'http://ncode.syosetu.com/n7467er/',

//		'http://ncode.syosetu.com/n6683ej/',
		//'https://ncode.syosetu.com/n2123do/',

//		'https://ncode.syosetu.com/n3462bz',
//		'https://ncode.syosetu.com/n0611em/',

		//'http://ncode.syosetu.com/n6829bd/',

		//'http://ncode.syosetu.com/n4269cp/',

		//'http://ncode.syosetu.com/n0597ea/',

		//'https://ncode.syosetu.com/n1578dx/',

		//'http://ncode.syosetu.com/n0878cb/',

		//'https://ncode.syosetu.com/n4468cs/',

		//'https://ncode.syosetu.com/n5864cn/',

//		'https://ncode.syosetu.com/n6517bw/',

		//'https://ncode.syosetu.com/n9565dj/',

		//'https://ncode.syosetu.com/n9170dm/',

		//'http://ncode.syosetu.com/n4760cl/',

		//'http://ncode.syosetu.com/n4227bh/',

//		'https://ncode.syosetu.com/n6049cc/',

		//'https://ncode.syosetu.com/n0607dl/',

		//'https://ncode.syosetu.com/n5947eg/',

//		'https://novel18.syosetu.com/n3640eg/',

//		'https://ncode.syosetu.com/n9759dd/',

		//'https://ncode.syosetu.com/n3527ei/',

		//'https://ncode.syosetu.com/n5391ci/',

		//'http://ncode.syosetu.com/n2215by/',

		//'http://ncode.syosetu.com/n6022cs/',

		//'http://ncode.syosetu.com/n2125db/',

		//'https://ncode.syosetu.com/n7105co/',

//		'http://ncode.syosetu.com/n6993ds/',

//		'https://ncode.syosetu.com/n3722ev/',

		//'https://ncode.syosetu.com/n8577dn/',

		//'http://ncode.syosetu.com/n1136bt/',

		//'https://ncode.syosetu.com/n6266dl/',

		//'https://ncode.syosetu.com/n4404ew/',

		//'https://ncode.syosetu.com/n3959cn/',

		//'https://ncode.syosetu.com/n8756en/',

//		'http://ncode.syosetu.com/n6247dd/',

		//'https://ncode.syosetu.com/n7144ds/',

		//'http://ncode.syosetu.com/n4701bs/',

		//'https://ncode.syosetu.com/n0738ed/',

//		'https://ncode.syosetu.com/n1489eq/',
//		'https://ncode.syosetu.com/n8366dn/',

//		'https://ncode.syosetu.com/n4679do',

		//'n8109cq',

		//'https://ncode.syosetu.com/n8515dc/',

//		'https://ncode.syosetu.com/n3668ef/',

//		'https://ncode.syosetu.com/n2671do/',

//		'https://ncode.syosetu.com/n7975cr/',

//		'https://ncode.syosetu.com/n9107ee/',

//		'http://novel18.syosetu.com/n7623br/',

//		'https://ncode.syosetu.com/n3191eh/',

		//'https://ncode.syosetu.com/n4045ed/',

//		'http://ncode.syosetu.com/n2031cu/',

//		'https://ncode.syosetu.com/n9057cv/',

//		'https://novel18.syosetu.com/n4497bb/',

//		'https://ncode.syosetu.com/n2056dn/',

//		'https://ncode.syosetu.com/n5691dd/',

//		'n4344dy',

//		'n7637dj',

//		'https://ncode.syosetu.com/n7707dt/',

//		'http://ncode.syosetu.com/n1853cj/',

//		'https://ncode.syosetu.com/n7551bn/',
//		'https://ncode.syosetu.com/n5240bc/',

//		'http://ncode.syosetu.com/n4202cb/',

//		'http://ncode.syosetu.com/n9551cp/',

//		'http://ncode.syosetu.com/n1611bg/',

		'http://ncode.syosetu.com/n5361em/',


	],async function (value, index, array)
	{
		await Site.download(value, {
			disableTxtdownload: true,
			disableDownload: true,

//			noFirePrefix: true,
			noFilePadend: true,

//			filePrefixMode: 3,
//			filePrefixMode: 4,
			filePrefixMode: 1,

//			startIndex: 0,
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

