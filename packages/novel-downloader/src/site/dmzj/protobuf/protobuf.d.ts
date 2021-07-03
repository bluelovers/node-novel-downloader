import protobuf, { Type, Reader } from "protobufjs";
import { ITSOverwrite } from "ts-type/lib/type/record";
export declare enum EnumResponseTypeKey {
    Root = "Root",
    NovelChapterResponse = "NovelChapterResponse",
    NovelDetailResponse = "NovelDetailResponse"
}
export declare function _lookupType<T extends Type>(path: EnumResponseTypeKey): protobuf.Type;
export declare function lookupTypeRoot(): protobuf.Root;
export declare function lookupTypeNovelChapterResponse(): ITSOverwrite<protobuf.Type, {
    decode(reader: (Reader | Uint8Array), length?: number): {
        Data: {
            VolumeId: number;
            VolumeName: string;
            VolumeOrder: string;
            Chapters: {
                ChapterId: number;
                ChapterName: string;
                ChapterOrder: string;
            }[];
        }[];
    };
}>;
export declare function lookupTypeNovelDetailResponse(): ITSOverwrite<protobuf.Type, {
    decode(reader: (Reader | Uint8Array), length?: number): {
        Data: {
            Authors: string;
            Cover: string;
            LastUpdateTime: number;
            Introduction: string;
            Name: string;
        };
    };
}>;
