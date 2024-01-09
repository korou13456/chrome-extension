import browser from 'webextension-polyfill';

import Messenger from '../index';
import kocVideoFetching from 'extension/background/kocVideoFetching';

Messenger.on('koc', async (message) => {
    const { content, tab } = { ...message };
    const { id } = { ...tab };
    const { action, data } = { ...content };
    switch (action) {
        case 'start':
            console.log(content);
            kocVideoFetching('', data);
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
