# novel-downloader

> novel downloader for node-novel style , include site ( dmzj / wenku8 / syosetu / ...etc )

`npm install novel-downloader`

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

## 站點支援

本套件支援多個小說網站的下載功能。各站點模組基於不同的核心實作：

- **Base 核心**：適用於傳統「卷 → 章節」結構的站點（如 wenku8、syosetu 等）
- **Tree 核心**：適用於複雜目錄結構的站點（如 kakuyomu、esjzone 等）

詳細的站點分類、實作方式說明與選擇指南，請參閱：

📖 **[站點模組分類說明](../../docs/SITE_MODULES_CLASSIFICATION.md)**

## link

* [node-novel](https://www.npmjs.com/search?q=node-novel)
