/**
 * Created by user on 2018/6/25/025.
 */

export * from "./src/all"
import Bluebird = require("bluebird");
import NovelSite from "./src/site"

import requireNovelSiteClass from "./src/all"
export { NovelSite }
export default requireNovelSiteClass
