"use strict";
/**
 * Created by user on 2018/1/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.download_image = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILCtCQUFnQztBQUNoQyx3Q0FBNkM7QUFDN0MsMkNBQTRDO0FBQzVDLDZDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckMsK0JBQWdDO0FBRWhDLFNBQWdCLGNBQWMsQ0FBQyxHQUFpQixFQUFFLE9BT2pEO0lBUUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU1RCxJQUFJLENBQUMsT0FBTyxFQUNaO1FBQ0MsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO0tBQ2xCO0lBRUQsYUFBYTtJQUNiLElBQUksR0FBRyxHQUFHLElBQUksaUJBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV2QixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxJQUFJLFFBQVEsRUFDckM7UUFDQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7S0FDckM7SUFFRCxRQUFRLEdBQUcsbUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUV4QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUMzQixRQUFRLEVBQUUsSUFBSTtRQUNkLHVCQUF1QixFQUFFLElBQUk7S0FDN0IsQ0FBQztTQUNBLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRztRQUV4QixtQkFBbUI7UUFFbkIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEMsT0FBTztZQUNOLElBQUksRUFBRSxHQUFHLENBQUMsSUFBYztZQUN4QixHQUFHO1lBQ0gsT0FBTztZQUNQLFFBQVE7WUFDUixVQUFVLEVBQUUsSUFBSTtTQUNoQixDQUFBO0lBQ0YsQ0FBQyxDQUFDLENBQ0Y7SUFFRCxhQUFhO0lBQ2IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUExREQsd0NBMERDO0FBRUQsa0JBQWUsY0FBYyxDQUFDO0FBQzlCLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMS8xNy8wMTcuXG4gKi9cblxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtaWNvbnYnKTtcbmltcG9ydCB7IHRyaW1GaWxlbmFtZSB9IGZyb20gJ2ZzLWljb252L3V0aWwnO1xuaW1wb3J0IHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UnKTtcbmltcG9ydCB7IFVSTCB9IGZyb20gJ2pzZG9tLWV4dHJhJztcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xuXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRfaW1hZ2UoaW1nOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM6IHtcblx0bmFtZT86IHN0cmluZyxcblxuXHRkaXI/OiBzdHJpbmcsXG5cdGZyb21maWxlPzogc3RyaW5nLFxuXG5cdHByZWZpeD86IHN0cmluZyxcbn0pOiBQcm9taXNlPHtcblx0Ym9keTogQnVmZmVyO1xuXHR1cmw6IFVSTDtcblx0ZGlybmFtZTogc3RyaW5nO1xuXHRmaWxlbmFtZTogc3RyaW5nO1xuXHRvdXRwdXRGaWxlOiBzdHJpbmc7XG59Plxue1xuXHRsZXQgZGlybmFtZSA9IG9wdGlvbnMuZGlyIHx8IHBhdGguZGlybmFtZShvcHRpb25zLmZyb21maWxlKTtcblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IHVybCA9IG5ldyBVUkwoaW1nKTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZSh1cmwuaHJlZik7XG5cblx0aWYgKHR5cGVvZiBvcHRpb25zLnByZWZpeCA9PSAnc3RyaW5nJylcblx0e1xuXHRcdGZpbGVuYW1lID0gb3B0aW9ucy5wcmVmaXggKyBmaWxlbmFtZTtcblx0fVxuXG5cdGZpbGVuYW1lID0gdHJpbUZpbGVuYW1lKGZpbGVuYW1lKTtcblxuXHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCBmaWxlbmFtZSk7XG5cblx0bGV0IHJldCA9IHJlcXVlc3QodXJsLmhyZWYsIHtcblx0XHRlbmNvZGluZzogbnVsbCxcblx0XHRyZXNvbHZlV2l0aEZ1bGxSZXNwb25zZTogdHJ1ZSxcblx0fSlcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmVzKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cocmVzKTtcblxuXHRcdFx0YXdhaXQgZnMuc2F2ZUZpbGUoZmlsZSwgcmVzLmJvZHkpO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRib2R5OiByZXMuYm9keSBhcyBCdWZmZXIsXG5cdFx0XHRcdHVybCxcblx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0ZmlsZW5hbWUsXG5cdFx0XHRcdG91dHB1dEZpbGU6IGZpbGUsXG5cdFx0XHR9XG5cdFx0fSlcblx0O1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkb3dubG9hZF9pbWFnZTtcbi8vZXhwb3J0IGRlZmF1bHQgZXhwb3J0cztcbiJdfQ==