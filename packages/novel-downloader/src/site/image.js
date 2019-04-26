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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsK0JBQWdDO0FBQ2hDLHdDQUE2QztBQUM3QywyQ0FBNEM7QUFDNUMsNkNBQWtDO0FBQ2xDLG9DQUFxQztBQUVyQyw2QkFBOEI7QUFFOUIsU0FBZ0IsY0FBYyxDQUFDLEdBQWlCLEVBQUUsT0FPakQ7SUFRQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxPQUFPLEVBQ1o7UUFDQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7S0FDbEI7SUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLGlCQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFdkIsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV2RCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQ3JDO1FBQ0MsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0tBQ3JDO0lBRUQsUUFBUSxHQUFHLG1CQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFeEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDM0IsUUFBUSxFQUFFLElBQUk7UUFDZCx1QkFBdUIsRUFBRSxJQUFJO0tBQzdCLENBQUM7U0FDQSxJQUFJLENBQUMsS0FBSyxXQUFXLEdBQUc7UUFFeEIsbUJBQW1CO1FBRW5CLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU87WUFDTixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQWM7WUFDeEIsR0FBRztZQUNILE9BQU87WUFDUCxRQUFRO1lBQ1IsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQTtJQUNGLENBQUMsQ0FBQyxDQUNGO0lBRUQsYUFBYTtJQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBekRELHdDQXlEQztBQUVELGtCQUFlLGNBQWMsQ0FBQztBQUM5Qix5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzEvMTcvMDE3LlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWljb252Jyk7XG5pbXBvcnQgeyB0cmltRmlsZW5hbWUgfSBmcm9tICdmcy1pY29udi91dGlsJztcbmltcG9ydCByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdqc2RvbS1leHRyYSc7XG5pbXBvcnQgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcblxuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZF9pbWFnZShpbWc6IHN0cmluZyB8IFVSTCwgb3B0aW9uczoge1xuXHRuYW1lPzogc3RyaW5nLFxuXG5cdGRpcj86IHN0cmluZyxcblx0ZnJvbWZpbGU/OiBzdHJpbmcsXG5cblx0cHJlZml4Pzogc3RyaW5nLFxufSk6IFByb21pc2U8e1xuXHRib2R5OiBCdWZmZXI7XG5cdHVybDogVVJMO1xuXHRkaXJuYW1lOiBzdHJpbmc7XG5cdGZpbGVuYW1lOiBzdHJpbmc7XG5cdG91dHB1dEZpbGU6IHN0cmluZztcbn0+XG57XG5cdGxldCBkaXJuYW1lID0gb3B0aW9ucy5kaXIgfHwgcGF0aC5kaXJuYW1lKG9wdGlvbnMuZnJvbWZpbGUpO1xuXG5cdGlmICghZGlybmFtZSlcblx0e1xuXHRcdHRocm93IG5ldyBFcnJvcigpO1xuXHR9XG5cblx0bGV0IHVybCA9IG5ldyBVUkwoaW1nKTtcblxuXHRsZXQgZmlsZW5hbWUgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZSh1cmwuaHJlZik7XG5cblx0aWYgKHR5cGVvZiBvcHRpb25zLnByZWZpeCA9PSAnc3RyaW5nJylcblx0e1xuXHRcdGZpbGVuYW1lID0gb3B0aW9ucy5wcmVmaXggKyBmaWxlbmFtZTtcblx0fVxuXG5cdGZpbGVuYW1lID0gdHJpbUZpbGVuYW1lKGZpbGVuYW1lKTtcblxuXHRsZXQgZmlsZSA9IHBhdGguam9pbihkaXJuYW1lLCBmaWxlbmFtZSk7XG5cblx0bGV0IHJldCA9IHJlcXVlc3QodXJsLmhyZWYsIHtcblx0XHRlbmNvZGluZzogbnVsbCxcblx0XHRyZXNvbHZlV2l0aEZ1bGxSZXNwb25zZTogdHJ1ZSxcblx0fSlcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmVzKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cocmVzKTtcblxuXHRcdFx0YXdhaXQgZnMuc2F2ZUZpbGUoZmlsZSwgcmVzLmJvZHkpO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRib2R5OiByZXMuYm9keSBhcyBCdWZmZXIsXG5cdFx0XHRcdHVybCxcblx0XHRcdFx0ZGlybmFtZSxcblx0XHRcdFx0ZmlsZW5hbWUsXG5cdFx0XHRcdG91dHB1dEZpbGU6IGZpbGUsXG5cdFx0XHR9XG5cdFx0fSlcblx0O1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkb3dubG9hZF9pbWFnZTtcbi8vZXhwb3J0IGRlZmF1bHQgZXhwb3J0cztcbiJdfQ==