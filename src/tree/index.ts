/**
 * Created by user on 2018/4/2/002.
 */

import { Tree, ListToTree, Node, TreeToList } from 'js-tree-list2';
import { URL } from 'jsdom-url';
import { isUndef, minifyHTML, trim } from '../util';
import * as shortid from 'shortid';

export type ITreeID = string | number;

export type TreeNode<T = IRowRoot | IRowVolume | IRowChapter> = Node<T>;

export interface ITree
{
	level?: number,
	type?: string,

	total_idx?: number,
	idx?: number,

	name?: string;
}

export type IRowVolume<T = {}> = T & ITree & {
	type?: 'volume',

	volume_index?: string | number,
	volume_title: string,

	dirname?: string;
	volume_level?: string | number,
};

export type IRowChapter<T = {}> = T & ITree & {
	type?: 'chapter',

	chapter_index?: string | number,
	chapter_title: string,

	chapter_id?: string | number,
	chapter_url?: URL,
	chapter_url_data?,
	chapter_date?,

	path?: string;
};

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
		depth?: number,
	} = {
		depth: 0,
	};

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


	static isVolume(node: Node): node is Node<IRowVolume>
	static isVolume(node: IRowVolume): node is IRowVolume
	static isVolume(node)
	{
		if (node instanceof Node)
		{
			return (node.get('type') == 'volume') ? node : null;
		}

		return (node.type == 'volume') ? node : null;
	}

	static isChapter(node: Node): node is Node<IRowChapter>
	static isChapter(node: IRowChapter): node is IRowChapter
	static isChapter(node)
	{
		if (node instanceof Node)
		{
			return (node.get('type') == 'chapter') ? node : null;
		}

		return (node.type == 'chapter') ? node : null;
	}

	protected _fixRow<U extends Node<IRowVolume | IRowChapter>>(node: U)
	{
		let level = node.parent.get<number>('level') + 1;

		this.cache.depth = Math.max(this.cache.depth, level);

		node.set('level', level);
		let name: string;

		switch (node.get('type'))
		{
			case 'chapter':
				name = trim(node.get<string>('chapter_title'), true);

				node.set('chapter_title', name);
				node.set('name', name);
				break;
			case 'volume':
				name = trim(node.get<string>('volume_title'), true);

				node.set('volume_title', name);
				node.set('name', name);
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

	toJSON()
	{
		return this.tree.root().toJSON();
	}

	static treeToList(novelTree: NovelTree, linkNode?: boolean)
	{
		let list = TreeToList<{}, IRowRoot | IRowVolume | IRowChapter>(novelTree.tree, linkNode);
		return list;
	}
}

export default NovelTree;
