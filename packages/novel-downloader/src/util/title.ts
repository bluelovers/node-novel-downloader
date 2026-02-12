import { trim } from "../util";

/**
 * 處理標題，如果為空則返回 'null'
 * Process the title, return 'null' if it is empty
 */
export function nullTitle(title: string)
{
	title = trim(title);

	if (!title?.length)
	{
		title = 'null';
	}

	return title
}
