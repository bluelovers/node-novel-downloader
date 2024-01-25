import { IDownloadOptions, NovelSiteSyosetu } from '../index';
import { NovelSite } from '../../index';
import { IUrlOrString } from '../../../types';
import PromiseBluebird from 'bluebird';
import { IJSDOM } from 'jsdom-extra';
export interface IVolumeListCache {
    url: URL;
    page: number;
    _cache_dates: number[];
    volume_list: NovelSite.IVolume[];
    currentVolume: NovelSite.IVolume;
    dom: IJSDOM;
    novel_syosetu_id: string;
    volume_length: number;
    chapter_length: number;
}
export declare function _get_volume_list_main<T = NovelSite.IOptionsRuntime>(self: NovelSiteSyosetu, url: IUrlOrString, optionsRuntime: Partial<T & IDownloadOptions>, dom: IJSDOM, novel_syosetu_id: string): PromiseBluebird<IVolumeListCache>;
export declare function _get_volume_list_page<T = NovelSite.IOptionsRuntime>(self: NovelSiteSyosetu, optionsRuntime: Partial<T & IDownloadOptions>, cache: IVolumeListCache): Promise<IVolumeListCache>;
