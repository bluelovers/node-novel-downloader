/// <reference types="request" />
/// <reference types="bluebird" />
import { IJSDOM } from 'jsdom-extra';
import _NovelSite from '../index';
import { PromiseBluebird } from '../index';
export declare type IOptionsPlus = {};
export declare type IDownloadOptions = _NovelSite.IDownloadOptions & _NovelSite.IOptions & IOptionsPlus;
export declare type IOptionsRuntime = _NovelSite.IOptionsRuntime & IOptionsPlus;
export declare type INovel = _NovelSite.INovel;
import { ResponseRequest } from 'request';
export declare type IFetchChapter = {
    body?: any;
    dom?: IJSDOM;
    res?: ResponseRequest;
};
export declare class NovelSiteDemo extends _NovelSite {
    static readonly IDKEY: string;
    constructor(options: IDownloadOptions, ...argv: any[]);
    session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL): this;
    download(inputUrl: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<_NovelSite.INovel>;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: {
        file: string;
        novel: _NovelSite.INovel;
        volume: _NovelSite.IVolume;
        chapter: _NovelSite.IChapter;
    }): string;
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime): PromiseBluebird<IFetchChapter>;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
}
export declare const NovelSite: typeof NovelSiteDemo;
export default NovelSiteDemo;
