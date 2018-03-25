/**
 * Created by user on 2018/3/25/025.
 */
import NovelSite from '../index';
import { IDownloadOptions, INovel } from './base';
import { IFetchChapter, IOptionsRuntime } from './base';
import NovelSiteBase from './base';
export declare class NovelSiteKakuyomu extends NovelSiteBase {
    static readonly IDKEY: string;
    makeUrl(urlobj: NovelSite.IParseUrl, options?: any): URL;
    parseUrl(url: URL | string, options?: any): NovelSite.IParseUrl;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime): string;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
