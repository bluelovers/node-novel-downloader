/**
 * Created by user on 2018/3/17/017.
 */
import NovelSiteDemo, { IDownloadOptions, INovel, IOptionsRuntime } from '../demo/tree';
import NovelSite from '../index';
export declare class NovelSiteKakuyomu extends NovelSiteDemo {
    static readonly IDKEY = "kakuyomu";
    /**
     * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
     */
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    protected _parseChapter<T>(ret: any, optionsRuntime: any, cache: any): string;
    /**
     * @todo 需要改良支援三級目錄
     */
    get_volume_list<T extends IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteKakuyomu;
