"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUrl = exports.makeUrl = exports.check = exports._p_2_br = exports._remove_ad = void 0;
const tslib_1 = require("tslib");
const url_1 = tslib_1.__importStar(require("../../util/url"));
var site_1 = require("esjzone-api/lib/util/site");
Object.defineProperty(exports, "_remove_ad", { enumerable: true, get: function () { return site_1._remove_ad; } });
var jquery_1 = require("restful-decorator-plugin-jsdom/lib/jquery");
Object.defineProperty(exports, "_p_2_br", { enumerable: true, get: function () { return jquery_1._p_2_br; } });
function check(url, options) {
    return /esjzone\.cc/i.test((0, url_1.default)(url).hostname || '');
}
exports.check = check;
function makeUrl(urlobj, bool, ...argv) {
    let pad;
    if (!bool && urlobj.chapter_id) {
        pad = `forum/${urlobj.novel_id}/${urlobj.chapter_id}.html`;
    }
    else {
        pad = `detail/${urlobj.novel_id}.html`;
    }
    return (0, url_1.default)(`https://www.esjzone.cc/${pad}`);
}
exports.makeUrl = makeUrl;
function parseUrl(_url, ...argv) {
    const { urlobj, url } = (0, url_1._handleParseURL)(_url, ...argv);
    let r;
    let m;
    r = /^(\d{6,})$/;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    r = /esjzone\.cc\/forum\/(\d+)(?:\.html|\/(\d+).html)/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        urlobj.chapter_id = m[2];
        return urlobj;
    }
    r = /esjzone\.cc\/detail\/(\d+)(?:\.html)?/g;
    if (m = r.exec(url)) {
        urlobj.novel_id = m[1];
        return urlobj;
    }
    return urlobj;
}
exports.parseUrl = parseUrl;
/*
export function _p_2_br(target, $)
{
    return $(target)
        .each(function (i, elem)
        {
            let _this = $(elem);

            let _html = _this
                .html()
                .replace(/(?:&nbsp;?)/g, ' ')
                .replace(/[\xA0\s]+$/g, '')
            ;

            if (_html == '<br/>' || _html == '<br>')
            {
                _html = '';
            }

            _this.after(`${_html}<br/>\n`);
            _this.remove()
        })
        ;
}
*/
/*
export function _remove_ad($: JQueryStatic)
{
    $('p[class]:has(> script), script[src*=google], > .adsbygoogle').remove();
}
*/
//# sourceMappingURL=util.js.map