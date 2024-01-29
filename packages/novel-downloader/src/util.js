"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._fixVolumeChapterName = exports.escapeRegexp = exports.trim = exports.isUndef = exports.array_unique = exports.minifyHTML = void 0;
const tslib_1 = require("tslib");
const fullhalf_1 = require("@lazy-cjk/fullhalf");
const layout_1 = tslib_1.__importDefault(require("@node-novel/layout"));
// @ts-ignore
const html_1 = require("jsdom-extra/lib/html");
Object.defineProperty(exports, "minifyHTML", { enumerable: true, get: function () { return html_1.minifyHTML; } });
const array_hyper_unique_1 = require("array-hyper-unique");
Object.defineProperty(exports, "array_unique", { enumerable: true, get: function () { return array_hyper_unique_1.array_unique; } });
function isUndef(v, opts = null, strict) {
    let bool = typeof v == 'undefined' || v === null;
    if (!bool && !isUndef(opts)) {
        opts = Array.isArray(opts) ? opts : [opts];
        for (let t of opts) {
            let bool = strict ? v === t : v == t;
            if (bool) {
                return bool;
            }
        }
    }
    return bool;
}
exports.isUndef = isUndef;
function trim(str, bool) {
    let t = layout_1.default.trim(str, {
        trim: '　',
    });
    if (bool) {
        t = t.replace(/^[　\s]+|[　\s]+$/g, '');
    }
    return t;
}
exports.trim = trim;
function escapeRegexp(str) {
    return str.replace(/[|\\{}()\[\]^$+*?.\/]/g, '\\$&');
}
exports.escapeRegexp = escapeRegexp;
function _fixVolumeChapterName(name) {
    return name.replace(/[?@!$#\\\/<>\[\]{}()*]+/g, s => (0, fullhalf_1.toFullWidth)(s));
}
exports._fixVolumeChapterName = _fixVolumeChapterName;
//# sourceMappingURL=util.js.map