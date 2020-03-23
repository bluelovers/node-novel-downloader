"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /kakuyomu\.jp/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let pad = (!bool && urlobj.chapter_id) ? '/episodes/' + urlobj.chapter_id : '';
    let url = `https://kakuyomu.jp/works/${urlobj.novel_id}${pad}`;
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /^(\d{10,})$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /kakuyomu\.jp\/works\/(\d+)(?:\/(?:episodes\/(\d+)))?/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0NBQThFO0FBRTlFLFNBQWdCLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7SUFFdEUsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQVMsQ0FBQyxHQUFVLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBd0IsRUFBRSxHQUFHLElBQUk7SUFFckYsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFL0UsSUFBSSxHQUFHLEdBQUcsNkJBQTZCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFL0QsT0FBTyxhQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQVBELDBCQU9DO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQTJCLEVBQUUsR0FBRyxJQUFJO0lBRTVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcscUJBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUV2RCxJQUFJLENBQVMsQ0FBQztJQUNkLElBQUksQ0FBa0IsQ0FBQztJQUV2QixDQUFDLEdBQUcsYUFBYSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1FBQ0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsT0FBTyxNQUFNLENBQUM7S0FDZDtJQUVELENBQUMsR0FBRyx1REFBdUQsQ0FBQztJQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtRQUNDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE9BQU8sTUFBTSxDQUFDO0tBQ2Q7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUF4QkQsNEJBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgTm92ZWxTaXRlIGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBjcmVhdGVVUkwsIHsgX2hhbmRsZVBhcnNlVVJMLCBJUGFyc2VVcmxSdW50aW1lIH0gZnJvbSAnLi4vLi4vdXRpbC91cmwnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2sodXJsOiBzdHJpbmcgfCBVUkwgfCBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBvcHRpb25zPyk6IGJvb2xlYW5cbntcblx0cmV0dXJuIC9rYWt1eW9tdVxcLmpwL2kudGVzdChjcmVhdGVVUkwodXJsIGFzIGFueSkuaG9zdG5hbWUgfHwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcbntcblx0bGV0IHBhZCA9ICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZCkgPyAnL2VwaXNvZGVzLycgKyB1cmxvYmouY2hhcHRlcl9pZCA6ICcnO1xuXG5cdGxldCB1cmwgPSBgaHR0cHM6Ly9rYWt1eW9tdS5qcC93b3Jrcy8ke3VybG9iai5ub3ZlbF9pZH0ke3BhZH1gO1xuXG5cdHJldHVybiBjcmVhdGVVUkwodXJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVXJsKF91cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcbntcblx0Y29uc3QgeyB1cmxvYmosIHVybCB9ID0gX2hhbmRsZVBhcnNlVVJMKF91cmwsIC4uLmFyZ3YpO1xuXG5cdGxldCByOiBSZWdFeHA7XG5cdGxldCBtOiBSZWdFeHBFeGVjQXJyYXk7XG5cblx0ciA9IC9eKFxcZHsxMCx9KSQvO1xuXHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHR7XG5cdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0ciA9IC9rYWt1eW9tdVxcLmpwXFwvd29ya3NcXC8oXFxkKykoPzpcXC8oPzplcGlzb2Rlc1xcLyhcXGQrKSkpPy9nO1xuXHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHR7XG5cdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cmV0dXJuIHVybG9iajtcbn1cbiJdfQ==