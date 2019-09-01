"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-iconv");
const util_1 = require("fs-iconv/util");
const request = require("request-promise");
const jsdom_extra_1 = require("jsdom-extra");
const Promise = require("bluebird");
const path = require("upath2");
function download_image(img, options) {
    let dirname = options.dir || path.dirname(options.fromfile);
    if (!dirname) {
        throw new Error();
    }
    // @ts-ignore
    let url = new jsdom_extra_1.URL(img);
    let filename = options.name || path.basename(url.href);
    if (typeof options.prefix == 'string') {
        filename = options.prefix + filename;
    }
    filename = util_1.trimFilename(filename);
    let file = path.join(dirname, filename);
    let ret = request(url.href, {
        encoding: null,
        resolveWithFullResponse: true,
    })
        .then(async function (res) {
        //console.log(res);
        await fs.saveFile(file, res.body);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywyQ0FBNEM7QUFDNUMsNkNBQWtDO0FBQ2xDLG9DQUFxQztBQUVyQywrQkFBZ0M7QUFFaEMsU0FBZ0IsY0FBYyxDQUFDLEdBQWlCLEVBQUUsT0FPakQ7SUFRQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxPQUFPLEVBQ1o7UUFDQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7S0FDbEI7SUFFRCxhQUFhO0lBQ2IsSUFBSSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXZCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdkQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLElBQUksUUFBUSxFQUNyQztRQUNDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztLQUNyQztJQUVELFFBQVEsR0FBRyxtQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWxDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRXhDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQzNCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsdUJBQXVCLEVBQUUsSUFBSTtLQUM3QixDQUFDO1NBQ0EsSUFBSSxDQUFDLEtBQUssV0FBVyxHQUFHO1FBRXhCLG1CQUFtQjtRQUVuQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxPQUFPO1lBQ04sSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFjO1lBQ3hCLEdBQUc7WUFDSCxPQUFPO1lBQ1AsUUFBUTtZQUNSLFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUE7SUFDRixDQUFDLENBQUMsQ0FDRjtJQUVELGFBQWE7SUFDYixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQTFERCx3Q0EwREM7QUFFRCxrQkFBZSxjQUFjLENBQUM7QUFDOUIseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8xLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1pY29udicpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IFByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5cbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZF9pbWFnZShpbWc6IHN0cmluZyB8IFVSTCwgb3B0aW9uczoge1xuXHRuYW1lPzogc3RyaW5nLFxuXG5cdGRpcj86IHN0cmluZyxcblx0ZnJvbWZpbGU/OiBzdHJpbmcsXG5cblx0cHJlZml4Pzogc3RyaW5nLFxufSk6IFByb21pc2U8e1xuXHRib2R5OiBCdWZmZXI7XG5cdHVybDogVVJMO1xuXHRkaXJuYW1lOiBzdHJpbmc7XG5cdGZpbGVuYW1lOiBzdHJpbmc7XG5cdG91dHB1dEZpbGU6IHN0cmluZztcbn0+XG57XG5cdGxldCBkaXJuYW1lID0gb3B0aW9ucy5kaXIgfHwgcGF0aC5kaXJuYW1lKG9wdGlvbnMuZnJvbWZpbGUpO1xuXG5cdGlmICghZGlybmFtZSlcblx0e1xuXHRcdHRocm93IG5ldyBFcnJvcigpO1xuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgdXJsID0gbmV3IFVSTChpbWcpO1xuXG5cdGxldCBmaWxlbmFtZSA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHVybC5ocmVmKTtcblxuXHRpZiAodHlwZW9mIG9wdGlvbnMucHJlZml4ID09ICdzdHJpbmcnKVxuXHR7XG5cdFx0ZmlsZW5hbWUgPSBvcHRpb25zLnByZWZpeCArIGZpbGVuYW1lO1xuXHR9XG5cblx0ZmlsZW5hbWUgPSB0cmltRmlsZW5hbWUoZmlsZW5hbWUpO1xuXG5cdGxldCBmaWxlID0gcGF0aC5qb2luKGRpcm5hbWUsIGZpbGVuYW1lKTtcblxuXHRsZXQgcmV0ID0gcmVxdWVzdCh1cmwuaHJlZiwge1xuXHRcdGVuY29kaW5nOiBudWxsLFxuXHRcdHJlc29sdmVXaXRoRnVsbFJlc3BvbnNlOiB0cnVlLFxuXHR9KVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXMpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhyZXMpO1xuXG5cdFx0XHRhd2FpdCBmcy5zYXZlRmlsZShmaWxlLCByZXMuYm9keSk7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJvZHk6IHJlcy5ib2R5IGFzIEJ1ZmZlcixcblx0XHRcdFx0dXJsLFxuXHRcdFx0XHRkaXJuYW1lLFxuXHRcdFx0XHRmaWxlbmFtZSxcblx0XHRcdFx0b3V0cHV0RmlsZTogZmlsZSxcblx0XHRcdH1cblx0XHR9KVxuXHQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvd25sb2FkX2ltYWdlO1xuLy9leHBvcnQgZGVmYXVsdCBleHBvcnRzO1xuIl19