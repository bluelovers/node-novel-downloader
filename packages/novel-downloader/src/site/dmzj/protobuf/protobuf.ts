import protobuf, { Root, Type, Reader, Message } from "protobufjs";
import dmzjProto from "./dmzjproto.json";
import { ITSOverwrite } from "ts-type/lib/type/record";

export enum EnumResponseTypeKey
{
	Root = 'Root',
	NovelChapterResponse = 'NovelChapterResponse',
	NovelDetailResponse = 'NovelDetailResponse',
}

const _cache = new Map<EnumResponseTypeKey, unknown>()

type IKeyOfMap<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never;
type IValueOfMap<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never;

function _cacheGet<V extends IValueOfMap<typeof _cache>, K extends IKeyOfMap<typeof _cache> = IKeyOfMap<typeof _cache>>(key: K, fn?: V | ((key: K) => V)): V
{
	let value = _cache.get(key);

	value ??= (() => {
		let _new: V;

		if (typeof fn === 'function')
		{
			// @ts-ignore
			_new = fn(key)
		}
		else
		{
			// @ts-ignore
			_new = fn
		}

		if (_new !== value)
		{
			return _new
		}
	})();

	return value as V
}

export function _lookupType<T extends Type>(path: EnumResponseTypeKey)
{
	return _cacheGet(path, (path) => {
		return lookupTypeRoot().lookupType(path)
	})
}

export function lookupTypeRoot()
{
	return _cacheGet(EnumResponseTypeKey.Root, () => {
		return protobuf.Root.fromJSON(dmzjProto)
	})
}

export function lookupTypeNovelChapterResponse()
{
	return _lookupType(EnumResponseTypeKey.NovelChapterResponse) as any as ITSOverwrite<Type, {
		decode(reader: (Reader|Uint8Array), length?: number): {
			Data: {
				VolumeId: number,
				VolumeName: string,
				VolumeOrder: string,
				Chapters: {
					ChapterId: number,
					ChapterName: string,
					ChapterOrder: string,
				}[]
			}[]
		}
	}>
}

export function lookupTypeNovelDetailResponse()
{
	return _lookupType(EnumResponseTypeKey.NovelDetailResponse) as any as ITSOverwrite<Type, {
		decode(reader: (Reader|Uint8Array), length?: number): {
			Data: {
				Authors: string,
				Cover: string,
				LastUpdateTime: number,
				Introduction: string,
				Name: string,
			}
		}
	}>
}
