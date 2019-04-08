/// <reference types="bluebird" />
import { IJSDOM } from 'jsdom-extra';
import _NovelSite from '../index';
import { PromiseBluebird } from '../index';
import parseContentType = require('content-type-parser');
export declare type IOptionsPlus = {};
export declare type IDownloadOptions = _NovelSite.IDownloadOptions & _NovelSite.IOptions & IOptionsPlus;
export declare type IOptionsRuntime = _NovelSite.IOptionsRuntime & IOptionsPlus;
export import INovel = _NovelSite.INovel;
import { ResponseRequest } from 'request';
export declare type IFetchChapter = {
    body?: any;
    dom?: IJSDOM;
    res?: ResponseRequest;
    json?: any;
    url?: URL;
    contentTypeParsed?: ReturnType<parseContentType>;
};
export declare type ISessionData = {
    [key: string]: any;
};
export declare class NovelSiteDemo extends _NovelSite {
    static readonly IDKEY: string;
    constructor(options: IDownloadOptions, ...argv: any[]);
    /**
     * @todo 讓此方法有意義
     *
     * 用來說明目前站點的所需 session cookies
     *
     * @param {T} data
     * @returns {T}
     */
    checkSessionData<T = ISessionData>(data: T, optionsRuntime?: IOptionsRuntime): T;
    session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL, domain?: string): this;
    download(inputUrl: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<_NovelSite.INovel>;
    protected _processNovel<T = any>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
        url: URL;
        path_novel: string;
    }, ...argv: any[]): Promise<T>;
    processNovel<T>(novel: INovel, optionsRuntime: IOptionsRuntime, _cache_: {
        url: URL;
        path_novel: string;
    }, ...argv: any[]): PromiseBluebird<{
        novel: _NovelSite.INovel;
        optionsRuntime: _NovelSite.IOptionsRuntime;
        _cache_: {
            url: URL;
            path_novel: string;
        };
        ret: T;
    }>;
    protected _stripContent(text: string): string;
    protected _parseChapter<T>(ret: IFetchChapter, optionsRuntime: T & IOptionsRuntime, cache: {
        file: string;
        novel: _NovelSite.INovel;
        volume: _NovelSite.IVolume;
        chapter: _NovelSite.IChapter;
    }): string | Promise<string>;
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime): PromiseBluebird<IFetchChapter>;
    protected _exportDownloadOptions(optionsRuntime?: IOptionsRuntime): any;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    protected _get_meta(inputUrl: any, optionsRuntime: any, cache?: {
        dom?: IJSDOM;
    }): void;
}
export declare const NovelSite: typeof NovelSiteDemo;
export default NovelSiteDemo;
