"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const path = require("upath2");
function padStart(id, pad = '0', len = 4) {
    return id.toString().padStart(len, '0') + pad;
}
exports.padStart = padStart;
function getVolumePath(self, { volume, vid, path_novel, }, optionsRuntime) {
    let dirname;
    let _vid = '';
    dirname = self.trimFilenameVolume(volume.volume_title);
    if (!optionsRuntime.noDirPrefix) {
        _vid = padStart(vid);
        _vid += '_';
    }
    if (!dirname && optionsRuntime.allowEmptyVolumeTitle) {
        dirname = vid.toString() + 'empty';
    }
    if (!dirname) {
        throw new RangeError(`volume_title is empty`);
    }
    dirname = path.join(path_novel, `${_vid}${dirname}`);
    return dirname;
}
exports.getVolumePath = getVolumePath;
function getFilePath(self, { chapter, cid, dirname, ext = '.txt', idx, volume, vid, }, optionsRuntime = {}) {
    let file;
    let prefix = '';
    let pad = '';
    file = self.trimFilenameChapter(chapter.chapter_title);
    if (!optionsRuntime.noFirePrefix) {
        let idxx;
        if (optionsRuntime.filePrefixMode > 1) {
            if (util_1.isUndef(chapter.chapter_index, '', true)) {
                idxx = '';
            }
            else if (optionsRuntime.filePrefixMode > 2) {
                idxx = idx;
            }
            else {
                idxx = chapter.chapter_index;
                if (optionsRuntime.startIndex) {
                    idxx += optionsRuntime.startIndex;
                }
            }
        }
        else if (optionsRuntime.filePrefixMode > 0 || util_1.isUndef(chapter.chapter_index)) {
            idxx = cid;
            if (optionsRuntime.startIndex) {
                idxx += optionsRuntime.startIndex;
            }
        }
        else if (!optionsRuntime.filePrefixMode) {
            idxx = idx;
        }
        else {
            idxx = chapter.chapter_index;
        }
        if (idxx !== '') {
            prefix = padStart(idxx);
            prefix += '_';
        }
    }
    if (!optionsRuntime.noFilePadend && chapter.chapter_date) {
        pad = '.' + chapter.chapter_date.format('YYYYMMDDHHmm');
    }
    if (!file) {
        throw new RangeError(`chapter_title is empty`);
    }
    if (!dirname) {
        throw new RangeError(`dirname is empty`);
    }
    file = path.join(dirname, `${prefix}${self.trimFilenameChapter(chapter.chapter_title)}${pad}${ext}`);
    return file;
}
exports.getFilePath = getFilePath;
const self = require("./fs");
exports.default = self;
