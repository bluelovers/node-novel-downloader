/**
 * Created by user on 2018/4/4/004.
 */

export * from './base';
import _NovelSiteBase, { IDownloadOptions, IOptionsRuntime as _IOptionsRuntime, INovel as _INovel } from './base';

import { getFilePath } from '../fs';
import _NovelSite, { IChapter, PromiseBluebird, staticImplements, SYMBOL_CACHE } from '../index';
import * as path from 'upath2';

import { normalize_val } from 'node-novel-globby/lib/helper';
import { defaultSortCallback } from 'node-novel-globby/lib/sort';

import fs, {} from 'fs-iconv';
import novelText from 'novel-text';
import { URL } from 'jsdom-url';

import { SYMBOL_NODE } from 'js-tree-list2/src/utils';

import { IRowChapter, IRowVolume, NovelTree, TreeNode, ITree } from '../../tree/index';

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

		console.log(novel.novelTree.cache.depth);

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

				if (hasChild && !optionsRuntime.noFirePrefix && optionsRuntime.filePrefixMode >= 2)
				{
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
								console.log(k);

								bool = true;
								break;
							}
						}

						i++;
						last_val = name_val;
					}

					if (bool)
					{
						console.log(bool, ks);
					}
					else
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
				}

				if (hasChild)
				{
					let dirname: string;

					console.log(ntype);

					if (ntype == 'root')
					{
						dirname = '';
						pnode.set('dirname', dirname);
					}
					else
					{
						let ps = pnode.parent.get('dirname');
						dirname = path.join(pnode.parent.get('dirname'), pnode.get('name'));
						pnode.set('dirname', dirname);
					}

					console.log(dirname);
				}
			})
		;

		process.exit();

		return treeList;
	}

	async _processNovel<T>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
		url: URL,
		path_novel: string,
	}, ...argv)
	{
		const self = this;
		let idx = optionsRuntime.startIndex || 0;

		let { url, path_novel } = _cache_;

		let treeList = self._processNovelListName(novel, optionsRuntime, _cache_, ...argv);

		return PromiseBluebird
			.mapSeries(treeList, function (listRow)
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

				let dirname: string;

				{
					let ps = nodeChapter.parents() as any as TreeNode<IRowVolume>[];
					ps.pop();

					dirname = ps.reduceRight(function (a, node)
					{
						let name = node.value().name as string;

						if (!name)
						{
							throw Error()
						}

						a.push(name);

						return a;
					}, []).join('/');

					if (!dirname)
					{
						throw Error()
					}
				}
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
