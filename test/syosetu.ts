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

		'n6006cw',

	].forEach(async function (value, index, array)
	{
		await Site.download(value, {
			disableTxtdownload: true,
			disableDownload: true,

			noFirePrefix: true,
			noFilePadend: true,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

