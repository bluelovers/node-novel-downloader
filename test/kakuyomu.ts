/**
 * Created by user on 2017/12/29/029.
 */

import NovelSite from '../src/site/kakuyomu';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	[
		//'https://kakuyomu.jp/works/4852201425154898215',

		'https://kakuyomu.jp/works/1177354054880238351',

	].forEach(async function (value, index, array)
	{
		await Site.download(value, {
			disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			startIndex: 0,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

