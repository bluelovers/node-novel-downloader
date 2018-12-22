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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0gsa0NBQWtDO0FBRWxDLCtCQUErQjtBQUUvQixTQUFnQixRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFOUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDL0MsQ0FBQztBQUhELDRCQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQWUsRUFBRSxFQUM5QyxNQUFNLEVBQ04sR0FBRyxFQUNILFVBQVUsR0FLVixFQUFFLGNBQStCO0lBRWpDLElBQUksT0FBZSxDQUFDO0lBQ3BCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVkLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUMvQjtRQUNDLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxJQUFJLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxjQUFjLENBQUMscUJBQXFCLEVBQ3BEO1FBQ0MsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7S0FDbkM7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUNaO1FBQ0MsTUFBTSxJQUFJLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUM3QixHQUFHLElBQUksR0FBRyxPQUFPLEVBQUUsQ0FDbkIsQ0FBQztJQUVGLE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUM7QUFyQ0Qsc0NBcUNDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQWUsRUFBRSxFQUM1QyxPQUFPLEVBQ1AsR0FBRyxFQUNILE9BQU8sRUFDUCxHQUFHLEdBQUcsTUFBTSxFQUVaLEdBQUcsRUFFSCxNQUFNLEVBQ04sR0FBRyxHQVdILEVBQUUsaUJBQWtDLEVBQUU7SUFFdEMsSUFBSSxJQUFZLENBQUM7SUFDakIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUViLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUNoQztRQUNDLElBQUksSUFBcUIsQ0FBQztRQUUxQixJQUFJLGNBQWMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxFQUNyQztZQUNDLElBQUksY0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUM1QztnQkFDQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7aUJBQ0ksSUFBSSxjQUFjLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsY0FBYyxHQUFHLENBQUMsRUFDaEY7Z0JBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQzthQUNYO2lCQUVEO2dCQUNDLElBQUksR0FBRyxPQUFPLENBQUMsYUFBdUIsQ0FBQztnQkFFdkMsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUM3QjtvQkFDQyxJQUFJLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQztpQkFDbEM7YUFDRDtTQUNEO2FBQ0ksSUFBSSxjQUFjLENBQUMsY0FBYyxHQUFHLENBQUMsSUFBSSxjQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUM1RTtZQUNDLElBQUksR0FBRyxHQUFHLENBQUM7WUFFWCxJQUFJLGNBQWMsQ0FBQyxVQUFVLEVBQzdCO2dCQUNDLElBQUksSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1NBQ0Q7YUFDSSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFDdkM7WUFDQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQ1g7YUFFRDtZQUNDLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxJQUFJLEtBQUssRUFBRSxFQUNmO1lBQ0MsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixNQUFNLElBQUksR0FBRyxDQUFDO1NBQ2Q7S0FDRDtJQUVELElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQ3hEO1FBQ0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN4RDtJQUVELElBQUksQ0FBQyxJQUFJLEVBQ1Q7UUFDQyxNQUFNLElBQUksVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDL0M7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUNaO1FBQ0MsTUFBTSxJQUFJLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3pDO0lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUN2QixHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FDekUsQ0FBQztJQUVGLE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQWpHRCxrQ0FpR0M7QUFFRCw2QkFBNkI7QUFFN0Isa0JBQWUsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE4LzAxOC5cbiAqL1xuXG5pbXBvcnQgZnMsIHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYnO1xuaW1wb3J0IHsgaXNVbmRlZiB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IE5vdmVsU2l0ZSwgeyBJT3B0aW9uc1J1bnRpbWUgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAndXBhdGgyJztcblxuZXhwb3J0IGZ1bmN0aW9uIHBhZFN0YXJ0KGlkLCBwYWQgPSAnMCcsIGxlbiA9IDQpOiBzdHJpbmdcbntcblx0cmV0dXJuIGlkLnRvU3RyaW5nKCkucGFkU3RhcnQobGVuLCAnMCcpICsgcGFkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Vm9sdW1lUGF0aChzZWxmOiBOb3ZlbFNpdGUsIHtcblx0dm9sdW1lLFxuXHR2aWQsXG5cdHBhdGhfbm92ZWwsXG59OiB7XG5cdHZvbHVtZTogTm92ZWxTaXRlLklWb2x1bWUsXG5cdHZpZDogbnVtYmVyLFxuXHRwYXRoX25vdmVsOiBzdHJpbmcsXG59LCBvcHRpb25zUnVudGltZTogSU9wdGlvbnNSdW50aW1lKTogc3RyaW5nXG57XG5cdGxldCBkaXJuYW1lOiBzdHJpbmc7XG5cdGxldCBfdmlkID0gJyc7XG5cblx0ZGlybmFtZSA9IHNlbGYudHJpbUZpbGVuYW1lVm9sdW1lKHZvbHVtZS52b2x1bWVfdGl0bGUpO1xuXG5cdGlmICghb3B0aW9uc1J1bnRpbWUubm9EaXJQcmVmaXgpXG5cdHtcblx0XHRfdmlkID0gcGFkU3RhcnQodmlkKTtcblxuXHRcdF92aWQgKz0gJ18nO1xuXHR9XG5cblx0aWYgKCFkaXJuYW1lICYmIG9wdGlvbnNSdW50aW1lLmFsbG93RW1wdHlWb2x1bWVUaXRsZSlcblx0e1xuXHRcdGRpcm5hbWUgPSB2aWQudG9TdHJpbmcoKSArICdlbXB0eSc7XG5cdH1cblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgdm9sdW1lX3RpdGxlIGlzIGVtcHR5YCk7XG5cdH1cblxuXHRkaXJuYW1lID0gcGF0aC5qb2luKHBhdGhfbm92ZWwsXG5cdFx0YCR7X3ZpZH0ke2Rpcm5hbWV9YFxuXHQpO1xuXG5cdHJldHVybiBkaXJuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVBhdGgoc2VsZjogTm92ZWxTaXRlLCB7XG5cdGNoYXB0ZXIsXG5cdGNpZCxcblx0ZGlybmFtZSxcblx0ZXh0ID0gJy50eHQnLFxuXG5cdGlkeCxcblxuXHR2b2x1bWUsXG5cdHZpZCxcbn06IHtcblx0Y2hhcHRlcjogTm92ZWxTaXRlLklDaGFwdGVyLFxuXHRjaWQ6IG51bWJlcixcblx0ZGlybmFtZTogc3RyaW5nLFxuXHRleHQ/OiBzdHJpbmcsXG5cblx0aWR4OiBudW1iZXIsXG5cblx0dm9sdW1lPzogTm92ZWxTaXRlLklWb2x1bWUsXG5cdHZpZD86IG51bWJlcixcbn0sIG9wdGlvbnNSdW50aW1lOiBJT3B0aW9uc1J1bnRpbWUgPSB7fSk6IHN0cmluZ1xue1xuXHRsZXQgZmlsZTogc3RyaW5nO1xuXHRsZXQgcHJlZml4ID0gJyc7XG5cdGxldCBwYWQgPSAnJztcblxuXHRmaWxlID0gc2VsZi50cmltRmlsZW5hbWVDaGFwdGVyKGNoYXB0ZXIuY2hhcHRlcl90aXRsZSk7XG5cblx0aWYgKCFvcHRpb25zUnVudGltZS5ub0ZpcmVQcmVmaXgpXG5cdHtcblx0XHRsZXQgaWR4eDogbnVtYmVyIHwgc3RyaW5nO1xuXG5cdFx0aWYgKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMSlcblx0XHR7XG5cdFx0XHRpZiAoaXNVbmRlZihjaGFwdGVyLmNoYXB0ZXJfaW5kZXgsICcnLCB0cnVlKSlcblx0XHRcdHtcblx0XHRcdFx0aWR4eCA9ICcnO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3B0aW9uc1J1bnRpbWUuZmlsZVByZWZpeE1vZGUgPT0gMyB8fCBvcHRpb25zUnVudGltZS5maWxlUHJlZml4TW9kZSA+IDQpXG5cdFx0XHR7XG5cdFx0XHRcdGlkeHggPSBpZHg7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGlkeHggPSBjaGFwdGVyLmNoYXB0ZXJfaW5kZXggYXMgbnVtYmVyO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zUnVudGltZS5zdGFydEluZGV4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWR4eCArPSBvcHRpb25zUnVudGltZS5zdGFydEluZGV4O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlID4gMCB8fCBpc1VuZGVmKGNoYXB0ZXIuY2hhcHRlcl9pbmRleCkpXG5cdFx0e1xuXHRcdFx0aWR4eCA9IGNpZDtcblxuXHRcdFx0aWYgKG9wdGlvbnNSdW50aW1lLnN0YXJ0SW5kZXgpXG5cdFx0XHR7XG5cdFx0XHRcdGlkeHggKz0gb3B0aW9uc1J1bnRpbWUuc3RhcnRJbmRleDtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoIW9wdGlvbnNSdW50aW1lLmZpbGVQcmVmaXhNb2RlKVxuXHRcdHtcblx0XHRcdGlkeHggPSBpZHg7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRpZHh4ID0gY2hhcHRlci5jaGFwdGVyX2luZGV4O1xuXHRcdH1cblxuXHRcdGlmIChpZHh4ICE9PSAnJylcblx0XHR7XG5cdFx0XHRwcmVmaXggPSBwYWRTdGFydChpZHh4KTtcblx0XHRcdHByZWZpeCArPSAnXyc7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFvcHRpb25zUnVudGltZS5ub0ZpbGVQYWRlbmQgJiYgY2hhcHRlci5jaGFwdGVyX2RhdGUpXG5cdHtcblx0XHRwYWQgPSAnLicgKyBjaGFwdGVyLmNoYXB0ZXJfZGF0ZS5mb3JtYXQoJ1lZWVlNTURESEhtbScpO1xuXHR9XG5cblx0aWYgKCFmaWxlKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYGNoYXB0ZXJfdGl0bGUgaXMgZW1wdHlgKTtcblx0fVxuXG5cdGlmICghZGlybmFtZSlcblx0e1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGBkaXJuYW1lIGlzIGVtcHR5YCk7XG5cdH1cblxuXHRmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsXG5cdFx0YCR7cHJlZml4fSR7c2VsZi50cmltRmlsZW5hbWVDaGFwdGVyKGNoYXB0ZXIuY2hhcHRlcl90aXRsZSl9JHtwYWR9JHtleHR9YFxuXHQpO1xuXG5cdHJldHVybiBmaWxlO1xufVxuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gJy4vZnMnO1xuXG5leHBvcnQgZGVmYXVsdCBzZWxmO1xuXG4iXX0=