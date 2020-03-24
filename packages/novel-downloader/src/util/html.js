"use strict";
/// <reference types="jquery" />
Object.defineProperty(exports, "__esModule", { value: true });
exports._tagToFormat = exports._keepImageInContext = exports.keepFormatTag = void 0;
const hash_1 = require("./hash");
function keepFormatTag(target, opts) {
    let { optionsRuntime, $ } = opts;
    let _target = $(target);
    if (optionsRuntime.keepRuby) {
        [
            'rp',
            'rt',
            'ruby',
        ].forEach(tag => {
            _tagToFormat(_target, tag, $);
        });
    }
    if (optionsRuntime.keepFormat) {
        [
            's',
            'i',
            'b',
            'sup',
            'sub',
        ].forEach(tag => {
            _tagToFormat(_target, tag, $);
        });
    }
    return _target;
}
exports.keepFormatTag = keepFormatTag;
function _keepImageInContext(_imgs, $, { prefix = '插圖', append = '', } = {}) {
    _imgs.each((i, elem) => {
        let img = $(elem);
        let src = img.prop('src');
        img.after(`（${prefix}${hash_1.hashSum(src)}）${append}`);
        img.remove();
    });
    return _imgs;
}
exports._keepImageInContext = _keepImageInContext;
function _tagToFormat(_target, tag, $) {
    _target.find(tag)
        .each((i, elem) => {
        let _this = $(elem);
        _this.after(`＜${tag}＞${_this.html()}＜/${tag}＞`);
        _this.remove();
    });
    return _target;
}
exports._tagToFormat = _tagToFormat;
//# sourceMappingURL=html.js.map