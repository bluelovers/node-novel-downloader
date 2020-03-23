"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilePath = exports.getVolumePath = exports.padStart = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUlILGtDQUFrQztBQUVsQywrQkFBZ0M7QUFFaEMsU0FBZ0IsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBRTlDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQy9DLENBQUM7QUFIRCw0QkFHQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFlLEVBQUUsRUFDOUMsTUFBTSxFQUNOLEdBQUcsRUFDSCxVQUFVLEdBS1YsRUFBRSxjQUErQjtJQUVqQyxJQUFJLE9BQWUsQ0FBQztJQUNwQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFFZCxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUV2RCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFDL0I7UUFDQyxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLElBQUksSUFBSSxHQUFHLENBQUM7S0FDWjtJQUVELElBQUksQ0FBQyxPQUFPLElBQUksY0FBYyxDQUFDLHFCQUFxQixFQUNwRDtRQUNDLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDO0tBQ25DO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFDWjtRQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUM5QztJQUVELE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDN0IsR0FBRyxJQUFJLEdBQUcsT0FBTyxFQUFFLENBQ25CLENBQUM7SUFFRixPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDO0FBckNELHNDQXFDQztB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My8xOC8wMTguXG4gKi9cblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0IHsgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZSwgeyBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWRTdGFydChpZCwgcGFkID0gJzAnLCBsZW4gPSA0KTogc3RyaW5nXG57XG5cdHJldHVybiBpZC50b1N0cmluZygpLnBhZFN0YXJ0KGxlbiwgJzAnKSArIHBhZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZvbHVtZVBhdGgoc2VsZjogTm92ZWxTaXRlLCB7XG5cdHZvbHVtZSxcblx0dmlkLFxuXHRwYXRoX25vdmVsLFxufToge1xuXHR2b2x1bWU6IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHR2aWQ6IG51bWJlcixcblx0cGF0aF9ub3ZlbDogc3RyaW5nLFxufSwgb3B0aW9uc1J1bnRpbWU6IElPcHRpb25zUnVudGltZSk6IHN0cmluZ1xue1xuXHRsZXQgZGlybmFtZTogc3RyaW5nO1xuXHRsZXQgX3ZpZCA9ICcnO1xuXG5cdGRpcm5hbWUgPSBzZWxmLnRyaW1GaWxlbmFtZVZvbHVtZSh2b2x1bWUudm9sdW1lX3RpdGxlKTtcblxuXHRpZiAoIW9wdGlvbnNSdW50aW1lLm5vRGlyUHJlZml4KVxuXHR7XG5cdFx0X3ZpZCA9IHBhZFN0YXJ0KHZpZCk7XG5cblx0XHRfdmlkICs9ICdfJztcblx0fVxuXG5cdGlmICghZGlybmFtZSAmJiBvcHRpb25zUnVudGltZS5hbGxvd0VtcHR5Vm9sdW1lVGl0bGUpXG5cdHtcblx0XHRkaXJuYW1lID0gdmlkLnRvU3RyaW5nKCkgKyAnZW1wdHknO1xuXHR9XG5cblx0aWYgKCFkaXJuYW1lKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYHZvbHVtZV90aXRsZSBpcyBlbXB0eWApO1xuXHR9XG5cblx0ZGlybmFtZSA9IHBhdGguam9pbihwYXRoX25vdmVsLFxuXHRcdGAke192aWR9JHtkaXJuYW1lfWBcblx0KTtcblxuXHRyZXR1cm4gZGlybmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVQYXRoKHNlbGY6IE5vdmVsU2l0ZSwge1xuXHRjaGFwdGVyLFxuXHRjaWQsXG5cdGRpcm5hbWUsXG5cdGV4dCA9ICcudHh0JyxcblxuXHRpZHgsXG5cblx0dm9sdW1lLFxuXHR2aWQsXG59OiB7XG5cdGNoYXB0ZXI6IE5vdmVsU2l0ZS5JQ2hhcHRlcixcblx0Y2lkOiBudW1iZXIsXG5cdGRpcm5hbWU6IHN0cmluZyxcblx0ZXh0Pzogc3RyaW5nLFxuXG5cdGlkeDogbnVtYmVyLFxuXG5cdHZvbHVtZT86IE5vdmVsU2l0ZS5JVm9sdW1lLFxuXHR2aWQ/OiBudW1iZXIsXG59LCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lID0ge30pOiBzdHJpbmdcbntcblx0bGV0IGZpbGU6IHN0cmluZztcblx0bGV0IHByZWZpeCA9ICcnO1xuXHRsZXQgcGFkID0gJyc7XG5cblx0ZmlsZSA9IHNlbGYudHJpbUZpbGVuYW1lQ2hhcHRlcihjaGFwdGVyLmNoYXB0ZXJfdGl0bGUpO1xuXG5cdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaXJlUHJlZml4KVxuXHR7XG5cdFx0bGV0IGlkeHg6IG51bWJlciB8IHN0cmluZztcblxuXHRcdGlmIChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDEpXG5cdFx0e1xuXHRcdFx0aWYgKGlzVW5kZWYoY2hhcHRlci5jaGFwdGVyX2luZGV4LCAnJywgdHJ1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdGlkeHggPSAnJztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID09IDMgfHwgb3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPiA0KVxuXHRcdFx0e1xuXHRcdFx0XHRpZHh4ID0gaWR4O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRpZHh4ID0gY2hhcHRlci5jaGFwdGVyX2luZGV4IGFzIG51bWJlcjtcblxuXHRcdFx0XHRpZiAob3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkeHggKz0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDAgfHwgaXNVbmRlZihjaGFwdGVyLmNoYXB0ZXJfaW5kZXgpKVxuXHRcdHtcblx0XHRcdGlkeHggPSBjaWQ7XG5cblx0XHRcdGlmIChvcHRpb25zUnVudGltZS5zdGFydEluZGV4KVxuXHRcdFx0e1xuXHRcdFx0XHRpZHh4ICs9IG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXg7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSlcblx0XHR7XG5cdFx0XHRpZHh4ID0gaWR4O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aWR4eCA9IGNoYXB0ZXIuY2hhcHRlcl9pbmRleDtcblx0XHR9XG5cblx0XHRpZiAoaWR4eCAhPT0gJycpXG5cdFx0e1xuXHRcdFx0cHJlZml4ID0gcGFkU3RhcnQoaWR4eCk7XG5cdFx0XHRwcmVmaXggKz0gJ18nO1xuXHRcdH1cblx0fVxuXG5cdGlmICghb3B0aW9uc1J1bnRpbWUubm9GaWxlUGFkZW5kICYmIGNoYXB0ZXIuY2hhcHRlcl9kYXRlKVxuXHR7XG5cdFx0cGFkID0gJy4nICsgY2hhcHRlci5jaGFwdGVyX2RhdGUuZm9ybWF0KCdZWVlZTU1EREhIbW0nKTtcblx0fVxuXG5cdGlmICghZmlsZSlcblx0e1xuXHRcdHRocm93IF9jcmVhdGVFcnJvcihgY2hhcHRlcl90aXRsZSBpcyBlbXB0eSAke2NoYXB0ZXIuY2hhcHRlcl90aXRsZX1gKTtcblx0fVxuXG5cdGlmICghZGlybmFtZSlcblx0e1xuXHRcdHRocm93IF9jcmVhdGVFcnJvcihgZGlybmFtZSBpcyBlbXB0eSAke2Rpcm5hbWV9YCk7XG5cdH1cblxuXHRsZXQgZnVsbGZpbGUgPSBwYXRoLmpvaW4oZGlybmFtZSxcblx0XHRgJHtwcmVmaXh9JHtmaWxlfSR7cGFkfSR7ZXh0fWBcblx0KTtcblxuXHRyZXR1cm4gZnVsbGZpbGU7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVFcnJvcjxUPihtc2c6IHN0cmluZywgX2RhdGE/OiBUKTogUmFuZ2VFcnJvciAmIHtcblx0X2RhdGE6IFQsXG59XG57XG5cdGxldCBlID0gbmV3IFJhbmdlRXJyb3IobXNnKTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGUuX2RhdGEgPSBfZGF0YTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdHJldHVybiBlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vZnMnKTtcbiJdfQ==