"use strict";
/// <reference types="jquery" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepFormatTag = keepFormatTag;
exports._saveImageToAttach = _saveImageToAttach;
exports._keepImageInContext = _keepImageInContext;
exports._tagToFormat = _tagToFormat;
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
function _saveImageToAttach($, _imgs, cache, cb) {
    if (_imgs.length) {
        cache.chapter.imgs = cache.chapter.imgs || [];
        cache.novel.imgs = cache.novel.imgs || [];
        cache.volume.imgs = cache.volume.imgs || [];
        return _imgs.each((i, elem) => {
            var _a;
            if (cb != null) {
                return cb(elem, i);
            }
            let src = (_a = $(elem).prop('src')) === null || _a === void 0 ? void 0 : _a.trim();
            if (src) {
                cache.chapter.imgs = cache.chapter.imgs || [];
                cache.chapter.imgs.push(src);
                cache.novel.imgs.push(src);
                cache.volume.imgs.push(src);
            }
        });
    }
}
function _keepImageInContext(_imgs, $, { prefix = '插圖', append = '', } = {}) {
    _imgs.each((i, elem) => {
        let img = $(elem);
        let src = img.prop('src');
        img.after(`（${prefix}${(0, hash_1.hashSum)(src)}）${append}`);
        img.remove();
    });
    return _imgs;
}
function _tagToFormat(_target, tag, $) {
    _target.find(tag)
        .each((i, elem) => {
        let _this = $(elem);
        _this.after(`＜${tag}＞${_this.html()}＜/${tag}＞`);
        _this.remove();
    });
    return _target;
}
//# sourceMappingURL=html.js.map