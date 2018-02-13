/// <reference types="bluebird" />
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
export interface INovel extends NovelSite.INovel {
    novel_syosetu_id: string;
}
export interface IDownloadOptions extends NovelSite.IDownloadOptions, NovelSite.IOptions {
    /**
     * 不使用小說家提供的 txt 下載連結
     */
    disableTxtdownload?: boolean;
}
export declare class NovelSiteSyosetu extends NovelSite {
    static IDKEY: string;
    constructor(options: IDownloadOptions, ...argv: any[]);
    download(url: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<INovel>;
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteSyosetu;
