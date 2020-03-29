/**
 * Created by user on 2020/3/30.
 */
export declare function outputNovelToAttach({ imgs, dirname, keepImage, path_novel, }: {
    imgs: string[];
    dirname: string;
    keepImage: boolean;
    path_novel: string;
}): Promise<{
    attach: {
        images: Record<string, string>;
    };
}>;
export default outputNovelToAttach;
