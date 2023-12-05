import browser from 'webextension-polyfill';

import Messenger from '../index';
import kocVideoFetching from 'extension/background/kocVideoFetching';

Messenger.on('koc', async (message) => {
    const { content } = { ...message };
    const { action, data } = { ...content };
    switch (action) {
        case 'start':
            console.log(content);
            kocVideoFetching('', data);
            break;
        case 'receive':
            kocVideoFetching('receive', data, await getTabs());
            break;
        case 'skip':
            kocVideoFetching('skip', data, await getTabs());
            break;
    }
});

async function getTabs() {
    const currentWindow = await browser.windows.getCurrent({
        populate: true,
        windowTypes: ['normal'],
    });
    const { id } = { ...currentWindow };
    const tabs = await browser.tabs.query({
        active: true,
        windowId: id,
    });

    return tabs;
}

// 获取页面元素
export async function enterFun() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'kocVideo:enter',
        });
        return response;
    } catch (e) {
        return enterFun();
    }
}
