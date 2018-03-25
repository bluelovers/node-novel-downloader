import NovelSite, { IOptionsRuntime } from './index';
export declare function padStart(id: any, pad?: string, len?: number): string;
export declare function getVolumePath(self: NovelSite, {volume, vid, path_novel}: {
    volume: NovelSite.IVolume;
    vid: number;
    path_novel: string;
}, optionsRuntime: IOptionsRuntime): string;
export declare function getFilePath(self: NovelSite, {chapter, cid, dirname, ext, idx, volume, vid}: {
    chapter: NovelSite.IChapter;
    cid: number;
    dirname: string;
    ext?: string;
    idx: number;
    volume?: NovelSite.IVolume;
    vid?: number;
}, optionsRuntime?: IOptionsRuntime): string;
import * as self from './fs';
export default self;
