"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._handleParseURL = exports.isURL = exports.createURL = void 0;
const jsdom_url_1 = require("jsdom-url");
const log_1 = require("./log");
function createURL(...argv) {
    return new jsdom_url_1.URL(...argv);
}
exports.createURL = createURL;
function isURL(obj) {
    if (obj instanceof URL || obj instanceof jsdom_url_1.URL || obj instanceof jsdom_url_1.URLImplCore) {
        return true;
    }
    return false;
}
exports.isURL = isURL;
function _handleParseURL(url, ...argv) {
    if (typeof url === 'number') {
        url = String(url);
    }
    let urlobj = {
        url: url,
        novel_pid: null,
        novel_id: null,
        chapter_id: null,
    };
    try {
        urlobj.url = createURL(url);
        url = urlobj.url.href;
    }
    catch (e) {
        if (isURL(url)) {
            url = url.href;
        }
        else {
            log_1.console.warn(e.toString() + ` "${url}"`);
        }
    }
    if (typeof url != 'string') {
        throw new TypeError(`expected url can be string, but got ${url}`);
    }
    return {
        urlobj,
        url: url
    };
}
exports._handleParseURL = _handleParseURL;
exports.default = createURL;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlDQUFxRDtBQUdyRCwrQkFBZ0M7QUFFaEMsU0FBZ0IsU0FBUyxDQUFDLEdBQUcsSUFBdUM7SUFFbkUsT0FBTyxJQUFJLGVBQUksQ0FBQyxHQUFHLElBQUksQ0FBUSxDQUFBO0FBQ2hDLENBQUM7QUFIRCw4QkFHQztBQUVELFNBQWdCLEtBQUssQ0FBQyxHQUFHO0lBRXhCLElBQUksR0FBRyxZQUFZLEdBQUcsSUFBSSxHQUFHLFlBQVksZUFBSSxJQUFJLEdBQUcsWUFBWSx1QkFBVyxFQUMzRTtRQUNDLE9BQU8sSUFBSSxDQUFBO0tBQ1g7SUFFRCxPQUFPLEtBQUssQ0FBQTtBQUNiLENBQUM7QUFSRCxzQkFRQztBQVNELFNBQWdCLGVBQWUsQ0FBQyxHQUEwQixFQUFFLEdBQUcsSUFBSTtJQUVsRSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFDM0I7UUFDQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsSUFBSSxNQUFNLEdBQXFCO1FBQzlCLEdBQUcsRUFBRSxHQUFVO1FBRWYsU0FBUyxFQUFFLElBQUk7UUFDZixRQUFRLEVBQUUsSUFBSTtRQUNkLFVBQVUsRUFBRSxJQUFJO0tBQ2hCLENBQUM7SUFFRixJQUNBO1FBQ0MsTUFBTSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBYSxDQUFDLENBQUM7UUFDdEMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ3RCO0lBQ0QsT0FBTyxDQUFDLEVBQ1I7UUFDQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDZDtZQUNDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO1NBQ2Q7YUFFRDtZQUNDLGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztTQUN6QztLQUNEO0lBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxRQUFRLEVBQzFCO1FBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyx1Q0FBdUMsR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNsRTtJQUVELE9BQU87UUFDTixNQUFNO1FBQ04sR0FBRyxFQUFFLEdBQUc7S0FDUixDQUFBO0FBQ0YsQ0FBQztBQXpDRCwwQ0F5Q0M7QUFFRCxrQkFBZSxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVUkwgYXMgX1VSTCwgVVJMSW1wbENvcmUgfSBmcm9tICdqc2RvbS11cmwnO1xuaW1wb3J0IHR5cGUgTm92ZWxTaXRlIGZyb20gJy4uL3NpdGUvaW5kZXgnO1xuaW1wb3J0IHsgSVRTT3ZlcndyaXRlIH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi9sb2cnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVVJMKC4uLmFyZ3Y6IENvbnN0cnVjdG9yUGFyYW1ldGVyczx0eXBlb2YgVVJMPik6IFVSTFxue1xuXHRyZXR1cm4gbmV3IF9VUkwoLi4uYXJndikgYXMgYW55XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VSTChvYmopOiBvYmogaXMgVVJMXG57XG5cdGlmIChvYmogaW5zdGFuY2VvZiBVUkwgfHwgb2JqIGluc3RhbmNlb2YgX1VSTCB8fCBvYmogaW5zdGFuY2VvZiBVUkxJbXBsQ29yZSlcblx0e1xuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHRyZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGFyc2VVcmxSdW50aW1lIGV4dGVuZHMgSVRTT3ZlcndyaXRlPE5vdmVsU2l0ZS5JUGFyc2VVcmwsIHtcblx0dXJsOiBVUkwsXG59Plxue1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfaGFuZGxlUGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwgfCBudW1iZXIsIC4uLmFyZ3YpXG57XG5cdGlmICh0eXBlb2YgdXJsID09PSAnbnVtYmVyJylcblx0e1xuXHRcdHVybCA9IFN0cmluZyh1cmwpO1xuXHR9XG5cblx0bGV0IHVybG9iajogSVBhcnNlVXJsUnVudGltZSA9IHtcblx0XHR1cmw6IHVybCBhcyBVUkwsXG5cblx0XHRub3ZlbF9waWQ6IG51bGwsXG5cdFx0bm92ZWxfaWQ6IG51bGwsXG5cdFx0Y2hhcHRlcl9pZDogbnVsbCxcblx0fTtcblxuXHR0cnlcblx0e1xuXHRcdHVybG9iai51cmwgPSBjcmVhdGVVUkwodXJsIGFzIHN0cmluZyk7XG5cdFx0dXJsID0gdXJsb2JqLnVybC5ocmVmO1xuXHR9XG5cdGNhdGNoIChlKVxuXHR7XG5cdFx0aWYgKGlzVVJMKHVybCkpXG5cdFx0e1xuXHRcdFx0dXJsID0gdXJsLmhyZWZcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNvbnNvbGUud2FybihlLnRvU3RyaW5nKCkgKyBgIFwiJHt1cmx9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRpZiAodHlwZW9mIHVybCAhPSAnc3RyaW5nJylcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdGVkIHVybCBjYW4gYmUgc3RyaW5nLCBidXQgZ290ICR7dXJsfWApO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR1cmxvYmosXG5cdFx0dXJsOiB1cmxcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVVUkxcbiJdfQ==