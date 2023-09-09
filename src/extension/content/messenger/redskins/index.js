import $ from 'jquery';
import Messenger from '../index';

import browser from 'webextension-polyfill';

let ifsend;
browser.runtime.onMessage.addListener((request) => {
    // _sender, sendResponse
    const { action } = { ...request };
    switch (action) {
        case 'redskins:enter':
            console.log('!===--->', '1--->>>');
            (async function () {
                ifsend = true;
                const domes = $('[data-e2e="search-card-user-unique-id"]');
                if (domes[0]) {
                    startDetectionFun(domes);
                    return;
                }
                window.addEventListener('load', function () {
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
                        const observer = new MutationObserver(function (
                            mutationsList
                        ) {
                            mutationsList.forEach(function (mutation) {
                                if (mutation.type === 'attributes') {
                                    // 元素属性发生变化
                                    const button = $('[type="button"]')[0];
                                    if (!button) {
                                        const domes = $(
                                            '[data-e2e="search-card-user-unique-id"]'
                                        );
                                        if (domes[0]) {
                                            startDetectionFun(domes);
                                        }
                                    } else {
                                        if (button) {
                                            button.dispatchEvent(clickEvent);
                                        }
                                    }
                                }
                            });
                        });
                        const targetElement = document.body;
                        const config = {
                            childList: true,
                            attributes: true,
                            subtree: true,
                        };
                        // 启动观察器并开始监听
                        observer.observe(targetElement, config);
                    } else {
                        let time = setInterval(() => {
                            const domes = $(
                                '[data-e2e="search-card-user-unique-id"]'
                            );
                            if (domes[0]) {
                                clearInterval(time);
                                startDetectionFun(domes);
                            }
                        }, 1000);
                    }
                });
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
    console.log(13212, domes, '!===>>');
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
