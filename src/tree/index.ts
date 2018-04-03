/**
 * Created by user on 2018/4/2/002.
 */

import { Tree, ListToTree, Node, TreeToList } from 'js-tree-list2';
import { URL } from 'jsdom-url';
import { isUndef, minifyHTML, trim } from '../util';
import * as shortid from 'shortid';

export type ITreeID = string | number;

export interface ITree
{
	level?: number,
	type?: string,
}

export type IRowVolume<T = {}> = ITree & {
	type?: 'volume',

	volume_index?: string | number,
	volume_title: string,
} & T;

export type IRowChapter<T = {}> = ITree & {
	type?: 'chapter',

	chapter_index?: string | number,
	chapter_title: string,

	chapter_id?: string | number,
	chapter_url?: URL,
	chapter_url_data?,
	chapter_date?,
} & T;

export type IRowRoot<T = {}> = ITree & {
	type?: 'root',
} & T;

export type IRowNovel = IRowVolume | IRowChapter;

export class NovelTree
{
	tree: Tree<IRowRoot | IRowVolume | IRowChapter>;

	cache: {
		lastVolume?: Node<IRowVolume>,
		lastChapter?: Node<IRowChapter>,
	} = {};

	constructor(initData: Partial<IRowRoot> = {})
	{
		initData.type = 'root';
		initData.level = 0;

		this.tree = new Tree(initData as IRowRoot);
	}

	root()
	{
		return this.tree.root();
	}

	addVolume<U extends IRowVolume>(value: U, root?: Node)
	{
		value.type = 'volume';

		let node: Node<U>;

		if (root)
		{
			node = this._getRoot(root).add(value);
		}
		else
		{
			node = this.tree.root().add(value);
		}

		this._fixRow(node);

		this.cache.lastVolume = node;

		return node;
	}

	addChapter<U extends IRowChapter>(value: U, root?: Node)
	{
		value.type = 'chapter';

		let node: Node<U>;

		if (root)
		{
			node = this._getRoot(root).add(value);
		}
		else
		{
			node = this.tree.root().add(value);
		}

		this._fixRow(node);

		this.cache.lastChapter = node;

		return node;
	}

	protected _fixRow<U extends Node<IRowVolume | IRowChapter>>(node: U)
	{
		node.set('level', node.parent.get<number>('level') + 1);

		switch (node.get('type'))
		{
			case 'chapter':
				node.set('chapter_title', trim(node.get<string>('chapter_title'), true));
				break;
			case 'volume':
				node.set('volume_title', trim(node.get<string>('volume_title'), true));
				break;
		}

		return node;
	}

	protected _getRoot<U extends Node<IRowRoot | IRowVolume | IRowChapter>>(root: U)
	{
		if (!(root instanceof Node))
		{
			throw new TypeError()
		}

		if (root.get('type') == 'chapter')
		{
			throw new Error()
		}

		return root;
	}

	static treeToList(novelTree: NovelTree)
	{
		let list = TreeToList(novelTree.tree);
		return list;
	}
}

export default NovelTree;
