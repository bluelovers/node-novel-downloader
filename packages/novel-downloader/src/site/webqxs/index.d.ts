/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { IDownloadOptions, INovel } from '../demo/base';
import { IFetchChapter, IOptionsRuntime } from '../demo/base';
import NovelSiteBase from '../demo/base';
export declare class NovelSiteWebqxs extends NovelSiteBase {
    static readonly IDKEY = "webqxs";
    makeUrl<T>(urlobj: _NovelSite.IParseUrl, bool?: boolean | number, optionsRuntime?: T & IOptionsRuntime): URL;
    parseUrl(url: URL | string, options?: any): _NovelSite.IParseUrl;
    createMainUrl<T>(url: string | URL, optionsRuntime: T & IOptionsRuntime): URL;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): string;
    get_volume_list<T = IOptionsRuntime>(inputUrl: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
    protected _get_meta(inputUrl: any, optionsRuntime: any): Promise<{
        url: URL;
        novel_author: any;
        novel_desc: any;
    }>;
}
export default NovelSiteWebqxs;
