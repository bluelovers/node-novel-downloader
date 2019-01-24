"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_iconv_1 = require("fs-iconv");
const request = require("request-promise");
const jsdom_extra_1 = require("jsdom-extra");
const Promise = require("bluebird");
const path = require("path");
function download_image(img, options) {
    let dirname = options.dir || path.dirname(options.fromfile);
    if (!dirname) {
        throw new Error();
    }
    let url = new jsdom_extra_1.URL(img);
    let filename = options.name || path.basename(url.href);
    if (typeof options.prefix == 'string') {
        filename = options.prefix + filename;
    }
    filename = fs_iconv_1.trimFilename(filename);
    let file = path.join(dirname, filename);
    let ret = request(url.href, {
        encoding: null,
        resolveWithFullResponse: true,
    })
        .then(async function (res) {
        //console.log(res);
        await fs_iconv_1.default.saveFile(file, res.body);
        return {
            body: res.body,
            url,
            dirname,
            filename,
            outputFile: file,
        };
    });
    // @ts-ignore
    return Promise.resolve(ret);
}
exports.download_image = download_image;
exports.default = download_image;
//export default exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsdUNBQTRDO0FBQzVDLDJDQUEyQztBQUMzQyw2Q0FBa0M7QUFDbEMsb0NBQXFDO0FBRXJDLDZCQUE2QjtBQUU3QixTQUFnQixjQUFjLENBQUMsR0FBaUIsRUFBRSxPQU9qRDtJQVFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUQsSUFBSSxDQUFDLE9BQU8sRUFDWjtRQUNDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztLQUNsQjtJQUVELElBQUksR0FBRyxHQUFHLElBQUksaUJBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV2QixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxJQUFJLFFBQVEsRUFDckM7UUFDQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7S0FDckM7SUFFRCxRQUFRLEdBQUcsdUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUV4QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUMzQixRQUFRLEVBQUUsSUFBSTtRQUNkLHVCQUF1QixFQUFFLElBQUk7S0FDN0IsQ0FBQztTQUNBLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRztRQUV4QixtQkFBbUI7UUFFbkIsTUFBTSxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU87WUFDTixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQWM7WUFDeEIsR0FBRztZQUNILE9BQU87WUFDUCxRQUFRO1lBQ1IsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQTtJQUNGLENBQUMsQ0FBQyxDQUNGO0lBRUQsYUFBYTtJQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBekRELHdDQXlEQztBQUVELGtCQUFlLGNBQWMsQ0FBQztBQUM5Qix5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzEvMTcvMDE3LlxuICovXG5cbmltcG9ydCBmcywgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgKiBhcyByZXF1ZXN0IGZyb20gJ3JlcXVlc3QtcHJvbWlzZSc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGRvd25sb2FkX2ltYWdlKGltZzogc3RyaW5nIHwgVVJMLCBvcHRpb25zOiB7XG5cdG5hbWU/OiBzdHJpbmcsXG5cblx0ZGlyPzogc3RyaW5nLFxuXHRmcm9tZmlsZT86IHN0cmluZyxcblxuXHRwcmVmaXg/OiBzdHJpbmcsXG59KTogUHJvbWlzZTx7XG5cdGJvZHk6IEJ1ZmZlcjtcblx0dXJsOiBVUkw7XG5cdGRpcm5hbWU6IHN0cmluZztcblx0ZmlsZW5hbWU6IHN0cmluZztcblx0b3V0cHV0RmlsZTogc3RyaW5nO1xufT5cbntcblx0bGV0IGRpcm5hbWUgPSBvcHRpb25zLmRpciB8fCBwYXRoLmRpcm5hbWUob3B0aW9ucy5mcm9tZmlsZSk7XG5cblx0aWYgKCFkaXJuYW1lKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdH1cblxuXHRsZXQgdXJsID0gbmV3IFVSTChpbWcpO1xuXG5cdGxldCBmaWxlbmFtZSA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHVybC5ocmVmKTtcblxuXHRpZiAodHlwZW9mIG9wdGlvbnMucHJlZml4ID09ICdzdHJpbmcnKVxuXHR7XG5cdFx0ZmlsZW5hbWUgPSBvcHRpb25zLnByZWZpeCArIGZpbGVuYW1lO1xuXHR9XG5cblx0ZmlsZW5hbWUgPSB0cmltRmlsZW5hbWUoZmlsZW5hbWUpO1xuXG5cdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsIGZpbGVuYW1lKTtcblxuXHRsZXQgcmV0ID0gcmVxdWVzdCh1cmwuaHJlZiwge1xuXHRcdGVuY29kaW5nOiBudWxsLFxuXHRcdHJlc29sdmVXaXRoRnVsbFJlc3BvbnNlOiB0cnVlLFxuXHR9KVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXMpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhyZXMpO1xuXG5cdFx0XHRhd2FpdCBmcy5zYXZlRmlsZShmaWxlLCByZXMuYm9keSk7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJvZHk6IHJlcy5ib2R5IGFzIEJ1ZmZlcixcblx0XHRcdFx0dXJsLFxuXHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRmaWxlbmFtZSxcblx0XHRcdFx0b3V0cHV0RmlsZTogZmlsZSxcblx0XHRcdH1cblx0XHR9KVxuXHQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvd25sb2FkX2ltYWdlO1xuLy9leHBvcnQgZGVmYXVsdCBleHBvcnRzO1xuIl19