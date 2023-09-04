import $ from 'jquery';

import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    const { action, num } = { ...request };
    switch (action) {
        case 'dataProcessing:get':
            (() => {
                const domes = $('[data-e2e="search-card-user-unique-id"]');
                const response = {
                    num: domes.length,
                };
                sendResponse(response);
            })();
            break;

        case 'dataProcessing:getName':
            (() => {
                const response = {
                    name: getName(num),
                };
                sendResponse(response);
            })();
            break;

        case 'dataProcessing:getDetails':
            (() => {
                const fansNum = $('[data-e2e="followers-count"]').text();
                const amount = $('[data-e2e="video-views"]');
                let amountArr = [];
                for (let i = 0; i < amount.length; i++) {
                    if (!amount[i]) continue;
                    amountArr.push(amount[i].textContent.trim());
                    if (amountArr.length >= 12) break;
                }
                const response = {
                    fansNum,
                    amountArr,
                };
                sendResponse(response);
            })();
            break;

        case 'dataProcessing:GoVideo':
            (async () => {
                const demo = $('.tiktok-xsheez-DivPlayerContainer');
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                if (demo[0]) {
                    demo[0].dispatchEvent(clickEvent);
                }
                const time = getTime();
                const response = {
                    time,
                };
                sendResponse(response);
            })();
            break;
        case 'dataProcessing:lazyFun':
            window.scrollTo(0, document.body.scrollHeight);
            break;
    }
});

function getName(num) {
    try {
        let name = $('[data-e2e="search-card-user-unique-id"]')[
            num
        ].textContent.trim();
        if (name) {
            return name;
        }
    } catch (error) {
        return getName(num);
    }
}

function getTime() {
    try {
        let time = $('[data-e2e="browser-nickname"]>span+span').text();
        if (time) {
            return time;
        }
    } catch (error) {
        return getTime();
    }
}
