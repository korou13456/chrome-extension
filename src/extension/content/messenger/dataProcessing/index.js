import $ from 'jquery';

import browser from 'webextension-polyfill';

console.log(12312312, '1....');
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
                console.log('dataProcessing:getName', '====');
                const response = {
                    name: getName(num),
                };
                sendResponse(response);
            })();
            break;

        case 'dataProcessing:getDetails':
            (() => {
                const fansNum = $('[data-e2e="followers-count"]').text();
                const amount = document.querySelectorAll(
                    '[data-e2e="video-views"]'
                );
                const emailText = $('[data-e2e="user-bio"]').text();
                let amountArr = [];
                for (let i = 0; i < amount.length; i++) {
                    if (!amount[i]) continue;
                    amountArr.push(amount[i].innerText.trim());
                    if (amountArr.length >= 12) break;
                }
                const response = {
                    fansNum,
                    amountArr,
                    emailText,
                };
                sendResponse(response);
            })();
            break;

        case 'dataProcessing:GoVideo':
            (async () => {
                let timer = setInterval(() => {
                    const demo = document.querySelector(
                        '[data-e2e="user-post-item-desc"]'
                    );
                    if (demo) {
                        clearInterval(timer);
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        demo.dispatchEvent(clickEvent);
                    }
                }, 1000);
            })();
            break;
        case 'dataProcessing:getTime':
            (() => {
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
        let time = document.querySelector(
            '[data-e2e="browser-nickname"] > span + span'
        ).innerText;
        if (time) {
            return time;
        }
    } catch (error) {
        return getTime();
    }
}
