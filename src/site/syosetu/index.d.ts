/// <reference types="bluebird" />
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
import * as NovelSiteDemo from '../demo/base';
export declare type INovel = NovelSiteDemo.INovel & {
    novel_syosetu_id: string;
};
export declare type IOptionsPlus = {
    /**
     * 不使用小說家提供的 txt 下載連結
     */
    disableTxtdownload?: boolean;
};
export declare type IDownloadOptions = NovelSiteDemo.IDownloadOptions & IOptionsPlus;
export declare type IOptionsRuntime = NovelSiteDemo.IOptionsRuntime & IDownloadOptions & IOptionsPlus;
export declare class NovelSiteSyosetu extends NovelSiteDemo.NovelSite {
    static readonly IDKEY: string;
    constructor(options: IDownloadOptions, ...argv: any[]);
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL): this;
    download(url: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
    protected _parseChapter<T>(ret: any, optionsRuntime: T & IOptionsRuntime, cache: any): string;
    protected _createChapterUrl<T = IOptionsRuntime & IDownloadOptions>({ novel, volume, chapter, }: {
        novel: NovelSite.INovel;
        volume: NovelSite.IVolume;
        chapter: NovelSite.IChapter;
    }, optionsRuntime?: T & IOptionsRuntime): URL;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean): URL;
    parseUrl(url: string | URL): NovelSite.IParseUrl;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteSyosetu;
