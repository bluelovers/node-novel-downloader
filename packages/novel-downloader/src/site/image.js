"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const util_1 = require("fs-iconv/util");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywyQ0FBMkM7QUFDM0MsNkNBQWtDO0FBQ2xDLG9DQUFxQztBQUVyQyw2QkFBNkI7QUFFN0IsU0FBZ0IsY0FBYyxDQUFDLEdBQWlCLEVBQUUsT0FPakQ7SUFRQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxPQUFPLEVBQ1o7UUFDQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7S0FDbEI7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLGlCQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFdkIsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV2RCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQ3JDO1FBQ0MsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0tBQ3JDO0lBRUQsUUFBUSxHQUFHLG1CQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFeEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDM0IsUUFBUSxFQUFFLElBQUk7UUFDZCx1QkFBdUIsRUFBRSxJQUFJO0tBQzdCLENBQUM7U0FDQSxJQUFJLENBQUMsS0FBSyxXQUFXLEdBQUc7UUFFeEIsbUJBQW1CO1FBRW5CLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU87WUFDTixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQWM7WUFDeEIsR0FBRztZQUNILE9BQU87WUFDUCxRQUFRO1lBQ1IsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQTtJQUNGLENBQUMsQ0FBQyxDQUNGO0lBRUQsYUFBYTtJQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBekRELHdDQXlEQztBQUVELGtCQUFlLGNBQWMsQ0FBQztBQUM5Qix5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzEvMTcvMDE3LlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCAqIGFzIHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRfaW1hZ2UoaW1nOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM6IHtcblx0bmFtZT86IHN0cmluZyxcblxuXHRkaXI/OiBzdHJpbmcsXG5cdGZyb21maWxlPzogc3RyaW5nLFxuXG5cdHByZWZpeD86IHN0cmluZyxcbn0pOiBQcm9taXNlPHtcblx0Ym9keTogQnVmZmVyO1xuXHR1cmw6IFVSTDtcblx0ZGlybmFtZTogc3RyaW5nO1xuXHRmaWxlbmFtZTogc3RyaW5nO1xuXHRvdXRwdXRGaWxlOiBzdHJpbmc7XG59Plxue1xuXHRsZXQgZGlybmFtZSA9IG9wdGlvbnMuZGlyIHx8IHBhdGguZGlybmFtZShvcHRpb25zLmZyb21maWxlKTtcblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0fVxuXG5cdGxldCB1cmwgPSBuZXcgVVJMKGltZyk7XG5cblx0bGV0IGZpbGVuYW1lID0gb3B0aW9ucy5uYW1lIHx8IHBhdGguYmFzZW5hbWUodXJsLmhyZWYpO1xuXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5wcmVmaXggPT0gJ3N0cmluZycpXG5cdHtcblx0XHRmaWxlbmFtZSA9IG9wdGlvbnMucHJlZml4ICsgZmlsZW5hbWU7XG5cdH1cblxuXHRmaWxlbmFtZSA9IHRyaW1GaWxlbmFtZShmaWxlbmFtZSk7XG5cblx0bGV0IGZpbGUgPSBwYXRoLmpvaW4oZGlybmFtZSwgZmlsZW5hbWUpO1xuXG5cdGxldCByZXQgPSByZXF1ZXN0KHVybC5ocmVmLCB7XG5cdFx0ZW5jb2Rpbmc6IG51bGwsXG5cdFx0cmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG5cdH0pXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJlcylcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHJlcyk7XG5cblx0XHRcdGF3YWl0IGZzLnNhdmVGaWxlKGZpbGUsIHJlcy5ib2R5KTtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Ym9keTogcmVzLmJvZHkgYXMgQnVmZmVyLFxuXHRcdFx0XHR1cmwsXG5cdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdGZpbGVuYW1lLFxuXHRcdFx0XHRvdXRwdXRGaWxlOiBmaWxlLFxuXHRcdFx0fVxuXHRcdH0pXG5cdDtcblxuXHQvLyBAdHMtaWdub3JlXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUocmV0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZG93bmxvYWRfaW1hZ2U7XG4vL2V4cG9ydCBkZWZhdWx0IGV4cG9ydHM7XG4iXX0=