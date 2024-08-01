"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.padStart = padStart;
exports.getVolumePath = getVolumePath;
exports.getFilePath = getFilePath;
const tslib_1 = require("tslib");
const util_1 = require("../util");
const upath2_1 = tslib_1.__importDefault(require("upath2"));
function padStart(id, pad = '0', len = 4) {
    return id.toString().padStart(len, '0') + pad;
}
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
    dirname = upath2_1.default.join(path_novel, `${_vid}${dirname}`);
    return dirname;
}
function getFilePath(self, { chapter, cid, dirname, ext = '.txt', idx, volume, vid, }, optionsRuntime = {}) {
    let file;
    let prefix = '';
    let pad = '';
    file = self.trimFilenameChapter(chapter.chapter_title);
    if (!optionsRuntime.noFirePrefix) {
        let idxx;
        if (optionsRuntime.filePrefixMode > 1) {
            if ((0, util_1.isUndef)(chapter.chapter_index, '', true)) {
                idxx = '';
            }
            else if (optionsRuntime.filePrefixMode == 3 || optionsRuntime.filePrefixMode > 4) {
                idxx = idx;
            }
            else {
                idxx = chapter.chapter_index;
                if (optionsRuntime.startIndex) {
                    idxx += optionsRuntime.startIndex;
                }
            }
        }
        else if (optionsRuntime.filePrefixMode > 0 || (0, util_1.isUndef)(chapter.chapter_index)) {
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
        throw _createError(`chapter_title is empty ${chapter.chapter_title}`);
    }
    if (!dirname) {
        throw _createError(`dirname is empty ${dirname}`);
    }
    let fullfile = upath2_1.default.join(dirname, `${prefix}${file}${pad}${ext}`);
    return fullfile;
}
function _createError(msg, _data) {
    let e = new RangeError(msg);
    // @ts-ignore
    e._data = _data;
    // @ts-ignore
    return e;
}
//# sourceMappingURL=fs.js.map