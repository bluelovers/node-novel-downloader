import _zhRegExp from 'regexp-cjk';
import createZhRegExpPlugin from 'regexp-cjk-plugin-extra';
import createZhRegExpCorePlugin from 'regexp-cjk-plugin-escape-unicode-property';

export const zhRegExp = _zhRegExp.use({
	onCore: [
		createZhRegExpCorePlugin({
			escapeAuto: true,
		}),
	],
	on: [
		createZhRegExpPlugin({
			autoVoice: true,
			autoLocale: true,
			autoDeburr: true,
			autoFullHaif: true,
		})
	],
	unsafe: true,
	greedyTable: 2,
});

export default zhRegExp
