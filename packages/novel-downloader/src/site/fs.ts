/**
 * Created by user on 2018/3/18/018.
 */

import fs from 'fs-extra';
import { trimFilename } from 'fs-iconv/util';
import { isUndef } from '../util';
import NovelSite, { IOptionsRuntime } from './index';
import path from 'upath2';

export function padStart(id, pad = '0', len = 4): string
{
	return id.toString().padStart(len, '0') + pad;
}

export function getVolumePath(self: NovelSite, {
	volume,
	vid,
	path_novel,
}: {
	volume: NovelSite.IVolume,
	vid: number,
	path_novel: string,
}, optionsRuntime: IOptionsRuntime): string
{
	let dirname: string;
	let _vid = '';

	dirname = self.trimFilenameVolume(volume.volume_title);

	if (!optionsRuntime.noDirPrefix)
	{
		_vid = padStart(vid);

		_vid += '_';
	}

	if (!dirname && optionsRuntime.allowEmptyVolumeTitle)
	{
		dirname = vid.toString() + 'empty';
	}

	if (!dirname)
	{
		throw new RangeError(`volume_title is empty`);
	}

	dirname = path.join(path_novel,
		`${_vid}${dirname}`
	);

	return dirname;
}

export function getFilePath(self: NovelSite, {
	chapter,
	cid,
	dirname,
	ext = '.txt',

	idx,

	volume,
	vid,
}: {
	chapter: NovelSite.IChapter,
	cid: number,
	dirname: string,
	ext?: string,

	idx: number,

	volume?: NovelSite.IVolume,
	vid?: number,
}, optionsRuntime: IOptionsRuntime = {}): string
{
	let file: string;
	let prefix = '';
	let pad = '';

	file = self.trimFilenameChapter(chapter.chapter_title);

	if (!optionsRuntime.noFirePrefix)
	{
		let idxx: number | string;

		if (optionsRuntime.filePrefixMode > 1)
		{
			if (isUndef(chapter.chapter_index, '', true))
			{
				idxx = '';
			}
			else if (optionsRuntime.filePrefixMode == 3 || optionsRuntime.filePrefixMode > 4)
			{
				idxx = idx;
			}
			else
			{
				idxx = chapter.chapter_index as number;

				if (optionsRuntime.startIndex)
				{
					idxx += optionsRuntime.startIndex;
				}
			}
		}
		else if (optionsRuntime.filePrefixMode > 0 || isUndef(chapter.chapter_index))
		{
			idxx = cid;

			if (optionsRuntime.startIndex)
			{
				idxx += optionsRuntime.startIndex;
			}
		}
		else if (!optionsRuntime.filePrefixMode)
		{
			idxx = idx;
		}
		else
		{
			idxx = chapter.chapter_index;
		}

		if (idxx !== '')
		{
			prefix = padStart(idxx);
			prefix += '_';
		}
	}

	if (!optionsRuntime.noFilePadend && chapter.chapter_date)
	{
		pad = '.' + chapter.chapter_date.format('YYYYMMDDHHmm');
	}

	if (!file)
	{
		throw _createError(`chapter_title is empty ${chapter.chapter_title}`);
	}

	if (!dirname)
	{
		throw _createError(`dirname is empty ${dirname}`);
	}

	let fullfile = path.join(dirname,
		`${prefix}${file}${pad}${ext}`
	);

	return fullfile;
}

function _createError<T>(msg: string, _data?: T): RangeError & {
	_data: T,
}
{
	let e = new RangeError(msg);

	// @ts-ignore
	e._data = _data;

	// @ts-ignore
	return e;
}
