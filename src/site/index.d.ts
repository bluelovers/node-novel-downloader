/// <reference types="bluebird" />
/**
 * Created by user on 2018/2/10/010.
 */
import bluebirdDecorator from '../decorator/bluebird';
import * as PromiseBluebird from 'bluebird';
import { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM } from '../jsdom';
export { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM };
import * as moment from 'moment-timezone';
export { moment };
export { bluebirdDecorator, PromiseBluebird };
export declare const SYMBOL_CACHE: unique symbol;
export declare class NovelSite implements NovelSite.INovelSite {
    PATH_NOVEL_MAIN: string;
    optionsInit?: NovelSite.IOptions;
    constructor(options: NovelSite.IOptions, ...argv: any[]);
    static create(options: NovelSite.IOptions, ...argv: any[]): NovelSite;
    static check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime): this;
    download(url: string | URL, options?: NovelSite.IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & NovelSite.IDownloadOptions>): Promise<NovelSite.INovel>;
    makeUrl(urlobj: NovelSite.IParseUrl, options?: any): URL;
    parseUrl(url: URL | string, options?: any): NovelSite.IParseUrl;
    getStatic<T>(): typeof NovelSite;
    readonly IDKEY: string;
    getOutputDir<T>(options?: T & NovelSite.IOptions, novelName?: string): [string, T & NovelSite.IOptions];
    protected _fixOptionsRuntime<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime): T & NovelSite.IOptionsRuntime;
    trimFilenameChapter(name: any): string;
    trimFilenameVolume(name: any): string;
    trimFilenameNovel(name: any): string;
    trimFilename(name: any): string;
    protected _saveReadme(optionsRuntime?: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    createMainUrl(url: string): URL;
    createMainUrl(url: URL): URL;
}
export declare type IOptionsRuntime = NovelSite.IOptionsRuntime;
export declare module NovelSite {
    type IOptionsRuntime = IOptions & IDownloadOptions & {};
    interface IOptions {
        outputDir?: string;
        cwd?: string;
        disableOutputDirPrefix?: boolean;
        noDirPrefix?: boolean;
        noDirPadend?: boolean;
        noFirePrefix?: boolean;
        noFilePadend?: boolean;
        startIndex?: number;
        allowEmptyVolumeTitle?: boolean;
        filePrefixMode?: number;
    }
    interface IParseUrl {
        url?: URL | string;
        novel_pid?: any;
        novel_id?: any;
        chapter_id?: any;
        novel_r18?: any;
        [key: string]: any;
    }
    interface IChapter {
        chapter_index?: number;
        chapter_title: string;
        chapter_id?: any;
        chapter_url?: any;
        chapter_url_data?: any;
        chapter_date?: moment.Moment;
        [key: string]: any;
    }
    interface IVolume {
        volume_index?: any;
        volume_title: string;
        chapter_list: IChapter[];
        [key: string]: any;
    }
    interface INovel {
        url: URL | string;
        url_data: IParseUrl;
        novel_title: string;
        novel_author?: string;
        novel_desc?: string;
        novel_date?: moment.Moment;
        novel_publisher?: string;
        novel_series_title?: string;
        volume_list: IVolume[];
        checkdate?: moment.Moment;
        imgs?: string[];
        [key: string]: any;
    }
    interface INovelSiteStatic<T> extends Type<T & NovelSite.INovelSite> {
        IDKEY: string;
    }
    interface IDownloadOptions {
        /**
         * 只產生目錄結構 不下載內容
         */
        disableDownload?: boolean;
        disableCheckExists?: boolean;
        optionsJSDOM?: IFromUrlOptions & IOptionsJSDOM;
        startIndex?: number;
    }
    interface INovelSite {
        download(url: string | URL, options?: IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
        makeUrl(urlobj: NovelSite.IParseUrl, options?: any): URL;
        parseUrl(url: URL | string): NovelSite.IParseUrl;
    }
}
export interface Type<T> {
    new (options: NovelSite.IOptions, ...args: any[]): T;
}
export declare function staticImplements<T>(): (constructor: T) => void;
export default NovelSite;
