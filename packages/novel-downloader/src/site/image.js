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
const path = require("path");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywyQ0FBNEM7QUFDNUMsNkNBQWtDO0FBQ2xDLG9DQUFxQztBQUVyQyw2QkFBOEI7QUFFOUIsU0FBZ0IsY0FBYyxDQUFDLEdBQWlCLEVBQUUsT0FPakQ7SUFRQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxPQUFPLEVBQ1o7UUFDQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7S0FDbEI7SUFFRCxhQUFhO0lBQ2IsSUFBSSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXZCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdkQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLElBQUksUUFBUSxFQUNyQztRQUNDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztLQUNyQztJQUVELFFBQVEsR0FBRyxtQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWxDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRXhDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQzNCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsdUJBQXVCLEVBQUUsSUFBSTtLQUM3QixDQUFDO1NBQ0EsSUFBSSxDQUFDLEtBQUssV0FBVyxHQUFHO1FBRXhCLG1CQUFtQjtRQUVuQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxPQUFPO1lBQ04sSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFjO1lBQ3hCLEdBQUc7WUFDSCxPQUFPO1lBQ1AsUUFBUTtZQUNSLFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUE7SUFDRixDQUFDLENBQUMsQ0FDRjtJQUVELGFBQWE7SUFDYixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQTFERCx3Q0EwREM7QUFFRCxrQkFBZSxjQUFjLENBQUM7QUFDOUIseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8xLzE3LzAxNy5cbiAqL1xuXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1pY29udicpO1xuaW1wb3J0IHsgdHJpbUZpbGVuYW1lIH0gZnJvbSAnZnMtaWNvbnYvdXRpbCc7XG5pbXBvcnQgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSAnanNkb20tZXh0cmEnO1xuaW1wb3J0IFByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5cbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRfaW1hZ2UoaW1nOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM6IHtcblx0bmFtZT86IHN0cmluZyxcblxuXHRkaXI/OiBzdHJpbmcsXG5cdGZyb21maWxlPzogc3RyaW5nLFxuXG5cdHByZWZpeD86IHN0cmluZyxcbn0pOiBQcm9taXNlPHtcblx0Ym9keTogQnVmZmVyO1xuXHR1cmw6IFVSTDtcblx0ZGlybmFtZTogc3RyaW5nO1xuXHRmaWxlbmFtZTogc3RyaW5nO1xuXHRvdXRwdXRGaWxlOiBzdHJpbmc7XG59Plxue1xuXHRsZXQgZGlybmFtZSA9IG9wdGlvbnMuZGlyIHx8IHBhdGguZGlybmFtZShvcHRpb25zLmZyb21maWxlKTtcblxuXHRpZiAoIWRpcm5hbWUpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IHVybCA9IG5ldyBVUkwoaW1nKTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZSh1cmwuaHJlZik7XG5cblx0aWYgKHR5cGVvZiBvcHRpb25zLnByZWZpeCA9PSAnc3RyaW5nJylcblx0e1xuXHRcdGZpbGVuYW1lID0gb3B0aW9ucy5wcmVmaXggKyBmaWxlbmFtZTtcblx0fVxuXG5cdGZpbGVuYW1lID0gdHJpbUZpbGVuYW1lKGZpbGVuYW1lKTtcblxuXHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCBmaWxlbmFtZSk7XG5cblx0bGV0IHJldCA9IHJlcXVlc3QodXJsLmhyZWYsIHtcblx0XHRlbmNvZGluZzogbnVsbCxcblx0XHRyZXNvbHZlV2l0aEZ1bGxSZXNwb25zZTogdHJ1ZSxcblx0fSlcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmVzKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cocmVzKTtcblxuXHRcdFx0YXdhaXQgZnMuc2F2ZUZpbGUoZmlsZSwgcmVzLmJvZHkpO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRib2R5OiByZXMuYm9keSBhcyBCdWZmZXIsXG5cdFx0XHRcdHVybCxcblx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0ZmlsZW5hbWUsXG5cdFx0XHRcdG91dHB1dEZpbGU6IGZpbGUsXG5cdFx0XHR9XG5cdFx0fSlcblx0O1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkb3dubG9hZF9pbWFnZTtcbi8vZXhwb3J0IGRlZmF1bHQgZXhwb3J0cztcbiJdfQ==