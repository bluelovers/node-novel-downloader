"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFtQztBQUNuQyxxRUFBMkQ7QUFDM0QseUdBQWlGO0FBRXBFLFFBQUEsUUFBUSxHQUFHLG9CQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3JDLE1BQU0sRUFBRTtRQUNQLG1EQUF3QixDQUFDO1lBQ3hCLFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUM7S0FDRjtJQUNELEVBQUUsRUFBRTtRQUNILGlDQUFvQixDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsVUFBVSxFQUFFLElBQUk7WUFDaEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsWUFBWSxFQUFFLElBQUk7U0FDbEIsQ0FBQztLQUNGO0lBQ0QsTUFBTSxFQUFFLElBQUk7SUFDWixXQUFXLEVBQUUsQ0FBQztDQUNkLENBQUMsQ0FBQztBQUVILGtCQUFlLGdCQUFRLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgX3poUmVnRXhwIGZyb20gJ3JlZ2V4cC1jamsnO1xuaW1wb3J0IGNyZWF0ZVpoUmVnRXhwUGx1Z2luIGZyb20gJ3JlZ2V4cC1jamstcGx1Z2luLWV4dHJhJztcbmltcG9ydCBjcmVhdGVaaFJlZ0V4cENvcmVQbHVnaW4gZnJvbSAncmVnZXhwLWNqay1wbHVnaW4tZXNjYXBlLXVuaWNvZGUtcHJvcGVydHknO1xuXG5leHBvcnQgY29uc3QgemhSZWdFeHAgPSBfemhSZWdFeHAudXNlKHtcblx0b25Db3JlOiBbXG5cdFx0Y3JlYXRlWmhSZWdFeHBDb3JlUGx1Z2luKHtcblx0XHRcdGVzY2FwZUF1dG86IHRydWUsXG5cdFx0fSksXG5cdF0sXG5cdG9uOiBbXG5cdFx0Y3JlYXRlWmhSZWdFeHBQbHVnaW4oe1xuXHRcdFx0YXV0b1ZvaWNlOiB0cnVlLFxuXHRcdFx0YXV0b0xvY2FsZTogdHJ1ZSxcblx0XHRcdGF1dG9EZWJ1cnI6IHRydWUsXG5cdFx0XHRhdXRvRnVsbEhhaWY6IHRydWUsXG5cdFx0fSlcblx0XSxcblx0dW5zYWZlOiB0cnVlLFxuXHRncmVlZHlUYWJsZTogMixcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCB6aFJlZ0V4cFxuIl19