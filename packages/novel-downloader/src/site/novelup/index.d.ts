/**
 * Created by user on 2018/3/17/017.
 */
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime, IFetchChapter } from '../demo/tree';
import NovelSite from '../index';
export declare class NovelSiteESJZone extends NovelSiteDemo {
    static readonly IDKEY = "novelup";
    static check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    protected _decodeChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: any): Promise<void>;
    protected _parseChapter<T>(ret: any, optionsRuntime: any, cache: any): Promise<string>;
    getOutputDir<T extends IOptionsRuntime>(options?: T & IOptionsRuntime, novelName?: string): [string, T];
    get_volume_list<T extends IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteESJZone;
