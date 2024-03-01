import browser from 'webextension-polyfill';

import Messenger from '../index';
import kocVideoFetching from 'extension/background/kocVideoFetching';

import { postKocGet } from 'extension/utils/axios';

import startfun from 'extension/background/KocScript';

Messenger.on('koc', async (message) => {
    const { content, tab } = { ...message };
    const { id } = { ...tab };
    const { action, data } = { ...content };
    switch (action) {
        case 'start':
            startfun();
            // (async () => {
            //     const { data } = { ...(await postKocGet('/koc_account_list')) },
            //         { data: dataList } = { ...data },
            //         { list } = { ...dataList };
            //     kocVideoFetching('', list);
            // })();
            break;
        case 'receive':
            kocVideoFetching('receive', data, id);
            break;
        case 'skip':
            kocVideoFetching('skip', data, id);
            break;
    }
});

// 获取页面元素
export async function enterFun(id) {
    try {
        const response = await browser.tabs.sendMessage(id, {
            action: 'kocVideo:enter',
        });
        return response;
    } catch (e) {
        return enterFun(id);
    }
}
