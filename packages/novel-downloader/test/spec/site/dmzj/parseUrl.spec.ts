import { parseUrl } from '../../../../src/site/dmzj/util';

describe(`support`, () =>
{

	([
		'http://v2.api.dmzj.com/novel/2229.json',

		'http://v2.api.dmzj.com/novel/download/2229_8303_69136.txt',

		'2440',

		1279,

		'http://q.dmzj.com/2476/index.shtml',

		'http://jurisdiction.dmzj1.com/lnovel/7528_62192.txt?t=1625273472314&k=e833282eb316c122004f04a6e3d416b3',

		'http://nnv4api.muwai.com/novel/chapter/784.json',
		'http://nnv4api.muwai.com/novel/chapter/784',
		'http://nnv4api.muwai.com/novel/chapter/784/',

		'http://nnv3api.muwai.com/novel/chapter/784.json',
		'http://nnv3api.muwai.com/novel/chapter/784',
		'http://nnv3api.muwai.com/novel/chapter/784/',

		'http://api.muwai.com/novel/chapter/784.json',
		'http://api.muwai.com/novel/chapter/784',
		'http://api.muwai.com/novel/chapter/784/',

		'http://nnv4api.dmzj4.com/novel/chapter/784.json',
		'http://nnv4api.dmzj4.com/novel/chapter/784',
		'http://nnv4api.dmzj4.com/novel/chapter/784/',

		'http://nnv3api.dmzj4.com/novel/chapter/784.json',
		'http://nnv3api.dmzj4.com/novel/chapter/784',
		'http://nnv3api.dmzj4.com/novel/chapter/784/',

		'http://api.dmzj4.com/novel/chapter/784.json',
		'http://api.dmzj4.com/novel/chapter/784',
		'http://api.dmzj4.com/novel/chapter/784/',

	]).forEach((input) => {

		test(`${input}`, () =>
		{

			let actual = parseUrl(input);

			expect(actual).toHaveProperty('url')
			expect(actual).toHaveProperty('novel_id')
			expect(actual).toHaveProperty('novel_pid')
			expect(actual).toHaveProperty('chapter_id')

			expect(actual).toMatchSnapshot();

		});

	});

})
