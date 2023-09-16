import $ from 'jquery';
import Messenger from '../index';

import browser from 'webextension-polyfill';

let ifsend;
browser.runtime.onMessage.addListener((request) => {
    const { action } = { ...request };
    switch (action) {
        case 'redskins:enter':
            (async function () {
                ifsend = true;
                let timer = setInterval(() => {
                    const domes = $('[data-e2e="search-card-user-unique-id"]');
                    if (domes[0]) {
                        startDetectionFun(domes);
                        clearInterval(timer);
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

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.call(this, ...arguments);
        }, wait);
    };
}

const startDetectionFun = debounce((domes) => {
    if (!ifsend) return;
    let arr = [];
    for (const iterator of domes) {
        arr.push(getName(iterator));
    }
    Messenger.send(
        'redskins',
        { action: 'detection', domes: unique(arr) },
        { to: 'bg', ignoreResponse: true }
    );
    ifsend = false;
}, 1000);

function unique(arr) {
    return Array.from(new Set(arr));
}

function getName(demo) {
    try {
        let name = demo.textContent.trim();
        if (name) {
            return name;
        }
    } catch (error) {
        return getName(demo);
    }
}
