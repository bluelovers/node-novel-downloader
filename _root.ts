/**
 * Created by user on 2018/2/13/013.
 */

import * as path from "path";

export const rootModule = path.join(__dirname, '');

export const disablePaths = [
	path.join(rootModule, 'src'),
	path.join(rootModule, 'node_modules'),
	path.join(rootModule, '.idea'),
	path.join(rootModule, '.git'),
];

import * as self from './_root';
export default self;
