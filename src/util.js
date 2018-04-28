"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const novel_text_1 = require("novel-text");
const html_1 = require("jsdom-extra/lib/html");
exports.minifyHTML = html_1.minifyHTML;
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
    let t = novel_text_1.default.trim(str, {
        trim: '　',
    });
    if (bool) {
        t = t.replace(/^[　\s]+|[　\s]+$/g, '');
    }
    return t;
}
exports.trim = trim;
function array_unique(array) {
    return array.filter(function (el, index, arr) {
        return index == arr.indexOf(el);
    });
}
exports.array_unique = array_unique;
const self = require("./util");
exports.default = self;
