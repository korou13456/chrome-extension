import browser from 'webextension-polyfill';

export async function getTabs() {
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

export async function get() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:get',
        });
        return response;
    } catch (e) {
        return get();
    }
}

export async function getName(num) {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:getName',
            num,
        });
        return response;
    } catch (e) {
        return getName();
    }
}

export async function getDetails(num) {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:getDetails',
            num,
        });
        return response;
    } catch (e) {
        return getDetails(num);
    }
}

export async function getAmount(num) {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:getAmount',
            num,
        });
        return response;
    } catch (e) {
        return getAmount(num);
    }
}

export async function clickGoVideo() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:GoVideo',
        });
        return { response, tabs };
    } catch (e) {
        return clickGoVideo();
    }
}

export async function getTime() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:getTime',
        });
        return { response, tabs };
    } catch (e) {
        return getTime();
    }
}

export async function lazyFun() {
    const tabs = await getTabs();
    try {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
            action: 'dataProcessing:lazyFun',
        });
        return { response, tabs };
    } catch (e) {
        return lazyFun();
    }
}

export default {
    get,
    getName,
    getDetails,
    clickGoVideo,
    getTabs,
};
