import { trim } from "../util";

export function nullTitle(title: string)
{
	title = trim(title);

	if (!title?.length)
	{
		title = 'null';
	}

	return title
}
