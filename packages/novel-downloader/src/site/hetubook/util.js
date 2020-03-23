"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /hetubook/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let cid = (!bool && urlobj.chapter_id) ? `${urlobj.chapter_id}.html` : 'index.html';
    url = `http://www.hetubook.com/book/${urlobj.novel_id}/${cid}`;
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /www\.hetubook\.com\/book\/(\d+)\/(?:(\d+)|index)\.html/;
    m = r.exec(url);
    if (m) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0NBQThFO0FBRTlFLFNBQWdCLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7SUFFdEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQVMsQ0FBQyxHQUFVLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBd0IsRUFBRSxHQUFHLElBQUk7SUFFckYsSUFBSSxHQUFXLENBQUM7SUFFaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFFcEYsR0FBRyxHQUFHLGdDQUFnQyxNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRS9ELE9BQU8sYUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFURCwwQkFTQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUEyQixFQUFFLEdBQUcsSUFBSTtJQUU1RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLHFCQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFFdkQsSUFBSSxDQUFTLENBQUM7SUFDZCxJQUFJLENBQWtCLENBQUM7SUFFdkIsQ0FBQyxHQUFHLHdEQUF3RCxDQUFDO0lBQzdELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksQ0FBQyxFQUNMO1FBQ0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekIsT0FBTyxNQUFNLENBQUM7S0FDZDtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQWxCRCw0QkFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBOb3ZlbFNpdGUgZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGNyZWF0ZVVSTCwgeyBfaGFuZGxlUGFyc2VVUkwsIElQYXJzZVVybFJ1bnRpbWUgfSBmcm9tICcuLi8uLi91dGlsL3VybCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxue1xuXHRyZXR1cm4gL2hldHVib29rL2kudGVzdChjcmVhdGVVUkwodXJsIGFzIGFueSkuaG9zdG5hbWUgfHwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcbntcblx0bGV0IHVybDogc3RyaW5nO1xuXG5cdGxldCBjaWQgPSAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpID8gYCR7dXJsb2JqLmNoYXB0ZXJfaWR9Lmh0bWxgIDogJ2luZGV4Lmh0bWwnO1xuXG5cdHVybCA9IGBodHRwOi8vd3d3LmhldHVib29rLmNvbS9ib29rLyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH1gO1xuXG5cdHJldHVybiBjcmVhdGVVUkwodXJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVXJsKF91cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcbntcblx0Y29uc3QgeyB1cmxvYmosIHVybCB9ID0gX2hhbmRsZVBhcnNlVVJMKF91cmwsIC4uLmFyZ3YpO1xuXG5cdGxldCByOiBSZWdFeHA7XG5cdGxldCBtOiBSZWdFeHBFeGVjQXJyYXk7XG5cblx0ciA9IC93d3dcXC5oZXR1Ym9va1xcLmNvbVxcL2Jvb2tcXC8oXFxkKylcXC8oPzooXFxkKyl8aW5kZXgpXFwuaHRtbC87XG5cdG0gPSByLmV4ZWModXJsKTtcblx0aWYgKG0pXG5cdHtcblx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRyZXR1cm4gdXJsb2JqO1xufVxuIl19