/// <reference types="bluebird" />
import NovelSite, { IOptionsRuntime } from '../index';
import { PromiseBluebird } from '../index';
export interface INovel extends NovelSite.INovel {
    novel_syosetu_id: string;
}
export declare type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & {
    /**
     * 不使用小說家提供的 txt 下載連結
     */
    disableTxtdownload?: boolean;
};
export declare class NovelSiteSyosetu extends NovelSite {
    static IDKEY: string;
    constructor(options: IDownloadOptions, ...argv: any[]);
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>): this;
    download(url: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<INovel>;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteSyosetu;
