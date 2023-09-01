import browser from 'webextension-polyfill';
import Baobab from 'baobab';

const tree = new Baobab({});

import Extension from 'background/messenger/sender/extension';

function isBlackTab(tab) {
    let { url } = tab;
    const blackes = [/^chrome:\/\//i, /^about:blank/i];
    if (
        blackes.some((regex) => {
            return regex.test(url);
        })
    ) {
        return true;
    }
    return false;
}

function cs_run(tabId, tab) {
    if (isBlackTab(tab)) {
        return;
    }
    Extension.csrun(tabId);
}

function onUpdated(tabId, changeInfo, tab) {
    const Path = [tabId, 'response_timestamp'];
    const ResponseTimestamp = tree.get(Path);
    if (changeInfo.status) {
        if ('loading' === changeInfo.status) {
            cs_run(tabId, tab);
            tree.set(Path, Date.now());
        }
    } else {
        if (tab.status && 'complete' === tab.status) {
            if (!ResponseTimestamp || Date.now() - ResponseTimestamp > 100) {
                cs_run(tabId, tab);
                tree.set(Path, Date.now());
            }
        }
    }
}

export default function initTabOnUpdated() {
    browser.tabs.onUpdated.addListener(onUpdated);
}

initTabOnUpdated();
