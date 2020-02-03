/**
 * Created by user on 2018/3/18/018.
 */
import { minifyHTML } from 'jsdom-extra/lib/html';
import { array_unique } from 'array-hyper-unique';
export { minifyHTML, array_unique };
export declare function isUndef(v: any, opts?: any, strict?: boolean): boolean;
export declare function trim(str: string, bool?: boolean): string;
export declare function escapeRegexp(str: string): string;
export declare function _fixVolumeChapterName(name: string): string;
