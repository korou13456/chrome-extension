import Messenger from '../index';
import browser from 'webextension-polyfill';
import crmcollection from 'extension/background/crmcollection';

Messenger.on('crm', async (message) => {
    const { content } = { ...message };

    const { action, data } = { ...content };

    switch (action) {
        case 'push':
            console.log(data, '!--->>');
            crmcollection(data);
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

async function goMainPage() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'crmcollection:goMainPage',
        });
        return response;
    } catch (e) {
        return goMainPage();
    }
}

export default {
    goMainPage,
};
