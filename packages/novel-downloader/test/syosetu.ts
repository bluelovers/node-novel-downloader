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

		'http://ncode.syosetu.com/n1745ct/',

		'https://ncode.syosetu.com/n3512ds/',

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
//		'http://ncode.syosetu.com/n7940cn/',

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

		'http://ncode.syosetu.com/n1592db/',

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

		'https://ncode.syosetu.com/n8577dn/',

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

		'https://ncode.syosetu.com/n3191eh/',

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

//		'http://ncode.syosetu.com/n5361em/',

//		'https://ncode.syosetu.com/n3670fe/',

//		'http://ncode.syosetu.com/n1828cs/',

//		'https://ncode.syosetu.com/n0170db/',

//		'https://ncode.syosetu.com/n8567do/',

//		'http://novel18.syosetu.com/n4233bh/',

//		'https://novel18.syosetu.com/n3271bm/',

		//'https://novel18.syosetu.com/n9598df/',

		//'http://ncode.syosetu.com/n9543bw/',

		//'https://ncode.syosetu.com/n9863da/',

//		'n7216dr',

//		'https://ncode.syosetu.com/n0406dr/ ',

//		'https://ncode.syosetu.com/n2682dy',

//		'https://ncode.syosetu.com/n3527ei/',

//		'https://ncode.syosetu.com/n3490ee/',

//		'https://ncode.syosetu.com/n8611bv/',

//		'https://ncode.syosetu.com/n2523fc/',

//		'http://ncode.syosetu.com/n7437dj',

		//'https://ncode.syosetu.com/n1976ey/',

//		'https://ncode.syosetu.com/n3059ch/',
//
//		'https://ncode.syosetu.com/n6774eh/',

//		'http://ncode.syosetu.com/n5490cq/',

//		'https://ncode.syosetu.com/n4764du/',

//		'http://ncode.syosetu.com/n8802bq/',

//		'http://novel18.syosetu.com/n7557y',

//		'https://ncode.syosetu.com/n7796fc/',

//		'https://ncode.syosetu.com/n4845ec/',
//
//		'https://ncode.syosetu.com/n4414ff/',
//
//		'https://ncode.syosetu.com/n7352fa/',

//		'https://ncode.syosetu.com/n8611bv/',

//		'https://ncode.syosetu.com/n1586by/',

//		'https://novel18.syosetu.com/n3746ce/',

//		'https://ncode.syosetu.com/n8517en/',

//		'http://ncode.syosetu.com/n5361em/',

//		'https://ncode.syosetu.com/n8216dt/',

//		'https://ncode.syosetu.com/n2771dw',

//		'https://novel18.syosetu.com/n7437du/',
//
//		'http://novel18.syosetu.com/n4381dp/',

//		'n4719ff',

//		'https://ncode.syosetu.com/n0442em/',

//		'https://ncode.syosetu.com/n3139du/',

//		'https://ncode.syosetu.com/n2052ez/',
//
//		'n4191cj',
//
//		'https://ncode.syosetu.com/n6308dg/',
//
//		'n0463dq',

//		'n3956eq',

//		'https://ncode.syosetu.com/n0388ee/',

//		'https://ncode.syosetu.com/n4191cj/',

//		'https://ncode.syosetu.com/n9188eg/',

//		'https://ncode.syosetu.com/n2129ei/',

//		'https://ncode.syosetu.com/n4006r/',

//		'n7374dz',

//		'https://ncode.syosetu.com/n1563fd/',

//		'https://ncode.syosetu.com/n9475bv/',

//		'https://ncode.syosetu.com/n0074eg',

//		'https://ncode.syosetu.com/n2276dz/',

//		'n6247cr',

//		'https://ncode.syosetu.com/n4236dr/',

//		'http://ncode.syosetu.com/n6583dj/',

//		'https://novel18.syosetu.com/n4848da/',

//		'n3487fe',

//		'http://ncode.syosetu.com/n7796fc/',

//		'http://ncode.syosetu.com/n6613ck/',

//		'http://ncode.syosetu.com/n7352fa/',

//		'http://novel18.syosetu.com/n6061cm/',

//		'https://ncode.syosetu.com/n6116dk/',

		'https://ncode.syosetu.com/n3148ex/',

//		'http://ncode.syosetu.com/n6849da/',

//		'http://ncode.syosetu.com/n5529cy/',

//		'https://novel18.syosetu.com/n8321do/',

		'http://ncode.syosetu.com/n1896dc/',

//		'http://ncode.syosetu.com/n1745ct/',

		'https://ncode.syosetu.com/n4912do/',

//		'https://ncode.syosetu.com/n2360eu/',

//		'https://novel18.syosetu.com/n8176ca/',

//		'n1695cq',
//
//		'http://ncode.syosetu.com/n0708cs/',
//
//		'https://ncode.syosetu.com/n2654ev/',
//		'https://ncode.syosetu.com/n7857eu/',
//
//		'https://ncode.syosetu.com/n3170ed/',
//		'https://ncode.syosetu.com/n5298fh/',
//
		'http://ncode.syosetu.com/n4072er',

//		'n7787eq',
//
//		'https://ncode.syosetu.com/n6621fl',

//		'https://ncode.syosetu.com/n4029bs/',
//
//		'https://ncode.syosetu.com/n2665dw/',
//
		'https://ncode.syosetu.com/n5694fk/',

//		'http://ncode.syosetu.com/n4936dp/',

//		'http://ncode.syosetu.com/n8340dj/',

//		'http://ncode.syosetu.com/n9788dp',

//		'http://ncode.syosetu.com/n8541cr/',

		//'https://ncode.syosetu.com/n2027ci/',

//		'https://ncode.syosetu.com/n8864fc',
//
//		'http://ncode.syosetu.com/n2163n/',
//
//		'https://ncode.syosetu.com/n1619dr/',
//
//		'https://ncode.syosetu.com/n6093en/',

		'https://ncode.syosetu.com/n1321ez/',

//		'https://ncode.syosetu.com/n6339do/',

		'https://ncode.syosetu.com/n4942cw/',

		'http://ncode.syosetu.com/n9016cm/',

		'https://ncode.syosetu.com/n1785ek/',

		'https://ncode.syosetu.com/n7709cn',

		'https://ncode.syosetu.com/n1474fh/',

		'http://ncode.syosetu.com/n3771ci/',

		'https://ncode.syosetu.com/n5298fh/',

		'https://ncode.syosetu.com/n8304fa/',

		'https://ncode.syosetu.com/n3097fl/',

		'https://ncode.syosetu.com/n8618ef/',

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

