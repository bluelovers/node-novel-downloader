/**
 * Created by user on 2019/4/28.
 */
import createRequestPromise, { IRequestPromise } from './create';

/**
 * 導出默認的請求實例 (使用 createRequestPromise 創建)
 * Export default request instance (created with createRequestPromise)
 */
export const request = createRequestPromise();

export default request
