/**
 * Created by user on 2017/12/29/029.
 */

import { download } from '../src/site/syosetu';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	[
		//
		//'https://ncode.syosetu.com/n1110eb/',
		//'http://ncode.syosetu.com/n4805cx/',

		//'http://ncode.syosetu.com/n1745ct/',
		'https://ncode.syosetu.com/n3512ds/',

	].forEach(async function (value, index, array)
	{
		await download(value, {
			disableTxtdownload: true,
			disableDownload: true,
		}).then(function (novel)
		{
			console.log(novel.novel_title);
		});
	});

})();

