import _ from 'lodash';
import browser from 'webextension-polyfill';
import { parseDomain } from './parse';

export async function createTab(createProperties) {
    if (_.isObject(createProperties) && createProperties.url) {
        let url = createProperties.url,
            active =
                _.isUndefined(createProperties.active) ||
                !!createProperties.active,
            pinned =
                !_.isUndefined(createProperties.pinned) ||
                !!createProperties.pinned;
        if (createProperties.tabId) {
            try {
                let tab = await browser.tabs.get(createProperties.tabId),
                    createdTab = await browser.tabs.create({
                        url,
                        active,
                        pinned,
                        windowId: tab.windowId,
                    });
                return _.assign(createdTab, parseDomain(url));
            } catch (e) {
                throw new Error(e.message);
            }
        } else {
            try {
                let createdTab = await browser.tabs.create({
                    url,
                    pinned,
                    active,
                });
                return _.assign(createdTab, parseDomain(url));
            } catch (e) {
                throw new Error(e.message);
            }
        }
    } else {
        throw new Error('invalid parameter');
    }
}

export async function getTab(tabId) {
    try {
        let tab = await browser.tabs.get(tabId),
            { url } = tab;
        return _.assign(tab, parseDomain(url));
    } catch (e) {
        throw new Error(e.message);
    }
}

export async function getActiveTab() {
    try {
        const currentWindow = await browser.windows.getCurrent({
            populate: true,
            windowTypes: ['normal'],
        });
        const tabs = await browser.tabs.query({
            active: true,
            windowId: currentWindow.id,
        });
        return tabs[0];
    } catch (e) {
        throw new Error(e.message);
    }
}

export async function getTabs(queryInfo = {}) {
    try {
        let filterProperties = {
                domain: null,
                subdomain: null,
            },
            tabs = [];
        for (let property in filterProperties) {
            if ('undefined' !== typeof queryInfo[property]) {
                filterProperties[property] = queryInfo[property];
                delete queryInfo[property];
            }
        }
        tabs = await browser.tabs.query(queryInfo);
        tabs = (tabs || []).map((tab) => {
            let { url } = tab;
            return _.assign(tab, parseDomain(url));
        });
        tabs = tabs.filter((tab) => {
            if (
                filterProperties.domain &&
                filterProperties.domain != tab.domain
            ) {
                return false;
            }
            if (
                filterProperties.subdomain &&
                filterProperties.subdomain != tab.subdomain
            ) {
                return false;
            }
            return true;
        });
        return tabs;
    } catch (e) {
        throw new Error(e.message);
    }
}

export default {
    getTab,
    getTabs,
    createTab,
    getActiveTab,
};
