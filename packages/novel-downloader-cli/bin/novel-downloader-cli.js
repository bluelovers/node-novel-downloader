#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const yargs = require("yargs");
const path = require("path");
const novel_downloader_1 = require("novel-downloader");
const log_1 = require("../lib/log");
const PACKAGE_JSON = require("../package.json");
const updateNotifier = require("update-notifier");
let cli = yargs
    .option('outputDir', {
    alias: ['o'],
    requiresArg: true,
    normalize: true,
    desc: `用來儲存下載的內容的主資料夾`,
    type: "string",
    default: process.cwd(),
})
    .option('siteID', {
    desc: `網站模組名稱`,
    alias: ['s'],
    requiresArg: true,
    type: "string",
})
    .option('disableTxtdownload', {
    desc: `此選項目前僅適用於 Syosetu 小說家網站`,
    type: "boolean",
    default: true,
})
    .option('disableDownload', {
    desc: `不下載小說內容僅生成檔案結構`,
    type: "boolean",
})
    .command('list', '顯示出目前的模組名稱', function (args) {
    log_1.default.log(Object.keys(novel_downloader_1.EnumNovelSiteList).filter(v => /^[a-z]/i.test(v)));
    process.exit();
    return args;
})
    .argv;
let url = cli._[0];
checkUpdateSelf().notify();
if (!url) {
    yargs.showHelp();
}
else {
    let downloadOptions = {};
    let siteOptions = {};
    ({ downloadOptions, siteOptions } = fixOptions(cli, downloadOptions, siteOptions));
    log_1.default.dir({
        cli,
        downloadOptions,
        siteOptions,
    });
    yargs.showHelp();
    process.exit();
    __1.download(url, downloadOptions, cli.siteID, siteOptions)
        .tap(function (novel) {
        log_1.default.success(novel.novel_title);
    })
        .tapCatch(function () {
        yargs.showHelp();
    });
}
function fixOptions(cli, downloadOptions, siteOptions) {
    if (cli.outputDir) {
        let s1 = path.normalize(cli.outputDir);
        [
            __dirname,
            path.join(__dirname, '..'),
        ].some(function (v) {
            let s2 = path.normalize(v);
            if (s1 == s2) {
                cli.outputDir = path.join(__dirname, '..', 'test/temp');
                return true;
            }
        });
    }
    // @ts-ignore
    downloadOptions.disableTxtdownload = cli.disableTxtdownload;
    downloadOptions.disableDownload = cli.disableDownload;
    siteOptions.outputDir = cli.outputDir;
    return { cli, downloadOptions, siteOptions };
}
function checkUpdateSelf() {
    let data = updateNotifier({
        pkg: PACKAGE_JSON,
    });
    return data;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm92ZWwtZG93bmxvYWRlci1jbGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJub3ZlbC1kb3dubG9hZGVyLWNsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwwQkFBOEI7QUFDOUIsK0JBQWdDO0FBQ2hDLDZCQUE4QjtBQUU5Qix1REFBc0Y7QUFDdEYsb0NBQWlDO0FBQ2pDLGdEQUFpRDtBQUNqRCxrREFBbUQ7QUFFbkQsSUFBSSxHQUFHLEdBQUcsS0FBSztLQUNiLE1BQU0sQ0FBQyxXQUFXLEVBQUU7SUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBQ1osV0FBVyxFQUFFLElBQUk7SUFDakIsU0FBUyxFQUFFLElBQUk7SUFDZixJQUFJLEVBQUUsZ0JBQWdCO0lBQ3RCLElBQUksRUFBRSxRQUFRO0lBQ2QsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Q0FDdEIsQ0FBQztLQUNELE1BQU0sQ0FBQyxRQUFRLEVBQUU7SUFDakIsSUFBSSxFQUFFLFFBQVE7SUFDZCxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDWixXQUFXLEVBQUUsSUFBSTtJQUNqQixJQUFJLEVBQUUsUUFBUTtDQUNkLENBQUM7S0FDRCxNQUFNLENBQUMsb0JBQW9CLEVBQUU7SUFDN0IsSUFBSSxFQUFFLHlCQUF5QjtJQUMvQixJQUFJLEVBQUUsU0FBUztJQUNmLE9BQU8sRUFBRSxJQUFJO0NBQ2IsQ0FBQztLQUNELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtJQUMxQixJQUFJLEVBQUUsZ0JBQWdCO0lBQ3RCLElBQUksRUFBRSxTQUFTO0NBQ2YsQ0FBQztLQUNELE9BQU8sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsSUFBSTtJQUU1QyxhQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFZixPQUFPLElBQUksQ0FBQTtBQUNaLENBQUMsQ0FBQztLQUNELElBQTJCLENBQzVCO0FBVUQsSUFBSSxHQUFHLEdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUzQixlQUFlLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUUzQixJQUFJLENBQUMsR0FBRyxFQUNSO0lBQ0MsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQ2pCO0tBRUQ7SUFDQyxJQUFJLGVBQWUsR0FBK0IsRUFBRSxDQUFDO0lBQ3JELElBQUksV0FBVyxHQUF1QixFQUFFLENBQUM7SUFFekMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBRW5GLGFBQU8sQ0FBQyxHQUFHLENBQUM7UUFDWCxHQUFHO1FBQ0gsZUFBZTtRQUNmLFdBQVc7S0FDWCxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFakIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRWYsWUFBUSxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7U0FDckQsR0FBRyxDQUFDLFVBQVUsS0FBSztRQUVuQixhQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUM7U0FDRCxRQUFRLENBQUM7UUFFVCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQyxDQUFDLENBQ0Y7Q0FDRDtBQUVELFNBQVMsVUFBVSxDQUFDLEdBQXdCLEVBQUUsZUFBMkMsRUFBRSxXQUErQjtJQUV6SCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQ2pCO1FBQ0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdkM7WUFDQyxTQUFtQjtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7U0FDMUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBRWpCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxFQUFFLElBQUksRUFBRSxFQUNaO2dCQUNDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLElBQUksQ0FBQzthQUNaO1FBQ0YsQ0FBQyxDQUFDLENBQUE7S0FDRjtJQUVELGFBQWE7SUFDYixlQUFlLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDO0lBQzVELGVBQWUsQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUV0RCxXQUFXLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7SUFFdEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQVMsZUFBZTtJQUV2QixJQUFJLElBQUksR0FBRyxjQUFjLENBQUM7UUFDekIsR0FBRyxFQUFFLFlBQVk7S0FDakIsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeyBkb3dubG9hZCB9IGZyb20gJy4uJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoXCJ5YXJnc1wiKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5pbXBvcnQgeyBBcmd1bWVudHMgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgcmVxdWlyZU5vdmVsU2l0ZUNsYXNzLCB7IEVudW1Ob3ZlbFNpdGVMaXN0LCBOb3ZlbFNpdGUgfSBmcm9tIFwibm92ZWwtZG93bmxvYWRlclwiXG5pbXBvcnQgY29uc29sZSBmcm9tICcuLi9saWIvbG9nJztcbmltcG9ydCBQQUNLQUdFX0pTT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcbmltcG9ydCB1cGRhdGVOb3RpZmllciA9IHJlcXVpcmUoJ3VwZGF0ZS1ub3RpZmllcicpO1xuXG5sZXQgY2xpID0geWFyZ3Ncblx0Lm9wdGlvbignb3V0cHV0RGlyJywge1xuXHRcdGFsaWFzOiBbJ28nXSxcblx0XHRyZXF1aXJlc0FyZzogdHJ1ZSxcblx0XHRub3JtYWxpemU6IHRydWUsXG5cdFx0ZGVzYzogYOeUqOS+huWEsuWtmOS4i+i8ieeahOWFp+WuueeahOS4u+izh+aWmeWkvmAsXG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0OiBwcm9jZXNzLmN3ZCgpLFxuXHR9KVxuXHQub3B0aW9uKCdzaXRlSUQnLCB7XG5cdFx0ZGVzYzogYOe2suermeaooee1hOWQjeeosWAsXG5cdFx0YWxpYXM6IFsncyddLFxuXHRcdHJlcXVpcmVzQXJnOiB0cnVlLFxuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdH0pXG5cdC5vcHRpb24oJ2Rpc2FibGVUeHRkb3dubG9hZCcsIHtcblx0XHRkZXNjOiBg5q2k6YG46aCF55uu5YmN5YOF6YGp55So5pa8IFN5b3NldHUg5bCP6Kqq5a6257ay56uZYCxcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0OiB0cnVlLFxuXHR9KVxuXHQub3B0aW9uKCdkaXNhYmxlRG93bmxvYWQnLCB7XG5cdFx0ZGVzYzogYOS4jeS4i+i8ieWwj+iqquWFp+WuueWDheeUn+aIkOaqlOahiOe1kOani2AsXG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdH0pXG5cdC5jb21tYW5kKCdsaXN0JywgJ+mhr+ekuuWHuuebruWJjeeahOaooee1hOWQjeeosScsIGZ1bmN0aW9uIChhcmdzKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coT2JqZWN0LmtleXMoRW51bU5vdmVsU2l0ZUxpc3QpLmZpbHRlcih2ID0+IC9eW2Etel0vaS50ZXN0KHYpKSk7XG5cblx0XHRwcm9jZXNzLmV4aXQoKTtcblxuXHRcdHJldHVybiBhcmdzXG5cdH0pXG5cdC5hcmd2IGFzIEFyZ3VtZW50czxJQ2xpQXJndj5cbjtcblxuaW50ZXJmYWNlIElDbGlBcmd2XG57XG5cdHNpdGVJRD86IEVudW1Ob3ZlbFNpdGVMaXN0LFxuXHRvdXRwdXREaXI/OiBzdHJpbmcsXG5cdGRpc2FibGVUeHRkb3dubG9hZD86IGJvb2xlYW4sXG5cdGRpc2FibGVEb3dubG9hZD86IGJvb2xlYW4sXG59XG5cbmxldCB1cmw6IHN0cmluZyA9IGNsaS5fWzBdO1xuXG5jaGVja1VwZGF0ZVNlbGYoKS5ub3RpZnkoKTtcblxuaWYgKCF1cmwpXG57XG5cdHlhcmdzLnNob3dIZWxwKCk7XG59XG5lbHNlXG57XG5cdGxldCBkb3dubG9hZE9wdGlvbnM6IE5vdmVsU2l0ZS5JRG93bmxvYWRPcHRpb25zID0ge307XG5cdGxldCBzaXRlT3B0aW9uczogTm92ZWxTaXRlLklPcHRpb25zID0ge307XG5cblx0KHsgZG93bmxvYWRPcHRpb25zLCBzaXRlT3B0aW9ucyB9ID0gZml4T3B0aW9ucyhjbGksIGRvd25sb2FkT3B0aW9ucywgc2l0ZU9wdGlvbnMpKTtcblxuXHRjb25zb2xlLmRpcih7XG5cdFx0Y2xpLFxuXHRcdGRvd25sb2FkT3B0aW9ucyxcblx0XHRzaXRlT3B0aW9ucyxcblx0fSk7XG5cblx0eWFyZ3Muc2hvd0hlbHAoKTtcblxuXHRwcm9jZXNzLmV4aXQoKTtcblxuXHRkb3dubG9hZCh1cmwsIGRvd25sb2FkT3B0aW9ucywgY2xpLnNpdGVJRCwgc2l0ZU9wdGlvbnMpXG5cdFx0LnRhcChmdW5jdGlvbiAobm92ZWwpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5zdWNjZXNzKG5vdmVsLm5vdmVsX3RpdGxlKTtcblx0XHR9KVxuXHRcdC50YXBDYXRjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHlhcmdzLnNob3dIZWxwKCk7XG5cdFx0fSlcblx0O1xufVxuXG5mdW5jdGlvbiBmaXhPcHRpb25zKGNsaTogQXJndW1lbnRzPElDbGlBcmd2PiwgZG93bmxvYWRPcHRpb25zOiBOb3ZlbFNpdGUuSURvd25sb2FkT3B0aW9ucywgc2l0ZU9wdGlvbnM6IE5vdmVsU2l0ZS5JT3B0aW9ucylcbntcblx0aWYgKGNsaS5vdXRwdXREaXIpXG5cdHtcblx0XHRsZXQgczEgPSBwYXRoLm5vcm1hbGl6ZShjbGkub3V0cHV0RGlyKTtcblxuXHRcdFtcblx0XHRcdF9fZGlybmFtZSBhcyBzdHJpbmcsXG5cdFx0XHRwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nKSxcblx0XHRdLnNvbWUoZnVuY3Rpb24gKHYpXG5cdFx0e1xuXHRcdFx0bGV0IHMyID0gcGF0aC5ub3JtYWxpemUodik7XG5cdFx0XHRpZiAoczEgPT0gczIpXG5cdFx0XHR7XG5cdFx0XHRcdGNsaS5vdXRwdXREaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAndGVzdC90ZW1wJyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdGRvd25sb2FkT3B0aW9ucy5kaXNhYmxlVHh0ZG93bmxvYWQgPSBjbGkuZGlzYWJsZVR4dGRvd25sb2FkO1xuXHRkb3dubG9hZE9wdGlvbnMuZGlzYWJsZURvd25sb2FkID0gY2xpLmRpc2FibGVEb3dubG9hZDtcblxuXHRzaXRlT3B0aW9ucy5vdXRwdXREaXIgPSBjbGkub3V0cHV0RGlyO1xuXG5cdHJldHVybiB7IGNsaSwgZG93bmxvYWRPcHRpb25zLCBzaXRlT3B0aW9ucyB9O1xufVxuXG5mdW5jdGlvbiBjaGVja1VwZGF0ZVNlbGYoKVxue1xuXHRsZXQgZGF0YSA9IHVwZGF0ZU5vdGlmaWVyKHtcblx0XHRwa2c6IFBBQ0tBR0VfSlNPTixcblx0fSk7XG5cblx0cmV0dXJuIGRhdGE7XG59XG4iXX0=