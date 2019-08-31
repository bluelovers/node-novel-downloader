/// <reference types="jquery" />
import NovelSite from '../site/index';
export declare function keepFormatTag<O = NovelSite.IOptionsRuntime, E extends unknown | JQueryStatic = unknown>(target: E, opts: {
    $: JQueryStatic;
    optionsRuntime: O & NovelSite.IOptionsRuntime;
}): JQuery<HTMLElement>;
export declare function _keepImageInContext(_imgs: JQuery, $: JQueryStatic): JQuery<HTMLElement>;
export declare function _tagToFormat(_target: JQuery, tag: string, $: JQueryStatic): JQuery<HTMLElement>;
