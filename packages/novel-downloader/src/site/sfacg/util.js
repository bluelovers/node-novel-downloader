"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = void 0;
const url_1 = require("../../util/url");
function check(url, options) {
    return /book\.sfacg/i.test(url_1.default(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let url;
    if (bool < 0) {
        url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/`;
    }
    else if (urlobj.chapter_vip && urlobj.chapter_id) {
        url = `http://book.sfacg.com/vip/c/${urlobj.chapter_id}/`;
    }
    else {
        let cid = (!bool && urlobj.chapter_id) ? [urlobj.novel_pid, urlobj.chapter_id].join('/') : 'MainIndex';
        url = `http://book.sfacg.com/Novel/${urlobj.novel_id}/${cid}/`;
    }
    return url_1.default(url);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = url_1._handleParseURL(_url, ...argv);
    let r;
    let m;
    r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:(\d+)\/(\d+))/;
    m = r.exec(url);
    if (m) {
        urlobj.novel_pid = m[2];
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[3];
        return urlobj;
    }
    r = /book\.sfacg\.com\/Novel\/(\d+)\/(?:MainIndex)?/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /book\.sfacg\.com\/vip\/c\/(\d+)/;
    if (m = r.exec(url)) {
        urlobj.chapter_id = m[1];
        urlobj.chapter_vip = true;
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esd0NBQThFO0FBRTlFLFNBQWdCLEtBQUssQ0FBQyxHQUF1QyxFQUFFLE9BQVE7SUFFdEUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQVMsQ0FBQyxHQUFVLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLE1BQTJCLEVBQUUsSUFBd0IsRUFBRSxHQUFHLElBQUk7SUFFckYsSUFBSSxHQUFXLENBQUM7SUFFaEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUNaO1FBQ0MsR0FBRyxHQUFHLCtCQUErQixNQUFNLENBQUMsUUFBUSxHQUFHLENBQUM7S0FDeEQ7U0FDSSxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFVBQVUsRUFDaEQ7UUFDQyxHQUFHLEdBQUcsK0JBQStCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQztLQUMxRDtTQUVEO1FBQ0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFFdkcsR0FBRyxHQUFHLCtCQUErQixNQUFNLENBQUMsUUFBUSxJQUFJLEdBQUcsR0FBRyxDQUFDO0tBQy9EO0lBRUQsT0FBTyxhQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQXBCRCwwQkFvQkM7QUFFRCxTQUFnQixRQUFRLENBQUMsSUFBMkIsRUFBRSxHQUFHLElBQUk7SUFFNUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxxQkFBZSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBUyxDQUFDO0lBQ2QsSUFBSSxDQUFrQixDQUFDO0lBRXZCLENBQUMsR0FBRyxrREFBa0QsQ0FBQztJQUN2RCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQixJQUFJLENBQUMsRUFDTDtRQUNDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpCLE9BQU8sTUFBTSxDQUFDO0tBQ2Q7SUFFRCxDQUFDLEdBQUcsZ0RBQWdELENBQUM7SUFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkI7UUFDQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2QixPQUFPLE1BQU0sQ0FBQztLQUNkO0lBRUQsQ0FBQyxHQUFHLGlDQUFpQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25CO1FBQ0MsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFMUIsT0FBTyxNQUFNLENBQUM7S0FDZDtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQXBDRCw0QkFvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBOb3ZlbFNpdGUgZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGNyZWF0ZVVSTCwgeyBfaGFuZGxlUGFyc2VVUkwsIElQYXJzZVVybFJ1bnRpbWUgfSBmcm9tICcuLi8uLi91dGlsL3VybCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVjayh1cmw6IHN0cmluZyB8IFVSTCB8IE5vdmVsU2l0ZS5JUGFyc2VVcmwsIG9wdGlvbnM/KTogYm9vbGVhblxue1xuXHRyZXR1cm4gL2Jvb2tcXC5zZmFjZy9pLnRlc3QoY3JlYXRlVVJMKHVybCBhcyBhbnkpLmhvc3RuYW1lIHx8ICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VVcmwodXJsb2JqOiBOb3ZlbFNpdGUuSVBhcnNlVXJsLCBib29sID86IGJvb2xlYW4gfCBudW1iZXIsIC4uLmFyZ3YpXG57XG5cdGxldCB1cmw6IHN0cmluZztcblxuXHRpZiAoYm9vbCA8IDApXG5cdHtcblx0XHR1cmwgPSBgaHR0cDovL2Jvb2suc2ZhY2cuY29tL05vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS9gO1xuXHR9XG5cdGVsc2UgaWYgKHVybG9iai5jaGFwdGVyX3ZpcCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0e1xuXHRcdHVybCA9IGBodHRwOi8vYm9vay5zZmFjZy5jb20vdmlwL2MvJHt1cmxvYmouY2hhcHRlcl9pZH0vYDtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRsZXQgY2lkID0gKCFib29sICYmIHVybG9iai5jaGFwdGVyX2lkKSA/IFt1cmxvYmoubm92ZWxfcGlkLCB1cmxvYmouY2hhcHRlcl9pZF0uam9pbignLycpIDogJ01haW5JbmRleCc7XG5cblx0XHR1cmwgPSBgaHR0cDovL2Jvb2suc2ZhY2cuY29tL05vdmVsLyR7dXJsb2JqLm5vdmVsX2lkfS8ke2NpZH0vYDtcblx0fVxuXG5cdHJldHVybiBjcmVhdGVVUkwodXJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVXJsKF91cmw6IHN0cmluZyB8IFVSTCB8IG51bWJlciwgLi4uYXJndilcbntcblx0Y29uc3QgeyB1cmxvYmosIHVybCB9ID0gX2hhbmRsZVBhcnNlVVJMKF91cmwsIC4uLmFyZ3YpO1xuXG5cdGxldCByOiBSZWdFeHA7XG5cdGxldCBtOiBSZWdFeHBFeGVjQXJyYXk7XG5cblx0ciA9IC9ib29rXFwuc2ZhY2dcXC5jb21cXC9Ob3ZlbFxcLyhcXGQrKVxcLyg/OihcXGQrKVxcLyhcXGQrKSkvO1xuXHRtID0gci5leGVjKHVybCk7XG5cdGlmIChtKVxuXHR7XG5cdFx0dXJsb2JqLm5vdmVsX3BpZCA9IG1bMl07XG5cdFx0dXJsb2JqLm5vdmVsX2lkID0gbVsxXTtcblx0XHR1cmxvYmouY2hhcHRlcl9pZCA9IG1bM107XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0ciA9IC9ib29rXFwuc2ZhY2dcXC5jb21cXC9Ob3ZlbFxcLyhcXGQrKVxcLyg/Ok1haW5JbmRleCk/Lztcblx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0e1xuXHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cblx0XHRyZXR1cm4gdXJsb2JqO1xuXHR9XG5cblx0ciA9IC9ib29rXFwuc2ZhY2dcXC5jb21cXC92aXBcXC9jXFwvKFxcZCspLztcblx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0e1xuXHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsxXTtcblx0XHR1cmxvYmouY2hhcHRlcl92aXAgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHJldHVybiB1cmxvYmo7XG59XG4iXX0=