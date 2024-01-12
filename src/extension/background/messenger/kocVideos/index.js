import browser from 'webextension-polyfill';

import Messenger from '../index';
import kocVideoFetching from 'extension/background/kocVideosFetching';

Messenger.on('kocs', async (message) => {
    const { content, tab } = { ...message };
    const { id } = { ...tab };
    const { action, data, url } = { ...content };
    switch (action) {
        case 'start':
            console.log(content);
            kocVideoFetching('', data);
            break;
        case 'receive':
            console.log(data, '!0000---->>>?');
            kocVideoFetching('receive', data, id);
            break;
        case 'skip':
            kocVideoFetching('skip', url, id);
            break;
    }
});

let num = 0;
// 获取页面元素
export async function enterFun(id) {
    try {
        if (num >= 5000) {
            kocVideoFetching('skip', 'aaa', id);
            num = 0;
            return;
        }
        num++;
        const response = await browser.tabs.sendMessage(id, {
            action: 'kocsVideo:enter',
        });
        return response;
    } catch (e) {
        return enterFun(id);
    }
}
