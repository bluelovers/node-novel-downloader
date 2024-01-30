/**
 * Created by user on 2024/1/30.
 */

import { type IJSDOM } from "jsdom-extra";
import { _classStartWith, _jQueryClassStartWith, _jQueryElemOuterHTML } from '../dom';
import NovelSite, { moment } from '../../index';
import { IRowVolume, TreeNode } from '../../../tree/index';
import { IDownloadOptions } from '../../syosetu/index';
import { INovel, IOptionsRuntime } from '../../demo/tree';
import { consoleDebug, console } from '../../../util/log';
import { trim } from '../../../util';
import _NovelSite from '../../index';
import { IMdconfMeta, _handleDataForStringify } from 'node-novel-info';
import { makeUrl } from '../util';
import { nullTitle } from '../../../util/title';

export async function _get_volume_list<T extends IOptionsRuntime>(dom: IJSDOM, optionsRuntime: Partial<T & IDownloadOptions>,)
{
	const $ = dom.$;

	const _main = _jQueryClassStartWith($, '#app main', '_workId__main__', ':eq(0)');

	let _div = _jQueryClassStartWith($, '> div', 'NewBox_box__', ':eq(0)', _main);

	let novel_author = _div.find('.partialGiftWidgetActivityName:eq(0)').text();

	const _propData = _pagePropData(dom);

	const {
		novel_id,
		_workData,
	} = _getWorkData(_propData);

	const {
		novelTree,
	} = _get_volume_list_loop(_propData, optionsRuntime)

	//console.yellow.log(_propData.props.pageProps.__APOLLO_STATE__);

	return {
		..._parseWorkMeta(_workData),
		novel_id,
		novel_author,
		//volume_list,
		novelTree,
	}
}

export function _getWorkData(_propData: IPagePropData)
{
	const novel_id = _propData.query.workId;

	const _workData = _getDataRecord(`Work:${novel_id}`, _propData);

	return {
		novel_id,
		_workData,
	}
}

export function _getDataRecord<T extends IPagePropDataRecordKeys>(name: T, _propData: IPagePropData)
{
	return _propData.props.pageProps.__APOLLO_STATE__[name]
}

/**
 * 無章節分級
 * https://kakuyomu.jp/works/16817139556288291993
 *
 * 普通章節分級
 * https://kakuyomu.jp/works/16817330658683197420
 *
 * 複雜多級
 * https://kakuyomu.jp/works/1177354054880238351
 */
function _get_volume_list_loop<T extends IOptionsRuntime>(_propData: IPagePropData,
	optionsRuntime: Partial<T & IDownloadOptions>)
{
	const {
		novel_id,
		_workData,
	} = _getWorkData(_propData);

	let volume_list = [] as NovelSite.IVolume[];

	const novelTree = optionsRuntime.novelTree;
	let currentVolume: TreeNode<IRowVolume>;

	let total_idx = 0;

	_workData.tableOfContents.forEach((ref, idx, arr) => {

		const toc = _getDataRecord(ref.__ref, _propData);

		let chapter = _getDataRecord(toc.chapter?.__ref, _propData);

		let volume_title = 'null';
		let volume_level = null;

		if (chapter)
		{
			volume_title = trim(chapter.title);
			volume_level = chapter.level;
		}

		let nowVolume: TreeNode<IRowVolume>;

		if (currentVolume)
		{
			let lastLevel = currentVolume.get<number>('level') as number;
			let parentVolume: TreeNode<IRowVolume>;

			if (volume_level > 1)
			{
				if (lastLevel == volume_level)
				{
					parentVolume = currentVolume.parent;
				}
				else if (lastLevel = (volume_level + 1))
				{
					parentVolume = currentVolume;
				}
				else
				{
					throw Error
				}

				if (!volume_title?.length)
				{
					nowVolume = parentVolume;
				}

				if (!nowVolume)
				{
					nowVolume = novelTree.addVolume({
						volume_title: nullTitle(volume_title),
						volume_level,
						volume_index: parentVolume.size(),
						total_idx: total_idx++,
					}, parentVolume);
				}
			}
		}

		if (!nowVolume)
		{
			nowVolume = novelTree.addVolume({
				volume_title: nullTitle(volume_title),
				volume_level,
				volume_index: novelTree.root().size(),
				total_idx: total_idx++,
			});
		}

		currentVolume = nowVolume;

		toc.episodeUnions?.forEach(ref => {
			let episode = _getDataRecord(ref.__ref, _propData);

			let chapter_id = episode.id;

			let data = {
				chapter_id,
				novel_id,
			}

			let href = makeUrl(data)

			novelTree.addChapter({
				chapter_title: episode.title,
				chapter_id,
				chapter_url: href,
				chapter_url_data: data,
				chapter_date: moment(episode.publishedAt).local(),
				chapter_index: currentVolume.size(),
				total_idx: total_idx++,
			}, currentVolume)
		})

	})

	return {
		novelTree,
		total_idx,
	}
}

