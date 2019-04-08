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
        throw _createError(`chapter_title is empty ${chapter.chapter_title}`);
    }
    if (!dirname) {
        throw _createError(`dirname is empty ${dirname}`);
    }
    let fullfile = path.join(dirname, `${prefix}${file}${pad}${ext}`);
    return fullfile;
}
exports.getFilePath = getFilePath;
function _createError(msg, _data) {
    let e = new RangeError(msg);
    // @ts-ignore
    e._data = _data;
    // @ts-ignore
    return e;
}
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBSUgsa0NBQWtDO0FBRWxDLCtCQUErQjtBQUUvQixTQUFnQixRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFOUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDL0MsQ0FBQztBQUhELDRCQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQWUsRUFBRSxFQUM5QyxNQUFNLEVBQ04sR0FBRyxFQUNILFVBQVUsR0FLVixFQUFFLGNBQStCO0lBRWpDLElBQUksT0FBZSxDQUFDO0lBQ3BCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVkLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUMvQjtRQUNDLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxJQUFJLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUMscUJBQXFCLEVBQ3BEO1FBQ0MsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7S0FDbkM7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUNaO1FBQ0MsTUFBTSxJQUFJLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUM3QixHQUFHLElBQUksR0FBRyxPQUFPLEVBQUUsQ0FDbkIsQ0FBQztJQUVGLE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUM7QUFyQ0Qsc0NBcUNDO0FB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LzE4LzAxOC5cbiAqL1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgeyBpc1VuZGVmIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgTm92ZWxTaXRlLCB7IElPcHRpb25zUnVudGltZSB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICd1cGF0aDInO1xuXG5leHBvcnQgZnVuY3Rpb24gcGFkU3RhcnQoaWQsIHBhZCA9ICcwJywgbGVuID0gNCk6IHN0cmluZ1xue1xuXHRyZXR1cm4gaWQudG9TdHJpbmcoKS5wYWRTdGFydChsZW4sICcwJykgKyBwYWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRWb2x1bWVQYXRoKHNlbGY6IE5vdmVsU2l0ZSwge1xuXHR2b2x1bWUsXG5cdHZpZCxcblx0cGF0aF9ub3ZlbCxcbn06IHtcblx0dm9sdW1lOiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0dmlkOiBudW1iZXIsXG5cdHBhdGhfbm92ZWw6IHN0cmluZyxcbn0sIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUpOiBzdHJpbmdcbntcblx0bGV0IGRpcm5hbWU6IHN0cmluZztcblx0bGV0IF92aWQgPSAnJztcblxuXHRkaXJuYW1lID0gc2VsZi50cmltRmlsZW5hbWVWb2x1bWUodm9sdW1lLnZvbHVtZV90aXRsZSk7XG5cblx0aWYgKCFvcHRpb25zUnVudGltZS5ub0RpclByZWZpeClcblx0e1xuXHRcdF92aWQgPSBwYWRTdGFydCh2aWQpO1xuXG5cdFx0X3ZpZCArPSAnXyc7XG5cdH1cblxuXHRpZiAoIWRpcm5hbWUgJiYgb3B0aW9uc1J1bnRpbWUuYWxsb3dFbXB0eVZvbHVtZVRpdGxlKVxuXHR7XG5cdFx0ZGlybmFtZSA9IHZpZC50b1N0cmluZygpICsgJ2VtcHR5Jztcblx0fVxuXG5cdGlmICghZGlybmFtZSlcblx0e1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGB2b2x1bWVfdGl0bGUgaXMgZW1wdHlgKTtcblx0fVxuXG5cdGRpcm5hbWUgPSBwYXRoLmpvaW4ocGF0aF9ub3ZlbCxcblx0XHRgJHtfdmlkfSR7ZGlybmFtZX1gXG5cdCk7XG5cblx0cmV0dXJuIGRpcm5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlUGF0aChzZWxmOiBOb3ZlbFNpdGUsIHtcblx0Y2hhcHRlcixcblx0Y2lkLFxuXHRkaXJuYW1lLFxuXHRleHQgPSAnLnR4dCcsXG5cblx0aWR4LFxuXG5cdHZvbHVtZSxcblx0dmlkLFxufToge1xuXHRjaGFwdGVyOiBOb3ZlbFNpdGUuSUNoYXB0ZXIsXG5cdGNpZDogbnVtYmVyLFxuXHRkaXJuYW1lOiBzdHJpbmcsXG5cdGV4dD86IHN0cmluZyxcblxuXHRpZHg6IG51bWJlcixcblxuXHR2b2x1bWU/OiBOb3ZlbFNpdGUuSVZvbHVtZSxcblx0dmlkPzogbnVtYmVyLFxufSwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSA9IHt9KTogc3RyaW5nXG57XG5cdGxldCBmaWxlOiBzdHJpbmc7XG5cdGxldCBwcmVmaXggPSAnJztcblx0bGV0IHBhZCA9ICcnO1xuXG5cdGZpbGUgPSBzZWxmLnRyaW1GaWxlbmFtZUNoYXB0ZXIoY2hhcHRlci5jaGFwdGVyX3RpdGxlKTtcblxuXHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlyZVByZWZpeClcblx0e1xuXHRcdGxldCBpZHh4OiBudW1iZXIgfCBzdHJpbmc7XG5cblx0XHRpZiAob3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPiAxKVxuXHRcdHtcblx0XHRcdGlmIChpc1VuZGVmKGNoYXB0ZXIuY2hhcHRlcl9pbmRleCwgJycsIHRydWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZHh4ID0gJyc7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA9PSAzIHx8IG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gNClcblx0XHRcdHtcblx0XHRcdFx0aWR4eCA9IGlkeDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0aWR4eCA9IGNoYXB0ZXIuY2hhcHRlcl9pbmRleCBhcyBudW1iZXI7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZHh4ICs9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAob3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPiAwIHx8IGlzVW5kZWYoY2hhcHRlci5jaGFwdGVyX2luZGV4KSlcblx0XHR7XG5cdFx0XHRpZHh4ID0gY2lkO1xuXG5cdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleClcblx0XHRcdHtcblx0XHRcdFx0aWR4eCArPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmICghb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUpXG5cdFx0e1xuXHRcdFx0aWR4eCA9IGlkeDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGlkeHggPSBjaGFwdGVyLmNoYXB0ZXJfaW5kZXg7XG5cdFx0fVxuXG5cdFx0aWYgKGlkeHggIT09ICcnKVxuXHRcdHtcblx0XHRcdHByZWZpeCA9IHBhZFN0YXJ0KGlkeHgpO1xuXHRcdFx0cHJlZml4ICs9ICdfJztcblx0XHR9XG5cdH1cblxuXHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRmlsZVBhZGVuZCAmJiBjaGFwdGVyLmNoYXB0ZXJfZGF0ZSlcblx0e1xuXHRcdHBhZCA9ICcuJyArIGNoYXB0ZXIuY2hhcHRlcl9kYXRlLmZvcm1hdCgnWVlZWU1NRERISG1tJyk7XG5cdH1cblxuXHRpZiAoIWZpbGUpXG5cdHtcblx0XHR0aHJvdyBfY3JlYXRlRXJyb3IoYGNoYXB0ZXJfdGl0bGUgaXMgZW1wdHkgJHtjaGFwdGVyLmNoYXB0ZXJfdGl0bGV9YCk7XG5cdH1cblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBfY3JlYXRlRXJyb3IoYGRpcm5hbWUgaXMgZW1wdHkgJHtkaXJuYW1lfWApO1xuXHR9XG5cblx0bGV0IGZ1bGxmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsXG5cdFx0YCR7cHJlZml4fSR7ZmlsZX0ke3BhZH0ke2V4dH1gXG5cdCk7XG5cblx0cmV0dXJuIGZ1bGxmaWxlO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlRXJyb3I8VD4obXNnOiBzdHJpbmcsIF9kYXRhPzogVCk6IFJhbmdlRXJyb3IgJiB7XG5cdF9kYXRhOiBULFxufVxue1xuXHRsZXQgZSA9IG5ldyBSYW5nZUVycm9yKG1zZyk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRlLl9kYXRhID0gX2RhdGE7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2ZzJyk7XG4iXX0=