/**
 * Created by user on 2017/12/29/029.
 */

import * as Promise from 'bluebird';
import NovelSite from '../src/site/wenku8/index';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	const Site = new NovelSite({
		outputDir: './temp',
	});

	console.log(Site);

	Promise.mapSeries([

		//'http://www.wenku8.com/novel/2/2283/index.htm',
//		'http://www.wenku8.com/novel/0/173/index.htm',

//		'http://www.wenku8.com/book/2388.htm',

//		'http://www.wenku8.com/book/2392.htm',

		//'http://www.wenku8.com/novel/2/2249/index.htm',
		//'http://www.wenku8.com/book/2377.htm',

		//'http://www.wenku8.com/novel/2/2242/index.htm',

//		'http://www.wenku8.com/novel/1/1592/index.htm',

//		'https://www.wenku8.net/novel/2/2115/index.htm',

//		'https://www.wenku8.net/book/2519.htm',

//		'https://www.wenku8.net/novel/2/2284/index.htm',

		'https://www.wenku8.net/novel/2/2518/index.htm',
		'https://www.wenku8.net/novel/2/2080/index.htm',
		'https://www.wenku8.net/book/855.htm',
		'https://www.wenku8.net/book/2390.htm',
		'https://www.wenku8.net/book/2506.htm',
		'https://www.wenku8.net/book/2449.htm',

		'https://www.wenku8.net/book/2467.htm',


	],async function (value, index, array)
	{
		await Site.download(value, {
			//disableDownload: true,

			//noFirePrefix: true,
			noFilePadend: true,

			filePrefixMode: 4,

			//disableCheckExists: true,

			startIndex: 1,

		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();
