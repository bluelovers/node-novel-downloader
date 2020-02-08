"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx3Q0FBOEU7QUFFOUUsU0FBZ0IsS0FBSyxDQUFDLEdBQXVDLEVBQUUsT0FBUTtJQUV0RSxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBUyxDQUFDLEdBQVUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBSEQsc0JBR0M7QUFFRCxTQUFnQixPQUFPLENBQUMsTUFBMkIsRUFBRSxJQUF3QixFQUFFLEdBQUcsSUFBSTtJQUVyRixJQUFJLEdBQVcsQ0FBQztJQUVoQixJQUFJLEdBQVcsQ0FBQztJQUVoQixJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQzlCO1FBQ0MsR0FBRyxHQUFHLFFBQVEsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsVUFBVSxPQUFPLENBQUE7S0FDekQ7U0FFRDtRQUNDLEdBQUcsR0FBRyxRQUFRLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQTtLQUNoQztJQUVELEdBQUcsR0FBRyx5QkFBeUIsR0FBRyxFQUFFLENBQUM7SUFFckMsT0FBTyxhQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQWxCRCwwQkFrQkM7QUFFRCxTQUFnQixRQUFRLENBQUMsSUFBMkIsRUFBRSxHQUFHLElBQUk7SUFFNUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxxQkFBZSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBUyxDQUFDO0lBQ2QsSUFBSSxDQUFrQixDQUFDO0lBRXZCLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNuQjtRQUNDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sTUFBTSxDQUFDO0tBQ2Q7SUFFRCxDQUFDLEdBQUcsa0NBQWtDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkI7UUFDQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV6QixPQUFPLE1BQU0sQ0FBQztLQUNkO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBeEJELDRCQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIE5vdmVsU2l0ZSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgY3JlYXRlVVJMLCB7IF9oYW5kbGVQYXJzZVVSTCwgSVBhcnNlVXJsUnVudGltZSB9IGZyb20gJy4uLy4uL3V0aWwvdXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrKHVybDogc3RyaW5nIHwgVVJMIHwgTm92ZWxTaXRlLklQYXJzZVVybCwgb3B0aW9ucz8pOiBib29sZWFuXG57XG5cdHJldHVybiAveDIzcWIvaS50ZXN0KGNyZWF0ZVVSTCh1cmwgYXMgYW55KS5ob3N0bmFtZSB8fCAnJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVXJsKHVybG9iajogTm92ZWxTaXRlLklQYXJzZVVybCwgYm9vbCA/OiBib29sZWFuIHwgbnVtYmVyLCAuLi5hcmd2KVxue1xuXHRsZXQgdXJsOiBzdHJpbmc7XG5cblx0bGV0IHBhZDogc3RyaW5nO1xuXG5cdGlmICghYm9vbCAmJiB1cmxvYmouY2hhcHRlcl9pZClcblx0e1xuXHRcdHBhZCA9IGBib29rLyR7dXJsb2JqLm5vdmVsX2lkfS8ke3VybG9iai5jaGFwdGVyX2lkfS5odG1sYFxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHBhZCA9IGBib29rLyR7dXJsb2JqLm5vdmVsX2lkfS9gXG5cdH1cblxuXHR1cmwgPSBgaHR0cHM6Ly93d3cueDIzcWIuY29tLyR7cGFkfWA7XG5cblx0cmV0dXJuIGNyZWF0ZVVSTCh1cmwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVcmwoX3VybDogc3RyaW5nIHwgVVJMIHwgbnVtYmVyLCAuLi5hcmd2KVxue1xuXHRjb25zdCB7IHVybG9iaiwgdXJsIH0gPSBfaGFuZGxlUGFyc2VVUkwoX3VybCwgLi4uYXJndik7XG5cblx0bGV0IHI6IFJlZ0V4cDtcblx0bGV0IG06IFJlZ0V4cEV4ZWNBcnJheTtcblxuXHRyID0gL14oXFxkKykkLztcblx0aWYgKG0gPSByLmV4ZWModXJsKSlcblx0e1xuXHRcdHVybG9iai5ub3ZlbF9pZCA9IG1bMV07XG5cdFx0cmV0dXJuIHVybG9iajtcblx0fVxuXG5cdHIgPSAvYm9va1xcLyhcXGQrKSg/OlxcLyhcXGQrKS5odG1sfFxcLz8pL2c7XG5cdGlmIChtID0gci5leGVjKHVybCkpXG5cdHtcblx0XHR1cmxvYmoubm92ZWxfaWQgPSBtWzFdO1xuXHRcdHVybG9iai5jaGFwdGVyX2lkID0gbVsyXTtcblxuXHRcdHJldHVybiB1cmxvYmo7XG5cdH1cblxuXHRyZXR1cm4gdXJsb2JqO1xufVxuIl19