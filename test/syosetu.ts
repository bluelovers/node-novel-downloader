/**
 * Created by user on 2017/12/29/029.
 */

import NovelSiteSyosetu from '../src/site/syosetu';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSiteSyosetu({
		outputDir: './temp',
	});

	console.log(Site);

	[
		//
		//'https://ncode.syosetu.com/n1110eb/',
		//'http://ncode.syosetu.com/n4805cx/',

		//'http://ncode.syosetu.com/n1745ct/',

		//'https://ncode.syosetu.com/n3512ds/',

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

		//'n2027de',

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

		'http://ncode.syosetu.com/n6337cb/',

	].forEach(async function (value, index, array)
	{
		await Site.download(value, {
			disableTxtdownload: true,
			disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			startIndex: 1,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

