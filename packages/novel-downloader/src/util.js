"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const novel_text_1 = require("novel-text");
// @ts-ignore
const html_1 = require("jsdom-extra/lib/html");
exports.minifyHTML = html_1.minifyHTML;
function isUndef(v, opts = null, strict) {
    let bool = typeof v == 'undefined' || v === null;
    if (!bool && !isUndef(opts)) {
        opts = Array.isArray(opts) ? opts : [opts];
        for (let t of opts) {
            let bool = strict ? v === t : v == t;
            if (bool) {
                return bool;
            }
        }
    }
    return bool;
}
exports.isUndef = isUndef;
function trim(str, bool) {
    let t = novel_text_1.default.trim(str, {
        trim: '　',
    });
    if (bool) {
        t = t.replace(/^[　\s]+|[　\s]+$/g, '');
    }
    return t;
}
exports.trim = trim;
function array_unique(array) {
    return array.filter(function (el, index, arr) {
        return index == arr.indexOf(el);
    });
}
exports.array_unique = array_unique;
function escapeRegexp(str) {
    return str.replace(/[|\\{}()\[\]^$+*?.\/]/g, '\\$&');
}
exports.escapeRegexp = escapeRegexp;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtQztBQUNuQyxhQUFhO0FBQ2IsK0NBQWtEO0FBRXpDLHFCQUZBLGlCQUFVLENBRUE7QUFFbkIsU0FBZ0IsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFZLElBQUksRUFBRSxNQUFnQjtJQUU1RCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztJQUVqRCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUMzQjtRQUNDLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0MsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQ2xCO1lBQ0MsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJDLElBQUksSUFBSSxFQUNSO2dCQUNDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7U0FDRDtLQUNEO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELDBCQW9CQztBQUVELFNBQWdCLElBQUksQ0FBQyxHQUFXLEVBQUUsSUFBYztJQUUvQyxJQUFJLENBQUMsR0FBRyxvQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDM0IsSUFBSSxFQUFFLEdBQUc7S0FDVCxDQUFDLENBQUM7SUFFSCxJQUFJLElBQUksRUFDUjtRQUNDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBWkQsb0JBWUM7QUFFRCxTQUFnQixZQUFZLENBQUksS0FBVTtJQUV6QyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUc7UUFFM0MsT0FBTyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFORCxvQ0FNQztBQUVELFNBQWdCLFlBQVksQ0FBQyxHQUFXO0lBRXZDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBSEQsb0NBR0M7QUFFRCxrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE4LzAxOC5cbiAqL1xuXG5pbXBvcnQgbm92ZWxUZXh0IGZyb20gJ25vdmVsLXRleHQnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgbWluaWZ5SFRNTCB9IGZyb20gJ2pzZG9tLWV4dHJhL2xpYi9odG1sJztcblxuZXhwb3J0IHsgbWluaWZ5SFRNTCB9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VuZGVmKHYsIG9wdHM6IGFueSA9IG51bGwsIHN0cmljdD86IGJvb2xlYW4pOiBib29sZWFuXG57XG5cdGxldCBib29sID0gdHlwZW9mIHYgPT0gJ3VuZGVmaW5lZCcgfHwgdiA9PT0gbnVsbDtcblxuXHRpZiAoIWJvb2wgJiYgIWlzVW5kZWYob3B0cykpXG5cdHtcblx0XHRvcHRzID0gQXJyYXkuaXNBcnJheShvcHRzKSA/IG9wdHMgOiBbb3B0c107XG5cblx0XHRmb3IgKGxldCB0IG9mIG9wdHMpXG5cdFx0e1xuXHRcdFx0bGV0IGJvb2wgPSBzdHJpY3QgPyB2ID09PSB0IDogdiA9PSB0O1xuXG5cdFx0XHRpZiAoYm9vbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJvb2w7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGJvb2w7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltKHN0cjogc3RyaW5nLCBib29sPzogYm9vbGVhbilcbntcblx0bGV0IHQgPSBub3ZlbFRleHQudHJpbShzdHIsIHtcblx0XHR0cmltOiAn44CAJyxcblx0fSk7XG5cblx0aWYgKGJvb2wpXG5cdHtcblx0XHR0ID0gdC5yZXBsYWNlKC9eW+OAgFxcc10rfFvjgIBcXHNdKyQvZywgJycpO1xuXHR9XG5cblx0cmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheV91bmlxdWU8VD4oYXJyYXk6IFRbXSk6IFRbXVxue1xuXHRyZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChlbCwgaW5kZXgsIGFycilcblx0e1xuXHRcdHJldHVybiBpbmRleCA9PSBhcnIuaW5kZXhPZihlbCk7XG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnZXhwKHN0cjogc3RyaW5nKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL1t8XFxcXHt9KClcXFtcXF1eJCsqPy5cXC9dL2csICdcXFxcJCYnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL3V0aWwnKTtcbiJdfQ==