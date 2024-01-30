/**
 * Created by user on 2024/1/30.
 */
import { type IJSDOM } from "jsdom-extra";
import NovelSite, { moment } from '../../index';
import { IDownloadOptions } from '../../syosetu/index';
import { IOptionsRuntime } from '../../demo/tree';
import { IMdconfMeta } from 'node-novel-info';
export declare function _get_volume_list<T extends IOptionsRuntime>(dom: IJSDOM, optionsRuntime: Partial<T & IDownloadOptions>): Promise<{
    novel_id: "16817139556288291993";
    novel_author: string;
    novelTree: (T & {
        disableDownload?: boolean;
        disableCheckExists?: boolean;
        optionsJSDOM?: import("jsdom-extra").IFromUrlOptions & import("jsdom-extra").IOptionsCreateQuery & import("jsdom-extra").IOptions & {
            minifyHTML?: boolean;
        } & import("@jsdom-extra/resource-loader").IOptionsWithWindowOptionsWithResourceLoader & {
            cookieJar?: Partial<import("jsdom-extra").LazyCookieJar>;
        };
        pathNovelStyle?: NovelSite.EnumPathNovelStyle;
    } & NovelSite.IOptionsPlus & {
        outputDir?: string;
        cwd?: string;
    } & import("../../syosetu/index").IOptionsPlus)["novelTree"];
    novel_title: string;
    novel_desc: string;
    novel_date: moment.Moment;
    novel_cover: string;
    data_meta: IMdconfMeta;
}>;
export declare function _getWorkData(_propData: IPagePropData): {
    novel_id: "16817139556288291993";
    _workData: IPagePropDataWork;
};
export declare function _getDataRecord<T extends IPagePropDataRecordKeys>(name: T, _propData: IPagePropData): IPagePropDataRecord[T];
interface IPagePropDataWork {
    "__typename": "Work";
    "id": "16817139556288291993";
    "title": string;
    "alternateTitle"?: string;
    "introduction": string;
    "tagLabels": string[];
    "adminCoverImageUrl": "https://cdn.kdkw.jp/cover_1000/322309/322309001137.jpg";
    "promotionalImageUrl": null;
    "adminSquareImageUrl": null;
    "baseColor": "#FF5E23";
    "author": {
        "__ref": "UserAccount:16817139555991383140";
    };
    "kakuyomuNextWork": null;
    "isFreshWork": false;
    "hasFreshEpisode": false;
    "publishedAt": "2022-07-02T15:23:40Z";
    "lastEpisodePublishedAt": "2024-01-30T07:25:45Z";
    "alternateAuthorName": null;
    "visitorWorkFollowing": null;
    "adminBookInformationUrl": "https://kakuyomu.jp/publication/entry/2024011903";
    "visitorReadingHistory": null;
    "publicEpisodes({\"first\":1,\"offset\":0})": {
        "__typename": "EpisodeConnection";
        "nodes": IRefWithId<'Episode'>[];
    };
    "adminHorizontalImageUrl": null;
    "totalReviewPoint": 10457;
    "totalPublicEpisodeCommentCount": 5007;
    "totalFollowers": 20884;
    "catchphrase": "【書籍一巻発売中！】いつの間にか最強剣士になってたんだが？";
    "workTopWorkReviews": {
        "__ref": "WorkTopWorkReviews:16817139556288291993";
    };
    "fanFictionSource": null;
    "genre": "FANTASY";
    "serialStatus": "RUNNING";
    "publicEpisodeCount": 212;
    "totalCharacterCount": 1025587;
    /**
     * 残酷描写有り
     */
    "isCruel": true;
    /**
     * 暴力描写有り
     */
    "isViolent": true;
    /**
     * 性描写有り
     */
    "isSexual": false;
    "relatedWorks({\"limit\":30})": IRefWithId<'Work'>[];
    "reviewCount": 3751;
    "workReviewByVisitor": null;
    "totalReadCount": 6817851;
    "totalWorkContestCount": 1;
    "totalUserEventCount": 8;
    "editedAt": "2024-01-30T07:25:45Z";
    "publicWorkCollections": [];
    "tableOfContents": [
        {
            "__ref": "TableOfContentsChapter:";
        }
    ] | {
        "__ref": `TableOfContentsChapter:${string}`;
    }[];
    /**
     * 書籍化作品
     */
    "hasPublication": true;
    "activeWorkContest": null;
    "enteringUserEvents({\"first\":50,\"status\":\"OPEN\"})": {
        "__typename": "UserEventConnection";
        "nodes": [
            {
                "__ref": "UserEvent:16817330669638086986";
            },
            {
                "__ref": "UserEvent:16817330669478183222";
            }
        ];
    };
    "ogImageUrl": "https://cdn-static.kakuyomu.jp/works/16817139556288291993/ogimage.png?vZGnt_mXcZ5ZKg6bOYyOwVvcunU";
    "adBypass": false;
    "adUnsafe": false;
    "canShowAdForVisitor": true;
    "canShowAsBlogInHatenaBookmark": false;
}
interface IPagePropDataChapter {
    "__typename": "Chapter";
    "id": "16817330661417388964";
    "level": 1;
    "title": "ノブレス・オブリージュ";
}
interface IPagePropDataEpisode {
    "__typename": "Episode";
    "id": "16817139556288389322";
    "title": "第1話　「俺たちは、最高の仲間だ」";
    "publishedAt": "2022-07-02T15:23:40Z";
}
interface IRef<R extends string> {
    "__ref": R;
}
interface IRefWithId<R extends string, T extends string = string> extends IRef<`${R}:${T}`> {
}
interface IPagePropDataTableOfContentsChapter {
    "__typename": "TableOfContentsChapter";
    "id": "16817330661417388964";
    "episodeUnions": IRef<`Episode:${string}`>[];
    "chapter"?: IRef<`Chapter:${string}`>;
}
type IPagePropDataRecordKeys = `Episode:${string}` | `Work:${string}` | `Chapter:${string}` | `TableOfContentsChapter:${string}`;
interface IPagePropDataUserAccount {
    __typename: 'UserAccount';
    id: '16817139555991383140';
    name: 'tennensui297';
    activityName: '天然水珈琲';
    isOfficialUser: false;
    visitorIsBlocking: false;
    visitorIsBlocked: false;
    screenName: '@tennensui297';
    loyaltyUser: {
        __ref: 'LoyaltyUser:16817139555991383140';
    };
    visitorIsSponsor: false;
    sponsorByVisitor: null;
    publicationLabel: null;
    visitorIsFollowing: false;
}
interface IPagePropDataRecord {
    [key: `Episode:${string}`]: IPagePropDataEpisode;
    [key: `Work:${string}`]: IPagePropDataWork;
    [key: `Chapter:${string}`]: IPagePropDataChapter;
    [key: `TableOfContentsChapter:${string}`]: IPagePropDataTableOfContentsChapter;
    [key: `UserAccount:${string}`]: IPagePropDataUserAccount;
}
export interface IPagePropData {
    props: {
        pageProps: {
            __APOLLO_STATE__: IPagePropDataRecord;
        };
        __N_SSP: true;
    };
    page: '/works/[workId]';
    query: {
        workId: '16817139556288291993';
    };
    buildId: 'DREsmExmqJaNFfeL0uip4';
    isFallback: false;
    gssp: true;
    scriptLoader: [];
}
export declare function _pagePropData(dom: IJSDOM): IPagePropData;
export declare function _parseWorkMeta(_workData: IPagePropDataWork): {
    novel_title: string;
    novel_desc: string;
    novel_date: moment.Moment;
    novel_cover: string;
    data_meta: IMdconfMeta;
};
export {};
