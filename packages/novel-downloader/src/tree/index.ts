/**
 * 小说树形结构管理类
 * Novel tree structure management class
 * 
 * 该文件定义了小说树形结构的数据类型和管理类，用于组织小说的卷（Volume）和章节（Chapter）层次结构
 * This file defines the data types and management class for the novel tree structure, 
 * which is used to organize the hierarchical structure of novel volumes and chapters.
 * 
 * Created by user on 2018/4/2/002.
 */

import { Tree, ListToTree, Node, TreeToList, ITreeToList } from 'js-tree-list2';
//import { URL } from 'jsdom-url';
import { IChapter, IVolume } from '../site/index';
import { isUndef, minifyHTML, trim } from '../util';
import shortid from 'shortid';

/**
 * 树形结构节点ID类型
 * Tree structure node ID type
 */
export type ITreeID = string | number;

export { ITreeToList }

/**
 * 树形节点类型，泛型支持根节点、卷节点或章节节点
 * Tree node type, supporting root node, volume node, or chapter node with generics
 */
export type TreeNode<T = IRowRoot | IRowVolume | IRowChapter> = Node<T>;

/**
 * 树形结构基础接口，包含层级、类型、索引等通用属性
 * Tree structure base interface, containing common properties like level, type, index, etc.
 */
export interface ITree
{
	/** 节点层级 */
	level?: number,
	/** 节点类型（root/volume/chapter） */
	type?: string,
	/** 总索引 */
	total_idx?: number,
	/** 本地索引 */
	idx?: number,
	/** 节点名称 */
	name?: string;
}

/**
 * 卷节点类型定义
 * Volume node type definition
 * 
 * 继承自IVolume（卷信息）和ITree（树形基础属性），并添加卷特有的属性
 * Inherits from IVolume (volume information) and ITree (tree base properties), 
 * and adds volume-specific properties.
 */
export type IRowVolume<T = {}> = T & IVolume & ITree & {
	/** 节点类型：卷 */
	type?: 'volume',
	/** 卷索引 */
	volume_index?: string | number,
	/** 卷标题 */
	volume_title: string,
	/** 卷对应的目录名 */
	dirname?: string;
	/** 卷的层级 */
	volume_level?: string | number,
};

/**
 * 章节节点类型定义
 * Chapter node type definition
 * 
 * 继承自IChapter（章节信息）和ITree（树形基础属性），并添加章节特有的属性
 * Inherits from IChapter (chapter information) and ITree (tree base properties), 
 * and adds chapter-specific properties.
 */
export type IRowChapter<T = {}> = T & IChapter & ITree & {
	/** 节点类型：章节 */
	type?: 'chapter',
	/** 章节索引 */
	chapter_index?: string | number,
	/** 章节标题 */
	chapter_title: string,
	/** 章节ID */
	chapter_id?: string | number,
	/** 章节URL */
	chapter_url?: URL,
	/** 章节URL数据 */
	chapter_url_data?,
	/** 章节日期 */
	chapter_date?,
	/** 章节路径 */
	path?: string;
};

/**
 * 根节点类型定义
 * Root node type definition
 * 
 * 继承自ITree（树形基础属性），并添加根节点特有的属性
 * Inherits from ITree (tree base properties) and adds root node-specific properties.
 */
export type IRowRoot<T = {}> = ITree & {
	/** 节点类型：根 */
	type?: 'root',
} & T;

/**
 * 小说节点类型的联合类型，包括卷和章节
 * Union type of novel node types, including volumes and chapters
 */
export type IRowNovel = IRowVolume | IRowChapter;

/**
 * 小说树形结构管理类
 * Novel tree structure management class
 * 
 * 提供对小说树形结构的创建、添加、查询等操作
 * Provides operations for creating, adding, querying, etc., on the novel tree structure.
 */
export class NovelTree
{
	/** 内部树形结构实例 */
	tree: Tree<IRowRoot | IRowVolume | IRowChapter>;

	/** 缓存信息，用于快速访问最后添加的卷和章节以及树的深度 */
	cache: {
		/** 最后添加的卷节点 */
		lastVolume?: Node<IRowVolume>,
		/** 最后添加的章节节点 */
		lastChapter?: Node<IRowChapter>,
		/** 树的最大深度 */
		depth?: number,
	} = {
		depth: 0,
	};

	/**
	 * 构造函数
	 * Constructor
	 * 
	 * @param initData 初始化数据，默认值为空对象
	 */
	constructor(initData: Partial<IRowRoot> = {})
	{
		initData.type = 'root';
		initData.level = 0;

		this.tree = new Tree(initData as IRowRoot);
	}

	/**
	 * 获取根节点
	 * Get root node
	 * 
	 * @returns 根节点
	 */
	root(): Node<IRowVolume<{}> | IRowRoot<{}> | IRowChapter<{}>>
	{
		return this.tree.root();
	}

	/**
	 * 添加卷节点
	 * Add volume node
	 * 
	 * @param value 卷节点数据
	 * @param root 父节点，默认为根节点
	 * @returns 添加后的卷节点
	 */
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

	/**
	 * 添加章节节点
	 * Add chapter node
	 * 
	 * @param value 章节节点数据
	 * @param root 父节点，默认为根节点
	 * @returns 添加后的章节节点
	 */
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

	/**
	 * 判断是否为卷节点的静态方法（支持Node实例和原始数据对象）
	 * Static method to check if a node is a volume node (supports both Node instances and raw data objects)
	 * 
	 * @param node 要判断的节点
	 * @returns 如果是卷节点则返回节点本身，否则返回null
	 */
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

	/**
	 * 判断是否为章节节点的静态方法（支持Node实例和原始数据对象）
	 * Static method to check if a node is a chapter node (supports both Node instances and raw data objects)
	 * 
	 * @param node 要判断的节点
	 * @returns 如果是章节节点则返回节点本身，否则返回null
	 */
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

	/**
	 * 修复节点属性的内部方法
	 * Internal method to fix node properties
	 * 
	 * @param node 要修复的节点
	 * @returns 修复后的节点
	 */
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

	/**
	 * 获取有效的根节点的内部方法
	 * Internal method to get a valid root node
	 * 
	 * @param root 要检查的根节点
	 * @returns 有效的根节点
	 */
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

	/**
	 * 转换为JSON格式
	 * Convert to JSON format
	 * 
	 * @returns JSON格式的树形结构
	 */
	toJSON()
	{
		return this.tree.root().toJSON();
	}

	/**
	 * 将树形结构转换为列表的静态方法
	 * Static method to convert tree structure to list
	 * 
	 * @param novelTree NovelTree实例
	 * @param linkNode 是否链接节点
	 * @returns 树形结构转换后的列表
	 */
	static treeToList(novelTree: NovelTree, linkNode?: boolean)
	{
		let list = TreeToList<{}, IRowRoot | IRowVolume | IRowChapter>(novelTree.tree, linkNode);
		return list;
	}
}

export default NovelTree;
