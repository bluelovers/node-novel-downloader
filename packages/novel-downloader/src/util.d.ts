/**
 * Created by user on 2018/3/18/018.
 */
import { minifyHTML } from 'jsdom-extra/lib/html';
export { minifyHTML };
export declare function isUndef(v: any, opts?: any, strict?: boolean): boolean;
export declare function trim(str: string, bool?: boolean): string;
export declare function array_unique<T>(array: T[]): T[];
export declare function escapeRegexp(str: string): string;
export declare function _fixVolumeChapterName(name: string): string;
declare const _default: typeof import("./util");
export default _default;
