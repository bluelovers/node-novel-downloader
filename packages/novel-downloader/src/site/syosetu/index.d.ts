/// <reference types="bluebird" />
import { IJSDOM } from 'jsdom-extra';
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
import NovelSiteDemo = require('../demo/base');
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
    static readonly IDKEY = "syosetu";
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
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime): PromiseBluebird<any>;
    _novel18<T = NovelSite.IOptionsRuntime>(url: any, dom: IJSDOM, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<IJSDOM>;
    protected _getExtraInfoURL<T>(search: string, url_data: NovelSite.IParseUrl, optionsRuntime: Partial<T & IDownloadOptions>): PromiseBluebird<any>;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & IDownloadOptions>): Promise<INovel>;
}
export default NovelSiteSyosetu;
