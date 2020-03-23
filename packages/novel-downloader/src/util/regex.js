"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhRegExp = void 0;
const regexp_cjk_1 = require("regexp-cjk");
const regexp_cjk_plugin_extra_1 = require("regexp-cjk-plugin-extra");
const regexp_cjk_plugin_escape_unicode_property_1 = require("regexp-cjk-plugin-escape-unicode-property");
exports.zhRegExp = regexp_cjk_1.default.use({
    onCore: [
        regexp_cjk_plugin_escape_unicode_property_1.default({
            escapeAuto: true,
        }),
    ],
    on: [
        regexp_cjk_plugin_extra_1.default({
            autoVoice: true,
            autoLocale: true,
            autoDeburr: true,
            autoFullHaif: true,
        })
    ],
    unsafe: true,
    greedyTable: 2,
});
exports.default = exports.zhRegExp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBbUM7QUFDbkMscUVBQTJEO0FBQzNELHlHQUFpRjtBQUVwRSxRQUFBLFFBQVEsR0FBRyxvQkFBUyxDQUFDLEdBQUcsQ0FBQztJQUNyQyxNQUFNLEVBQUU7UUFDUCxtREFBd0IsQ0FBQztZQUN4QixVQUFVLEVBQUUsSUFBSTtTQUNoQixDQUFDO0tBQ0Y7SUFDRCxFQUFFLEVBQUU7UUFDSCxpQ0FBb0IsQ0FBQztZQUNwQixTQUFTLEVBQUUsSUFBSTtZQUNmLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFlBQVksRUFBRSxJQUFJO1NBQ2xCLENBQUM7S0FDRjtJQUNELE1BQU0sRUFBRSxJQUFJO0lBQ1osV0FBVyxFQUFFLENBQUM7Q0FDZCxDQUFDLENBQUM7QUFFSCxrQkFBZSxnQkFBUSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF96aFJlZ0V4cCBmcm9tICdyZWdleHAtY2prJztcbmltcG9ydCBjcmVhdGVaaFJlZ0V4cFBsdWdpbiBmcm9tICdyZWdleHAtY2prLXBsdWdpbi1leHRyYSc7XG5pbXBvcnQgY3JlYXRlWmhSZWdFeHBDb3JlUGx1Z2luIGZyb20gJ3JlZ2V4cC1jamstcGx1Z2luLWVzY2FwZS11bmljb2RlLXByb3BlcnR5JztcblxuZXhwb3J0IGNvbnN0IHpoUmVnRXhwID0gX3poUmVnRXhwLnVzZSh7XG5cdG9uQ29yZTogW1xuXHRcdGNyZWF0ZVpoUmVnRXhwQ29yZVBsdWdpbih7XG5cdFx0XHRlc2NhcGVBdXRvOiB0cnVlLFxuXHRcdH0pLFxuXHRdLFxuXHRvbjogW1xuXHRcdGNyZWF0ZVpoUmVnRXhwUGx1Z2luKHtcblx0XHRcdGF1dG9Wb2ljZTogdHJ1ZSxcblx0XHRcdGF1dG9Mb2NhbGU6IHRydWUsXG5cdFx0XHRhdXRvRGVidXJyOiB0cnVlLFxuXHRcdFx0YXV0b0Z1bGxIYWlmOiB0cnVlLFxuXHRcdH0pXG5cdF0sXG5cdHVuc2FmZTogdHJ1ZSxcblx0Z3JlZWR5VGFibGU6IDIsXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgemhSZWdFeHBcbiJdfQ==