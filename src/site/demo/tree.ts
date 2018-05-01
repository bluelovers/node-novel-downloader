/**
 * Created by user on 2018/4/4/004.
 */

export * from './base';
import _NovelSiteBase, { IDownloadOptions, IOptionsRuntime as _IOptionsRuntime, INovel as _INovel } from './base';

import { getFilePath, getVolumePath } from '../fs';
import _NovelSite, { IChapter, PromiseBluebird, staticImplements, SYMBOL_CACHE } from '../index';
import * as path from 'upath2';

import { normalize_val } from 'node-novel-globby/lib/helper';
import { defaultSortCallback } from 'node-novel-globby/lib/sort';

import fs, {} from 'fs-iconv';
import novelText from 'novel-text';
import { URL } from 'jsdom-url';

import { SYMBOL_NODE } from 'js-tree-list2/src/utils';

import { IRowChapter, IRowVolume, NovelTree, TreeNode, ITree, ITreeToList } from '../../tree/index';

export { NovelTree }

export type IOptionsRuntime = _IOptionsRuntime & {
	novelTree?: NovelTree,
}

export type INovel = _INovel & {
	novelTree?: NovelTree,
}

@staticImplements<_NovelSite.INovelSiteStatic<NovelSiteDemo>>()
export class NovelSiteDemo extends _NovelSiteBase
{
	getOutputDir<T extends IOptionsRuntime & IDownloadOptions>(options: T, novelName?: string): [string, T]
	{
		const [PATH_NOVEL_MAIN, optionsRuntime] = super.getOutputDir<T>(options, novelName);

		optionsRuntime.novelTree = new NovelTree();

		return [PATH_NOVEL_MAIN, optionsRuntime];
	}

	protected async _processNovelListName(novel: INovel, optionsRuntime: IOptionsRuntime, ...argv)
	{
		const self = this;
		let treeList = NovelTree.treeToList(novel.novelTree, true);

		//console.log(novel.novelTree.cache.depth);

		if (novel.novelTree.cache.depth > 2)
		{
			let bool = false;
			if (optionsRuntime.noDirPrefix && optionsRuntime.noFirePrefix)
			{
				bool = true;
			}

			optionsRuntime.noDirPrefix = optionsRuntime.noFirePrefix = bool;
		}

		treeList
			.forEach(function (listRow)
			{
				let node = listRow[SYMBOL_NODE] as TreeNode<IRowChapter | IRowVolume>;

				let value = node.value() as IRowChapter | IRowVolume;

				if (typeof value.name == 'string')
				{
					node.set('name', self.trimFilenameVolume(value.name));
				}
			})
		;

		treeList
			.forEach(function (listRow)
			{
				let pnode = listRow[SYMBOL_NODE] as TreeNode;
				const ntype = pnode.get<string>('type');

				const hasChild = pnode.size();

				const currentLevel = pnode.get<number>('level');

				//console.log(currentLevel);
				//console.log(ntype);

				if (ntype != 'root')
				{
					let name = pnode.get<string>('name');
					if (name === null)
					{
						pnode.set('name', 'null');
					}
				}

				if (hasChild && (
						0 && (currentLevel == 0 && !optionsRuntime.noDirPrefix)
						|| (currentLevel > 0 && !optionsRuntime.noFirePrefix)
					) && optionsRuntime.filePrefixMode >= 2)
				{
					//console.log(777);

					let bool: boolean;
					let i: number = 0;
					let last_val: string;

					let ks: string[] = [];

					for (let node of pnode.children)
					{
						let name = node.get<string>('name');
						let name_val = normalize_val(name);

						node.set('name_val', name_val);

						ks.push(name_val);

						if (name === null || name == 'null')
						{
							node.set('name', 'null');
							node.set('name_val', 'null');

							bool = true;
							break;
						}

						if (i !== 0)
						{
							let k = defaultSortCallback(last_val, name_val);

							if (typeof k != 'number' || k > -1)
							{
								//console.log(k);

								bool = true;
								break;
							}
						}

						i++;
						last_val = name_val;
					}

					if (!bool)
					{
						for (let node of pnode.children)
						{
							if (NovelTree.isVolume(node))
							{
								node.value().volume_index = '';
							}
							else if (NovelTree.isChapter(node))
							{
								node.value().chapter_index = '';
							}
						}
					}
					else
					{

					}
				}

				if (hasChild)
				{
					pnode.children.forEach(function (node, idx)
					{
						node.set('idx', idx);
					});
				}

				if (hasChild)
				{
					let dirname: string;

					if (ntype == 'root')
					{
						dirname = '';
						pnode.set('dirname', dirname);
					}
					else
					{
						let name = pnode.get('name');
						let volume = pnode.value() as IRowVolume;
						let vid = volume.idx;

						let fake_chapter: IRowChapter = {
							chapter_index: volume.volume_index,
							chapter_title: volume.volume_title,
						};

						/*
						name = getVolumePath(self, {
							volume,
							vid,
							path_novel: '',
						}, optionsRuntime);
						*/
						name = getFilePath(self, {
							chapter: fake_chapter, cid: vid,
							ext: '',

							idx: volume.total_idx + optionsRuntime.startIndex,

							dirname: '~temp',
							volume, vid,
						}, optionsRuntime);

						name = path.relative('~temp', name);

						let ps = pnode.parent.get('dirname');
						dirname = path.join(ps, name);
						pnode.set('dirname', dirname);
					}

					//console.log(dirname);
				}
			})
		;

		//process.exit();

		return treeList;
	}

