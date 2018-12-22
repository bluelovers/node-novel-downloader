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
    return Promise.resolve(ret);
}
exports.download_image = download_image;
exports.default = download_image;
//export default exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsdUNBQTRDO0FBQzVDLDJDQUEyQztBQUMzQyw2Q0FBa0M7QUFDbEMsb0NBQW9DO0FBRXBDLDZCQUE2QjtBQUU3QixTQUFnQixjQUFjLENBQUMsR0FBaUIsRUFBRSxPQU9qRDtJQVFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUQsSUFBSSxDQUFDLE9BQU8sRUFDWjtRQUNDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztLQUNsQjtJQUVELElBQUksR0FBRyxHQUFHLElBQUksaUJBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV2QixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxJQUFJLFFBQVEsRUFDckM7UUFDQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7S0FDckM7SUFFRCxRQUFRLEdBQUcsdUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUV4QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUMzQixRQUFRLEVBQUUsSUFBSTtRQUNkLHVCQUF1QixFQUFFLElBQUk7S0FDN0IsQ0FBQztTQUNBLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRztRQUV4QixtQkFBbUI7UUFFbkIsTUFBTSxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU87WUFDTixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQWM7WUFDeEIsR0FBRztZQUNILE9BQU87WUFDUCxRQUFRO1lBQ1IsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQTtJQUNGLENBQUMsQ0FBQyxDQUNGO0lBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUF4REQsd0NBd0RDO0FBRUQsa0JBQWUsY0FBYyxDQUFDO0FBQzlCLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMS8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IGZzLCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252JztcbmltcG9ydCAqIGFzIHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRfaW1hZ2UoaW1nOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM6IHtcblx0bmFtZT86IHN0cmluZyxcblxuXHRkaXI/OiBzdHJpbmcsXG5cdGZyb21maWxlPzogc3RyaW5nLFxuXG5cdHByZWZpeD86IHN0cmluZyxcbn0pOiBQcm9taXNlPHtcblx0Ym9keTogQnVmZmVyO1xuXHR1cmw6IFVSTDtcblx0ZGlybmFtZTogc3RyaW5nO1xuXHRmaWxlbmFtZTogc3RyaW5nO1xuXHRvdXRwdXRGaWxlOiBzdHJpbmc7XG59Plxue1xuXHRsZXQgZGlybmFtZSA9IG9wdGlvbnMuZGlyIHx8IHBhdGguZGlybmFtZShvcHRpb25zLmZyb21maWxlKTtcblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0fVxuXG5cdGxldCB1cmwgPSBuZXcgVVJMKGltZyk7XG5cblx0bGV0IGZpbGVuYW1lID0gb3B0aW9ucy5uYW1lIHx8IHBhdGguYmFzZW5hbWUodXJsLmhyZWYpO1xuXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5wcmVmaXggPT0gJ3N0cmluZycpXG5cdHtcblx0XHRmaWxlbmFtZSA9IG9wdGlvbnMucHJlZml4ICsgZmlsZW5hbWU7XG5cdH1cblxuXHRmaWxlbmFtZSA9IHRyaW1GaWxlbmFtZShmaWxlbmFtZSk7XG5cblx0bGV0IGZpbGUgPSBwYXRoLmpvaW4oZGlybmFtZSwgZmlsZW5hbWUpO1xuXG5cdGxldCByZXQgPSByZXF1ZXN0KHVybC5ocmVmLCB7XG5cdFx0ZW5jb2Rpbmc6IG51bGwsXG5cdFx0cmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG5cdH0pXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKHJlcylcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHJlcyk7XG5cblx0XHRcdGF3YWl0IGZzLnNhdmVGaWxlKGZpbGUsIHJlcy5ib2R5KTtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Ym9keTogcmVzLmJvZHkgYXMgQnVmZmVyLFxuXHRcdFx0XHR1cmwsXG5cdFx0XHRcdGRpcm5hbWUsXG5cdFx0XHRcdGZpbGVuYW1lLFxuXHRcdFx0XHRvdXRwdXRGaWxlOiBmaWxlLFxuXHRcdFx0fVxuXHRcdH0pXG5cdDtcblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvd25sb2FkX2ltYWdlO1xuLy9leHBvcnQgZGVmYXVsdCBleHBvcnRzO1xuIl19