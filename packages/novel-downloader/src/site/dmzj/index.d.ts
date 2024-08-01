/**
 * Created by user on 2017/12/6/006.
 */
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
/**
 * @deprecated
 */
export declare class NovelSiteDmzj extends NovelSite {
    static disabled: boolean;
    static IDKEY: string;
    _makeUrl(urlobj: NovelSite.IParseUrl, page?: any): string;
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: number): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    download(url: string | URL, downloadOptions?: NovelSite.IDownloadOptions): PromiseBluebird<{
        url: URL;
        data: any;
        value: any[];
    }>;
    _download_info(url: URL, optionsRuntime?: Partial<NovelSite.IOptionsRuntime>): Promise<{
        url: URL;
        data: any;
        value: any[];
    }>;
    _downloadChapter(data: any, optionsRuntime: NovelSite.IOptionsRuntime): Promise<any>;
}
export default NovelSiteDmzj;