	async _processNovel<T>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
		url: URL,
		path_novel: string,
	}, ...argv)
	{
		const self = this;

		let { url, path_novel } = _cache_;

		let treeList = await self._processNovelListName(novel, optionsRuntime, _cache_, ...argv);

		//console.log(optionsRuntime);

		return PromiseBluebird
			.mapSeries(treeList.slice(1), async function (listRow)
			{
				let nodeChapter = listRow[SYMBOL_NODE] as TreeNode<IRowChapter>;
				let ntype = nodeChapter.get('type');

				if (ntype != 'chapter')
				{
					if (ntype == 'volume')
					{
						nodeChapter.set('name', self.trimFilenameVolume(nodeChapter.get('volume_title')));
					}

					return;
				}
				else
				{
					nodeChapter.set('name', self.trimFilenameVolume(nodeChapter.get('chapter_title')));
				}

				let nodeVolume = nodeChapter.parent as any as TreeNode<IRowVolume>;

				let volume = nodeVolume.value() as IRowVolume;
				let chapter = nodeChapter.value() as IRowChapter;

				let dirname = volume.dirname;

				let cid = chapter.idx;
				let vid = volume.idx;

				const current_idx = chapter.total_idx + optionsRuntime.startIndex;

				let file = getFilePath(self, {
					chapter, cid,
					ext: '.txt',

					idx: current_idx,

					dirname,
					volume, vid,
				}, optionsRuntime);

				chapter.path = file;

				file = path.join(path_novel, file);

				if (self._checkExists(optionsRuntime, file))
				{
					return file;
				}

				let url = self._createChapterUrl({
					novel,
					volume,
					chapter,
				}, optionsRuntime);

				await self._fetchChapter(url, optionsRuntime)
					.then(function (ret)
					{
						return self._parseChapter(ret, optionsRuntime, {
							file,
							novel,
							volume,
							chapter,
						});
					})
					.then(function (text)
					{
						if (typeof text == 'string')
						{
							return novelText.toStr(text);
						}

						return text;
					})
					.then(async function (text: string)
					{
						await fs.outputFile(file, text);

						return text;
					})
				;

				return file;
			})
			.then(function (ret)
			{
				return ret as any as T;
			})
			;
	}

	protected _saveReadme(optionsRuntime: IOptionsRuntime, options = {}, ...opts)
	{
		let novel = optionsRuntime[SYMBOL_CACHE].novel;

		if (novel.novelTree)
		{
			const novelTree = novel.novelTree;

			novel.novelTree = novelTree.toJSON();
		}

		return super._saveReadme(optionsRuntime, options, ...opts);
	}
}

export const NovelSite = NovelSiteDemo as typeof NovelSiteDemo;
export default NovelSiteDemo;
