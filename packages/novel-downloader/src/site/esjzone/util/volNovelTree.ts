import { NovelTree, TreeNode, IRowVolume, IRowChapter } from '../../../tree';
import { _getBookChapters } from 'esjzone-api/lib/util/site';
import { NovelSiteESJZone } from '../index';

export function volNovelTree($: JQueryStatic, optionsRuntime: {
	novelTree: NovelTree,
}, self: NovelSiteESJZone)
{
	const data = _getBookChapters($, $('.container'), {
		chapters: [],
	})

	const novelTree = optionsRuntime.novelTree;
	let currentVolume: TreeNode<IRowVolume>;
	let total_idx = 0;

	data
		.chapters
		.forEach(volume => {

			let bool = true;

			volume
				.chapters
				.forEach(_chapter => {

					if (_chapter.chapter_id)
					{

						if (bool)
						{
							currentVolume = novelTree.addVolume({
								volume_title: String(volume.volume_name),
								volume_index: novelTree.root().size(),
								total_idx: total_idx++,
							});

							bool = false;
						}

						let chapter_url_data = self.parseUrl(_chapter.chapter_link);

						let chapter_url = self.makeUrl(chapter_url_data);

						let chapter: IRowChapter = {
							chapter_title: _chapter.chapter_name,
							chapter_id: _chapter.chapter_id,
							chapter_url,
							chapter_url_data,
							chapter_index: currentVolume.size(),
							total_idx: total_idx++,
						};

						novelTree.addChapter(chapter, currentVolume)
					}

				})
			;

	})
	;

	return {
		novelTree,
	}
}

export default volNovelTree
