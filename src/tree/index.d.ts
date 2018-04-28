/**
 * Created by user on 2018/4/2/002.
 */
import { Tree, Node } from 'js-tree-list2';
import { IChapter, IVolume } from '../site/index';
export declare type ITreeID = string | number;
export declare type TreeNode<T = IRowRoot | IRowVolume | IRowChapter> = Node<T>;
export interface ITree {
    level?: number;
    type?: string;
    total_idx?: number;
    idx?: number;
    name?: string;
}
export declare type IRowVolume<T = {}> = T & IVolume & ITree & {
    type?: 'volume';
    volume_index?: string | number;
    volume_title: string;
    dirname?: string;
    volume_level?: string | number;
};
export declare type IRowChapter<T = {}> = T & IChapter & ITree & {
    type?: 'chapter';
    chapter_index?: string | number;
    chapter_title: string;
    chapter_id?: string | number;
    chapter_url?: URL;
    chapter_url_data?;
    chapter_date?;
    path?: string;
};
export declare type IRowRoot<T = {}> = ITree & {
    type?: 'root';
} & T;
export declare type IRowNovel = IRowVolume | IRowChapter;
export declare class NovelTree {
    tree: Tree<IRowRoot | IRowVolume | IRowChapter>;
    cache: {
        lastVolume?: Node<IRowVolume>;
        lastChapter?: Node<IRowChapter>;
        depth?: number;
    };
    constructor(initData?: Partial<IRowRoot>);
    root(): Node<IRowRoot<{}> | IRowVolume<{}> | IRowChapter<{}>>;
    addVolume<U extends IRowVolume>(value: U, root?: Node): Node<U>;
    addChapter<U extends IRowChapter>(value: U, root?: Node): Node<U>;
    static isVolume(node: Node): node is Node<IRowVolume>;
    static isVolume(node: IRowVolume): node is IRowVolume;
    static isChapter(node: Node): node is Node<IRowChapter>;
    static isChapter(node: IRowChapter): node is IRowChapter;
    protected _fixRow<U extends Node<IRowVolume | IRowChapter>>(node: U): U;
    protected _getRoot<U extends Node<IRowRoot | IRowVolume | IRowChapter>>(root: U): U;
    toJSON(): Node<IRowRoot<{}> | IRowVolume<{}> | IRowChapter<{}>> & {
        parent: string | number;
        children: any[];
    };
    static treeToList(novelTree: NovelTree, linkNode?: boolean): {
        id?: string | number;
        parent?: string | number;
        uuid?: string;
        content: IRowRoot<{}> | IRowVolume<{}> | IRowChapter<{}>;
    }[];
}
export default NovelTree;
