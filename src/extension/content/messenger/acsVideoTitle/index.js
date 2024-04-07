import $ from 'jquery';

import browser from 'webextension-polyfill';

import Messenger from '../index';

browser.runtime.onMessage.addListener((request) => {
    const { action } = { ...request };
    console.log(request, '!---<<<');
    switch (action) {
        case 'acs:getData':
            (async function () {
                let timer = setInterval(() => {
                    const domes = $('[data-e2e="search-card-user-unique-id"]');
                    if (domes[0]) {
                        clearInterval(timer);
                        startDetectionFun();
                        return;
                    }
                    const button = $('[type="button"]')[0];
                    if (button) {
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        if (button) {
                            button.dispatchEvent(clickEvent);
                        }
                    }
                }, 1000);
            })();
            break;
    }
});

let TextArr = [];
let num = 0;
const startDetectionFun = () => {
    const arr = document.querySelectorAll(
        '[data-e2e="search-card-user-unique-id"]'
    );
    if (TextArr.length >= arr.length) {
        if (num >= 3) {
            return Func(TextArr);
        }
        setTimeout(() => {
            num++;
            window.scrollTo(0, document.body.scrollHeight);
            return startDetectionFun();
        }, 3000);
    }
    for (let i = TextArr.length; i < arr.length; i++) {
        const element = arr[i];
        const text = element.innerText;
        if (text) {
            TextArr.push(text);
        }

        if (TextArr.length >= 100) {
            return Func(TextArr);
        }
    }
    window.scrollTo(0, document.body.scrollHeight);

    setTimeout(() => {
        return startDetectionFun();
    }, 3000);
};

function Func(data) {
    console.log('下载---');
    TextArr = [];
    Messenger.send(
        'acs',
        { action: 'detection', data },
        { to: 'bg', ignoreResponse: true }
    );
}
