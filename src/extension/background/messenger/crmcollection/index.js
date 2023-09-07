import Messenger from '../index';
import browser from 'webextension-polyfill';
import crmcollection from 'extension/background/crmcollection';

Messenger.on('crm', async (message) => {
    const { content } = { ...message };
    const { action, data, name } = { ...content };
    switch (action) {
        case 'push':
            crmcollection(data);
            break;
        case 'canDetect':
            crmcollection([], 'canDetect');
            break;
        case 'skip':
            crmcollection([], 'skip', name);
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

export async function goMainPage(name) {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'crmcollection:goMainPage',
            name,
        });
        return { response, tabs };
    } catch (e) {
        return goMainPage(name);
    }
}

export async function getData() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'crmcollection:getData',
        });
        return { response, tabs };
    } catch (e) {
        return getData();
    }
}

export default {
    goMainPage,
};
