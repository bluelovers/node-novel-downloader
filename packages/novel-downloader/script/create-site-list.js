"use strict";
/**
 * Created by user on 2019/1/3/003.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fg = require("@bluelovers/fast-glob");
const path = require("path");
const fs = require("fs-extra");
const Bluebird = require("bluebird");
const array_hyper_unique_1 = require("array-hyper-unique");
fg.async([
    '*/**.ts',
], {
    cwd: path.join(__dirname, '..', 'src/site'),
    ignore: [
        '**/*.d.ts',
    ],
})
    .then(function (ls) {
    //console.log(ls);
    return ls.sort().reduce(function (a, b) {
        b = b.replace(/\.ts$/, '');
        let basename = path.basename(b);
        let ds = b.split('/');
        let id;
        if (basename == 'index') {
            ds.pop();
        }
        let b2 = ds.join('/');
        ds = ds.map(function (s) {
            return s.replace(/^[a-z]/, function (s) {
                return s.toUpperCase();
            });
        });
        id = [
            'NovelSite',
        ].concat(ds).join('');
        a.push([id, b2]);
        return a;
    }, []);
})
    .then(async (ls) => {
    //console.log(ls);
    ls = await Bluebird.resolve(ls)
        .filter(async ([k, v]) => {
        let m = await Promise.resolve().then(() => __importStar(require(`../src/site/${v}`))).then(m => m.default)
            .catch(e => null);
        return typeof m === 'function' && m.prototype;
    });
    let ret = [''];
    let s;
    s = `export enum EnumNovelSiteList
{
	${ls.map(([k, v]) => `${k} = '${v}',`).join('\n\t')}
	${ls.map(([k, v]) => `'${v}' = '${v}',`).join('\n\t')}
	${ls.map(([k, v]) => `'./site/${v}' = '${v}',`).join('\n\t')}
}`;
    ret.push(s);
    s = `export type EnumNovelSiteListString = '${array_hyper_unique_1.array_unique(ls.map(([k, v]) => v)).join('\' | \'')}';`;
    ret.push(s);
    s = ``;
    let ls2 = await Bluebird.resolve(ls)
        .reduce(async (a, [k, v]) => {
        let IDKEY = await Promise.resolve().then(() => __importStar(require(`../src/site/${v}`))).then(m => m.default.IDKEY)
            .catch(e => null);
        if (IDKEY) {
            a.push([k, v, IDKEY]);
        }
        return a;
    }, []);
    await Bluebird.resolve(ls2)
        .reduce(async (a, [k, v, IDKEY]) => {
        a[0].push(`${k} = '${IDKEY}',`);
        a[1].push(`'${v}' = '${IDKEY}',`);
        a[1].push(`'${IDKEY}' = '${IDKEY}',`);
        a[2].push(`'./site/${v}' = '${IDKEY}',`);
        a[3].push(IDKEY);
        if (v !== 'dmzj') {
            a[4][v] = IDKEY;
        }
        return a;
    }, [[], [], [], [], {}])
        .then(a => {
        array_hyper_unique_1.array_unique_overwrite(a[0]);
        array_hyper_unique_1.array_unique_overwrite(a[1]);
        array_hyper_unique_1.array_unique_overwrite(a[2]);
        let s = `export enum EnumIDKEYList
{
	${a[0].join('\n\t')}
	${a[1].join('\n\t')}
	${a[2].join('\n\t')}
}`;
        ret.push(s);
        s = `export type EnumIDKEYListString = '${array_hyper_unique_1.array_unique(a[3]).join('\' | \'')}';`;
        ret.push(s);
        let o = Object.entries(a[4])
            .map(([siteID, IDKEY]) => {
            return `'${IDKEY}' = '${siteID}',`;
        });
        s = `export enum EnumIDKEYToSiteID
{
	${o.join('\n\t')}
}`;
        ret.push(s);
    });
    s = `export interface INovelSiteList
{
	${ls.map(([k, v]) => `${k}: typeof import('../site/${v}').default`).join('\n\t')}
}`;
    ret.push(s);
    await fs.writeFile(path.join(__dirname, '..', 'src/all/const.ts'), ret.join('\n\n'));
    ret = [];
    s = `import _NovelSite from './site';\nimport Bluebird = require("bluebird");`;
    ret.push(s);
    ret.push(`import { EnumNovelSiteList, INovelSiteList } from './all/const';`);
    ret.push(`export { EnumNovelSiteList, INovelSiteList }`);
    s = ls.map(([k, v]) => `export function requireNovelSiteClass(siteID: EnumNovelSiteList.${k} | '${v}'): INovelSiteList["${k}"]\n`).join('');
    s += `export function requireNovelSiteClass\<T extends typeof _NovelSite\>(siteID: EnumNovelSiteList | string): T
export function requireNovelSiteClass(siteID: EnumNovelSiteList | string)
{
	if (!(siteID in EnumNovelSiteList))
	{
		throw new RangeError(\`'\${siteID}' not exists\`);
	}
	return require(\`./site/\$\{EnumNovelSiteList[siteID]\}\`).default
}`;
    ret.push(s);
    s = `export default requireNovelSiteClass`;
    ret.push(s);
    ret.push('');
    return fs.writeFile(path.join(__dirname, '..', 'src/all.ts'), ret.join('\n\n'));
});
//# sourceMappingURL=create-site-list.js.map