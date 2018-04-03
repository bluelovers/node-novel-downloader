/**
 * Created by user on 2018/4/2/002.
 */
import { Tree, Node } from 'js-tree-list2';
export declare type ITreeID = string | number;
export interface ITree {
    level?: number;
    type?: string;
}
export declare type IRowVolume<T = {}> = ITree & {
    type?: 'volume';
    volume_index?: string | number;
    volume_title: string;
} & T;
export declare type IRowChapter<T = {}> = ITree & {
    type?: 'chapter';
    chapter_index?: string | number;
    chapter_title: string;
    chapter_id?: string | number;
    chapter_url?: URL;
    chapter_url_data?: any;
    chapter_date?: any;
} & T;
export declare type IRowRoot<T = {}> = ITree & {
    type?: 'root';
} & T;
export declare type IRowNovel = IRowVolume | IRowChapter;
export declare class NovelTree {
    tree: Tree<IRowRoot | IRowVolume | IRowChapter>;
    cache: {
        lastVolume?: Node<IRowVolume>;
        lastChapter?: Node<IRowChapter>;
    };
    constructor(initData?: Partial<IRowRoot>);
    root(): any;
    addVolume<U extends IRowVolume>(value: U, root?: Node): any;
    addChapter<U extends IRowChapter>(value: U, root?: Node): any;
    protected _fixRow<U extends Node<IRowVolume | IRowChapter>>(node: U): U;
    protected _getRoot<U extends Node<IRowRoot | IRowVolume | IRowChapter>>(root: U): U;
    static treeToList(novelTree: NovelTree): any;
}
export default NovelTree;
