import Messenger from '../index';
import redskins from 'extension/background/redskins';
import browser from 'webextension-polyfill';

Messenger.on('redskins', async (message) => {
    const { content } = { ...message };
    const { action, data, domes } = { ...content };
    switch (action) {
        case 'start':
            redskins(data);
            break;
        case 'detection':
            console.log(domes, '!------>>======');
            redskins(domes, action);
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
    console.log('===========');
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'redskins:enter',
        });
        return response;
    } catch (e) {
        return enterFun();
    }
}

export default { enterFun };
