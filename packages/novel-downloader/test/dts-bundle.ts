/**
 * Created by user on 2018/6/9/009.
 */

// @ts-ignore
import * as pkg from '../package.json';
// @ts-ignore
import dts from 'dts-bundle';
import path from 'path';

dts.bundle({
	name: pkg.name,
	main: path.join(__dirname, '../index.d.ts')
});
