import $ from 'jquery';

import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { action } = { ...request };
    switch (action) {
        case 'crmcollection:goMainPage':
            (() => {
                console.log('ASDHJSAHKJD======><><><');
            })();
            break;
    }
});
