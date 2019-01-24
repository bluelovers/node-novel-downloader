"use strict";
/**
 * Created by user on 2018/3/18/018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const novel_text_1 = require("novel-text");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtQztBQUNuQywrQ0FBa0Q7QUFFekMscUJBRkEsaUJBQVUsQ0FFQTtBQUVuQixTQUFnQixPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQVksSUFBSSxFQUFFLE1BQWdCO0lBRTVELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDO0lBRWpELElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQzNCO1FBQ0MsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7WUFDQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckMsSUFBSSxJQUFJLEVBQ1I7Z0JBQ0MsT0FBTyxJQUFJLENBQUM7YUFDWjtTQUNEO0tBQ0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFwQkQsMEJBb0JDO0FBRUQsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsRUFBRSxJQUFjO0lBRS9DLElBQUksQ0FBQyxHQUFHLG9CQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMzQixJQUFJLEVBQUUsR0FBRztLQUNULENBQUMsQ0FBQztJQUVILElBQUksSUFBSSxFQUNSO1FBQ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEM7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFaRCxvQkFZQztBQUVELFNBQWdCLFlBQVksQ0FBSSxLQUFVO0lBRXpDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRztRQUUzQyxPQUFPLEtBQUssSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQU5ELG9DQU1DO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQVc7SUFFdkMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFIRCxvQ0FHQztBQUVELGtCQUFlLE9BQWtDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzMvMTgvMDE4LlxuICovXG5cbmltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgeyBtaW5pZnlIVE1MIH0gZnJvbSAnanNkb20tZXh0cmEvbGliL2h0bWwnO1xuXG5leHBvcnQgeyBtaW5pZnlIVE1MIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWYodiwgb3B0czogYW55ID0gbnVsbCwgc3RyaWN0PzogYm9vbGVhbik6IGJvb2xlYW5cbntcblx0bGV0IGJvb2wgPSB0eXBlb2YgdiA9PSAndW5kZWZpbmVkJyB8fCB2ID09PSBudWxsO1xuXG5cdGlmICghYm9vbCAmJiAhaXNVbmRlZihvcHRzKSlcblx0e1xuXHRcdG9wdHMgPSBBcnJheS5pc0FycmF5KG9wdHMpID8gb3B0cyA6IFtvcHRzXTtcblxuXHRcdGZvciAobGV0IHQgb2Ygb3B0cylcblx0XHR7XG5cdFx0XHRsZXQgYm9vbCA9IHN0cmljdCA/IHYgPT09IHQgOiB2ID09IHQ7XG5cblx0XHRcdGlmIChib29sKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYm9vbDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYm9vbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW0oc3RyOiBzdHJpbmcsIGJvb2w/OiBib29sZWFuKVxue1xuXHRsZXQgdCA9IG5vdmVsVGV4dC50cmltKHN0ciwge1xuXHRcdHRyaW06ICfjgIAnLFxuXHR9KTtcblxuXHRpZiAoYm9vbClcblx0e1xuXHRcdHQgPSB0LnJlcGxhY2UoL15b44CAXFxzXSt8W+OAgFxcc10rJC9nLCAnJyk7XG5cdH1cblxuXHRyZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5X3VuaXF1ZTxUPihhcnJheTogVFtdKTogVFtdXG57XG5cdHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKGVsLCBpbmRleCwgYXJyKVxuXHR7XG5cdFx0cmV0dXJuIGluZGV4ID09IGFyci5pbmRleE9mKGVsKTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdleHAoc3RyOiBzdHJpbmcpXG57XG5cdHJldHVybiBzdHIucmVwbGFjZSgvW3xcXFxce30oKVxcW1xcXV4kKyo/LlxcL10vZywgJ1xcXFwkJicpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vdXRpbCcpO1xuIl19