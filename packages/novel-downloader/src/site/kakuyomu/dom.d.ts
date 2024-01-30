/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jquery" />
export declare function _classStartWith<T extends string, T2 extends string>(prefix: T, suffix?: T2): `[class^="${T}"]` | `[class^="${T}"]${T2}`;
export declare function _jQueryClassStartWith<T extends string>($: JQueryStatic, selector: string, prefix: string, suffix?: string, parent?: JQuery<any>): JQuery<HTMLElement>;
export declare function _jQueryElemOuterHTML<T extends string>($: JQuery<any>): string;