interface IPagePropDataWork
{
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
		"__ref": "UserAccount:16817139555991383140"
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
		"__typename": "EpisodeConnection",
		"nodes": IRefWithId<'Episode'>[]
	};
	"adminHorizontalImageUrl": null;
	"totalReviewPoint": 10457;
	"totalPublicEpisodeCommentCount": 5007;
	"totalFollowers": 20884;
	"catchphrase": "【書籍一巻発売中！】いつの間にか最強剣士になってたんだが？";

	"workTopWorkReviews": {
		"__ref": "WorkTopWorkReviews:16817139556288291993"
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
			"__ref": "TableOfContentsChapter:"
		}
	] | {
		"__ref": `TableOfContentsChapter:${string}`
	}[];
	/**
	 * 書籍化作品
	 */
	"hasPublication": true;
	"activeWorkContest": null;
	"enteringUserEvents({\"first\":50,\"status\":\"OPEN\"})": {
		"__typename": "UserEventConnection",
		"nodes": [
			{
				"__ref": "UserEvent:16817330669638086986"
			},
			{
				"__ref": "UserEvent:16817330669478183222"
			}
		]
	};
	"ogImageUrl": "https://cdn-static.kakuyomu.jp/works/16817139556288291993/ogimage.png?vZGnt_mXcZ5ZKg6bOYyOwVvcunU";
	"adBypass": false;
	"adUnsafe": false;
	"canShowAdForVisitor": true;
	"canShowAsBlogInHatenaBookmark": false;
}

interface IPagePropDataChapter
{
	"__typename": "Chapter",
	"id": "16817330661417388964",
	"level": 1,
	"title": "ノブレス・オブリージュ"
}

interface IPagePropDataEpisode
{
	"__typename": "Episode",
	"id": "16817139556288389322",
	"title": "第1話　「俺たちは、最高の仲間だ」",
	"publishedAt": "2022-07-02T15:23:40Z"
}

interface IRef<R extends string>
{
	"__ref": R
}

interface IRefWithId<R extends string, T extends string = string> extends IRef<`${R}:${T}`>
{

}

interface IPagePropDataTableOfContentsChapter
{
	"__typename": "TableOfContentsChapter",
	"id": "16817330661417388964",
	"episodeUnions": IRef<`Episode:${string}`>[],
	"chapter"?: IRef<`Chapter:${string}`>
}

type IPagePropDataRecordKeys = `Episode:${string}` | `Work:${string}` | `Chapter:${string}` | `TableOfContentsChapter:${string}`;

interface IPagePropDataUserAccount
{
	__typename: 'UserAccount';
	id: '16817139555991383140';
	name: 'tennensui297';
	activityName: '天然水珈琲';
	isOfficialUser: false;
	visitorIsBlocking: false;
	visitorIsBlocked: false;
	screenName: '@tennensui297';
	loyaltyUser: { __ref: 'LoyaltyUser:16817139555991383140' };
	visitorIsSponsor: false;
	sponsorByVisitor: null;
	publicationLabel: null;
	visitorIsFollowing: false;
}

interface IPagePropDataRecord
{
	[key: `Episode:${string}`]: IPagePropDataEpisode

	[key: `Work:${string}`]: IPagePropDataWork

	[key: `Chapter:${string}`]: IPagePropDataChapter

	[key: `TableOfContentsChapter:${string}`]: IPagePropDataTableOfContentsChapter

	[key: `UserAccount:${string}`]: IPagePropDataUserAccount
}

export interface IPagePropData
{
	props: {
		pageProps: {
			__APOLLO_STATE__: IPagePropDataRecord
		},
		__N_SSP: true
	},
	page: '/works/[workId]',
	query: {
		workId: '16817139556288291993'
	},
	buildId: 'DREsmExmqJaNFfeL0uip4',
	isFallback: false,
	gssp: true,
	scriptLoader: []
}

export function _pagePropData(dom: IJSDOM): IPagePropData
{
	return JSON.parse(dom.$('script#__NEXT_DATA__:eq(0)').html())
}

export function _parseWorkMeta(_workData: IPagePropDataWork)
{
	let data_meta: IMdconfMeta = {
		novel: {},
	};

	data_meta.novel.tags = [
		..._workData.tagLabels,
		_workData.genre,
	];

	if (_workData.isSexual || data_meta.novel.tags.includes('性描写有り'))
	{
		data_meta.novel.tags.push(`novel18`);
		data_meta.novel.tags.push(`性描写有り`);
	}

	if (_workData.isCruel)
	{
		data_meta.novel.tags.push('残酷描写有り');
	}

	if (_workData.isViolent)
	{
		data_meta.novel.tags.push('暴力描写有り');
	}

	data_meta.novel.title_other = _workData.alternateTitle ?? void 0;

	let novel_date = moment(_workData.lastEpisodePublishedAt).local();

	if (_workData.hasPublication)
	{

	}

	return {
		novel_title: trim(_workData.title),
		novel_desc: _workData.introduction,
		novel_date,
		novel_cover: _workData.ogImageUrl?.replace(/\?.+$/, ''),
		data_meta,
	} satisfies Partial<INovel>
}
