/// <reference types="bluebird" />
import { IJSDOM } from 'jsdom-extra';
import NovelSite from '../index';
import { PromiseBluebird } from '../index';
export declare type IOptionsPlus = {};
export declare type IDownloadOptions = NovelSite.IDownloadOptions & NovelSite.IOptions & IOptionsPlus;
export declare type IOptionsRuntime = NovelSite.IOptionsRuntime & IOptionsPlus;
export declare type INovel = NovelSite.INovel;
export declare class NovelSiteDemo extends NovelSite {
    static readonly IDKEY: string;
    session<T = IOptionsRuntime>(optionsRuntime: Partial<T & IDownloadOptions>, url: URL): this;
    download(inputUrl: string | URL, downloadOptions?: IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
    protected _parseChapter(dom: IJSDOM): string;
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime): PromiseBluebird<IJSDOM>;
    protected _saveReadme(optionsRuntime: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
}
export default NovelSiteDemo;
