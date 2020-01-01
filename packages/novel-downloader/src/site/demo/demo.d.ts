/**
 * Created by user on 2018/3/25/025.
 */
import _NovelSite from '../index';
import { INovel } from './base';
import { IFetchChapter, IOptionsRuntime } from './base';
import NovelSiteBase from './base';
export declare class NovelSiteDemo extends NovelSiteBase {
    static readonly IDKEY = "";
    makeUrl(urlobj: _NovelSite.IParseUrl, options?: any): URL;
    parseUrl(url: URL | string, options?: any): _NovelSite.IParseUrl;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, _cache_: {
        novel: INovel;
    }): string;
    get_volume_list<T = IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IOptionsRuntime>): Promise<INovel>;
}
export default NovelSiteDemo;
