/// <reference types="jquery" />
import NovelSite from '../index';
export declare function check(url: string | URL | NovelSite.IParseUrl, options?: any): boolean;
export declare function makeUrl(urlobj: NovelSite.IParseUrl, bool?: boolean | number, ...argv: any[]): URL;
export declare function parseUrl(_url: string | URL | number, ...argv: any[]): import("../../util/url").IParseUrlRuntime;
export declare function _p_2_br(target: any, $: any): any;
export declare function _remove_ad($: JQueryStatic): void;
