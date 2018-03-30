/**
 * Created by user on 2017/12/29/029.
 */

import NovelSite from '../src/site/sfacg';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	[
		'http://book.sfacg.com/Novel/120483/MainIndex/',

	].forEach(async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 3,

			disableCheckExists: true,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();

