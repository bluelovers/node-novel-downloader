import NovelSite from '../site/index';
export declare function keepFormatTag<O = NovelSite.IOptionsRuntime, E extends unknown | JQueryStatic = unknown>(target: E, opts: {
    $: JQueryStatic;
    optionsRuntime: O & NovelSite.IOptionsRuntime;
}): JQuery<HTMLElement>;
export declare function _saveImageToAttach($: JQueryStatic, _imgs: JQuery, cache: {
    novel: NovelSite.INovel;
    volume: NovelSite.IVolume;
    chapter: NovelSite.IChapter;
}, cb?: (elem: HTMLElement | HTMLImageElement, i: number) => any): JQuery<HTMLElement>;
export declare function _keepImageInContext(_imgs: JQuery, $: JQueryStatic, { prefix, append, }?: {
    prefix?: string;
    append?: string;
}): JQuery<HTMLElement>;
export declare function _tagToFormat(_target: JQuery, tag: string, $: JQueryStatic): JQuery<HTMLElement>;
