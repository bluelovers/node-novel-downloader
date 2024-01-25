/**
 * Created by user on 2018/4/4/004.
 */
import _NovelSiteBase, { IDownloadOptions, IOptionsRuntime as _IOptionsRuntime, INovel as _INovel } from './base';
import { IRowChapter, IRowVolume, NovelTree } from '../../tree/index';
export { NovelTree };
export type IOptionsRuntime = _IOptionsRuntime & {
    novelTree?: NovelTree;
};
export type INovel = _INovel & {
    volume_list?: never;
    novelTree: NovelTree;
};
export declare class NovelSiteDemo extends _NovelSiteBase {
    getOutputDir<T extends IOptionsRuntime & IDownloadOptions>(options: T, novelName?: string): [string, T];
    protected _processNovelListName(novel: INovel, optionsRuntime: IOptionsRuntime, ...argv: any[]): Promise<{
        id?: string | number;
        parent?: string | number;
        uuid?: string;
        content: import("../../tree/index").IRowRoot<{}> | IRowVolume<{}> | IRowChapter<{}>;
    }[]>;
    _processNovel<T>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
        url: URL;
        path_novel: string;
    }, ...argv: any[]): Promise<T>;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
}
export declare const NovelSite: typeof NovelSiteDemo;
export default NovelSiteDemo;
export * from './base';
