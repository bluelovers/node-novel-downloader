# novel-downloader

> novel site downloader ( dmzj / wenku8 / syosetu )

`npm install novel-text`

## demo

see [test](test)

```ts
import NovelSiteSyosetu from 'novel-downloader/src/site/syosetu';


(async () =>
{

	const Site = new NovelSiteSyosetu({
		outputDir: './temp',
	});

	console.log(Site);

	[
		//'https://novel18.syosetu.com/n1413cw/',
	
		'n6006cw',

	].forEach(async function (value, index, array)
	{
		await Site.download(value, {
			//disableTxtdownload: true,
			//disableDownload: true,

			//noFirePrefix: true,
			//noFilePadend: true,
		}).then(function (novel)
		{
			console.log(novel);

			console.log(novel.novel_title);
		})
		;
	});

})();
```

## link

* [node-novel](https://www.npmjs.com/search?q=node-novel)
