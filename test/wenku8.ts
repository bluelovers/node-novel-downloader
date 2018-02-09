/**
 * Created by user on 2017/12/29/029.
 */

import { download } from '../src/site/wenku8';

//download('http://www.wenku8.com/modules/article/articleinfo.php?id=1596');

(async () =>
{

	[

		'http://www.wenku8.com/book/2290.htm',

	].forEach(async function (value, index, array)
	{
		await download(value).then(function (novel)
		{
			console.log(novel.novel_title);
		});
	});

})();
