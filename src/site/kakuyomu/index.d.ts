/// <reference types="bluebird" />
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
import { IOptionsRuntime } from '../index';
export declare type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & {};
export interface INovel extends NovelSite.INovel {
}
export declare class NovelSiteKakuyomu extends NovelSite {
    static IDKEY: string;
    /**
     * https://kakuyomu.jp/works/4852201425154898215/episodes/4852201425154936315
     */
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>): this;
    download(url: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<INovel>;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteKakuyomu;
