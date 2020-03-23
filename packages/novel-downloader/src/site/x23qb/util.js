"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /x23qb/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    let pad;
    if (!bool && urlobj.chapter_id) {
        pad = `book/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
    }
    else {
        pad = `book/${urlobj.novel_id}/`;
    }
    url = `https://www.x23qb.com/${pad}`;
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /^(\d+)$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /book\/(\d+)(?:\/(\d+).html|\/?)/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0NBQThFO0FBRTlFLFNBQWdCLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7SUFFdEUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQVMsQ0FBQyxHQUFVLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBd0IsRUFBRSxHQUFHLElBQUk7SUFFckYsSUFBSSxHQUFXLENBQUM7SUFFaEIsSUFBSSxHQUFXLENBQUM7SUFFaEIsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxFQUM5QjtRQUNDLEdBQUcsR0FBRyxRQUFRLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFBO0tBQ3pEO1NBRUQ7UUFDQyxHQUFHLEdBQUcsUUFBUSxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUE7S0FDaEM7SUFFRCxHQUFHLEdBQUcseUJBQXlCLEdBQUcsRUFBRSxDQUFDO0lBRXJDLE9BQU8sYUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFsQkQsMEJBa0JDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQTJCLEVBQUUsR0FBRyxJQUFJO0lBRTVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcscUJBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUV2RCxJQUFJLENBQVMsQ0FBQztJQUNkLElBQUksQ0FBa0IsQ0FBQztJQUV2QixDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkI7UUFDQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQU0sQ0FBQztLQUNkO0lBRUQsQ0FBQyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1FBQ0MsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekIsT0FBTyxNQUFNLENBQUM7S0FDZDtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQXhCRCw0QkF3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBOb3ZlbFNpdGUgZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGNyZWF0ZVVSTCwgeyBfaGFuZGxlUGFyc2VVUkwsIElQYXJzZVVybFJ1bnRpbWUgfSBmcm9tICcuLi8uLi91dGlsL3VybCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxue1xuXHRyZXR1cm4gL3gyM3FiL2kudGVzdChjcmVhdGVVUkwodXJsIGFzIGFueSkuaG9zdG5hbWUgfHwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVybCh1cmxvYmo6IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIGJvb2wgPzogYm9vbGVhbiB8IG51bWJlciwgLi4uYXJndilcbntcblx0bGV0IHVybDogc3RyaW5nO1xuXG5cdGxldCBwYWQ6IHN0cmluZztcblxuXHRpZiAoIWJvb2wgJiYgdXJsb2JqLmNoYXB0ZXJfaWQpXG5cdHtcblx0XHRwYWQgPSBgYm9vay8ke3VybG9iai5ub3ZlbF9pZH0vJHt1cmxvYmouY2hhcHRlcl9pZH0uaHRtbGBcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRwYWQgPSBgYm9vay8ke3VybG9iai5ub3ZlbF9pZH0vYFxuXHR9XG5cblx0dXJsID0gYGh0dHBzOi8vd3d3LngyM3FiLmNvbS8ke3BhZH1gO1xuXG5cdHJldHVybiBjcmVhdGVVUkwodXJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVXJsKF91cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcbntcblx0Y29uc3QgeyB1cmxvYmosIHVybCB9ID0gX2hhbmRsZVBhcnNlVVJMKF91cmwsIC4uLmFyZ3YpO1xuXG5cdGxldCByOiBSZWdFeHA7XG5cdGxldCBtOiBSZWdFeHBFeGVjQXJyYXk7XG5cblx0ciA9IC9eKFxcZCspJC87XG5cdGlmIChtID0gci5leGVjKHVybCkpXG5cdHtcblx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRyID0gL2Jvb2tcXC8oXFxkKykoPzpcXC8oXFxkKykuaHRtbHxcXC8/KS9nO1xuXHRpZiAobSA9IHIuZXhlYyh1cmwpKVxuXHR7XG5cdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bMl07XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0cmV0dXJuIHVybG9iajtcbn1cbiJdfQ==