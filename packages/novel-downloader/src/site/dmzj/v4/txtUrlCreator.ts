import { getTokenV4 } from './v4';

export const txtUrlPrefix = 'http://jurisdiction.dmzj.com' as const;

export class TxtUrlCreator
{
	constructor(public volid: number, public chapterid: number)
	{
		this.volid = volid;
		this.chapterid = chapterid;
	}

	getPath()
	{
		return `/lnovel/${this.volid}_${this.chapterid}.txt`;
	}

	toString()
	{
		const path = this.getPath();
		const { ts, sign } = getTokenV4(path);

		return txtUrlPrefix + path + `?t=${ts}&k=${sign}`;
	}

	static newUrl(volid: number, chapterid: number)
	{
		return new this(volid, chapterid).toString()
	}
}
