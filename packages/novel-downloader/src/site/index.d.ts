/**
 * Created by user on 2018/2/10/010.
 */
/// <reference types="node" />
import bluebirdDecorator from '../decorator/bluebird';
import PromiseBluebird = require('bluebird');
import { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM } from '../jsdom';
export { defaultJSDOMOptions, IFromUrlOptions, IOptionsJSDOM, createOptionsJSDOM };
import { IMdconfMeta } from 'node-novel-info';
export { IMdconfMeta };
import { LazyCookieJar } from 'jsdom-extra';
import moment = require('moment-timezone');
import EventEmitter = require('events');
export { moment };
export { bluebirdDecorator, PromiseBluebird };
export declare const SYMBOL_CACHE: unique symbol;
export declare class NovelSite implements NovelSite.INovelSite {
    static readonly IDKEY: string;
    PATH_NOVEL_MAIN: string;
    optionsInit?: NovelSite.IOptions;
    constructor(options: NovelSite.IOptions, ...argv: any[]);
    _constructor(options: NovelSite.IOptions, ...argv: any[]): void;
    static create(options: NovelSite.IOptions, ...argv: any[]): NovelSite;
    static check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
    session<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime, url?: URL): this;
    download(url: string | URL, options?: NovelSite.IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
    get_volume_list<T = NovelSite.IOptionsRuntime>(url: string | URL, optionsRuntime?: Partial<T & NovelSite.IDownloadOptions>): Promise<NovelSite.INovel>;
    makeUrl<T extends NovelSite.IOptionsRuntime>(urlobj: NovelSite.IParseUrl, options?: any, optionsRuntime?: T): URL;
    parseUrl(url: URL | string, options?: any): NovelSite.IParseUrl;
    getStatic<T = typeof NovelSite>(): T;
    get IDKEY(): string;
    protected _pathNovelID<N extends NovelSite.INovel, T extends NovelSite.IOptionsRuntime>(novel: N, optionsRuntime: T): any;
    getPathNovel<N extends NovelSite.INovel, T extends NovelSite.IOptionsRuntime>(PATH_NOVEL_MAIN: string, novel: N, optionsRuntime: T): string;
    /**
     * 如果已經下載過 則試圖從 README.md 內讀取缺漏的下載設定
     *
     * @private
     */
    _loadExistsConf<T, N extends NovelSite.INovel>(inputUrl: any, optionsRuntime: T, novel: N, path_novel: string): void;
    getOutputDir<T>(options?: T & NovelSite.IOptions, novelName?: string): [string, T & NovelSite.IOptions];
    protected _fixOptionsRuntime<T = NovelSite.IOptionsRuntime>(optionsRuntime: T & NovelSite.IOptionsRuntime): T & NovelSite.IOptionsRuntime;
    trimFilenameChapter(name: any): string;
    trimFilenameVolume(name: any): string;
    trimFilenameNovel(name: any): string;
    trimFilename(name: any): string;
    trimTag(tag: any): string;
    protected _exportDownloadOptions<T = IOptionsRuntime>(optionsRuntime?: T & IOptionsRuntime): unknown;
    protected _handleDataForStringify(...argv: any[]): IMdconfMeta;
    protected _saveReadme(optionsRuntime?: IOptionsRuntime, options?: {}, ...opts: any[]): Promise<{
        file: string;
        md: string;
    }>;
    createMainUrl<T = IOptionsRuntime>(url: string | URL, optionsRuntime?: T & IOptionsRuntime): URL;
    protected _createChapterUrl<T = IOptionsRuntime>({ novel, volume, chapter, }: {
        novel: NovelSite.INovel;
        volume: NovelSite.IVolume;
        chapter: NovelSite.IChapter;
    }, optionsRuntime?: T & IOptionsRuntime): URL;
    protected _fetchChapter<T>(url: URL, optionsRuntime: T & IOptionsRuntime, _cache_: {
        novel: INovel;
    }): void;
    protected _parseChapter<T>(dom: any, optionsRuntime: T & IOptionsRuntime, cache: {
        file: string;
        novel: NovelSite.INovel;
        volume: NovelSite.IVolume;
        chapter: NovelSite.IChapter;
    }): void;
    getExtraInfo<T, M extends Partial<INovel & IMdconfMeta>, C extends unknown>(urlobj: NovelSite.IParseUrl, optionsRuntime: T & IOptionsRuntime, data_meta?: M, cache?: C): PromiseBluebird<M>;
    protected _checkExists(optionsRuntime: IOptionsRuntime, file: string): boolean;
    protected emit(event: EventEmitter, eventName: string, ...argv: any[]): (boolean | EventEmitter)[];
    _saveFile<T = NovelSite.IOptionsRuntime>(opts: {
        file: string;
        context: string | Buffer;
        optionsRuntime: T & NovelSite.IOptionsRuntime;
    }): PromiseBluebird<void>;
}
export import IOptionsRuntime = NovelSite.IOptionsRuntime;
export import IVolume = NovelSite.IVolume;
export import IChapter = NovelSite.IChapter;
export import EnumPathNovelStyle = NovelSite.EnumPathNovelStyle;
import { INovel } from './syosetu';
export declare namespace NovelSite {
    type IFilePrefixMode = 0 | 1 | 2 | 3 | 4 | 5;
    type IOptionsPlus = {
        disableOutputDirPrefix?: boolean;
        noDirPrefix?: boolean;
        noDirPadend?: boolean;
        noFirePrefix?: boolean;
        noFilePadend?: boolean;
        retryDelay?: number;
        startIndex?: number;
        filePrefixMode?: number | IFilePrefixMode;
        allowEmptyVolumeTitle?: boolean;
        event?: EventEmitter;
        /**
         * 用來登入站點的 cookies session
         */
        sessionData?: {
            [key: string]: any;
        };
        /**
         * 只抓取小說的 META 資料
         */
        fetchMetaDataOnly?: boolean;
        debugLog?: boolean;
        lineBreakCrlf?: boolean;
        /**
         * 保留注音格式
         */
        keepRuby?: boolean;
        /**
         * 保留其他格式
         */
        keepFormat?: boolean;
        /**
         * 在內文原始位置上保留圖片
         */
        keepImage?: boolean;
    };
    type IOptions = {
        outputDir?: string;
        cwd?: string;
    } & IOptionsPlus;
    const enum EnumPathNovelStyle {
        DEFAULT = 0,
        NOVELID = 1
    }
    type IDownloadOptions = {
        /**
         * 只產生目錄結構 不下載內容
         */
        disableDownload?: boolean;
        disableCheckExists?: boolean;
        optionsJSDOM?: IFromUrlOptions & IOptionsJSDOM & {
            cookieJar?: Partial<LazyCookieJar>;
        };
        /**
         * 設定小說資料夾樣式
         */
        pathNovelStyle?: EnumPathNovelStyle;
    } & IOptionsPlus;
    type IOptionsRuntime = IOptions & IDownloadOptions & IOptionsPlus;
    interface IParseUrl {
        url?: URL | string;
        novel_pid?: any;
        novel_id?: any;
        chapter_id?: any;
        volume_id?: any;
        novel_r18?: any;
        [key: string]: any;
    }
    interface IChapter {
        chapter_index?: number | string;
        chapter_title: string;
        chapter_id?: any;
        chapter_url?: any;
        chapter_url_data?: any;
        chapter_date?: moment.Moment;
        imgs?: string[];
        [key: string]: any;
    }
    interface IVolume {
        volume_index?: any;
        volume_title: string;
        chapter_list?: IChapter[];
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
        readonly IDKEY: string;
        readonly disabled?: boolean;
        check?(url: string | URL | NovelSite.IParseUrl | number, options?: any, ...argv: any[]): boolean;
        makeUrl?(urlobj: NovelSite.IParseUrl, options?: any, ...argv: any[]): URL;
        parseUrl?(url: string | URL | number, ...argv: any[]): NovelSite.IParseUrl;
    }
    interface INovelSite {
        download(url: string | URL, options?: IDownloadOptions): PromiseBluebird<NovelSite.INovel>;
        makeUrl(urlobj: NovelSite.IParseUrl, options?: any, ...argv: any[]): URL;
        parseUrl(url: URL | string | number, ...argv: any[]): NovelSite.IParseUrl;
    }
}
export interface Type<T> {
    new (options: NovelSite.IOptions, ...args: any[]): T;
}
export declare function staticImplements<T>(): (constructor: T) => void;
export default NovelSite;
