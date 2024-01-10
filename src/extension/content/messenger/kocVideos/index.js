import browser from 'webextension-polyfill';
import delay from 'delay';
import Messenger from '../index';

browser.runtime.onMessage.addListener((request) => {
    const { action } = { ...request };
    switch (action) {
        case 'kocVideo:enter':
            (async () => {
                kocVideoEnter();
                setTimeout(() => {
                    const url = window.location.href;
                    skipFun(url);
                }, 5000);
            })();
            break;
    }
});

async function kocVideoEnter() {
    await delay(1000);
    return GetKocVideoData(await getData());
}

async function getData() {
    const url = window.location.href;
    const title = document.querySelector(
        '[data-e2e="browse-video-desc"]'
    ).innerText;

    const like = document.querySelector(
        // 喜欢
        '[data-e2e="like-count"]'
    ).innerText;
    const comments = document.querySelector(
        // 评论
        '[data-e2e="comment-count"]'
    ).innerText;
    const collection = document.querySelector(
        // 收藏
        '[data-e2e="undefined-count"]'
    ).innerText;
    const share = document.querySelector(
        // 收藏
        '[data-e2e="share-count"]'
    ).innerText;

    return {
        url,
        title,
        like: parseNumberWithKAndM(like),
        comments: parseNumberWithKAndM(comments),
        collection: parseNumberWithKAndM(collection),
        share: parseNumberWithKAndM(share),
    };
}

function parseNumberWithKAndM(input) {
    if (!input) {
        return 0;
    }
    const numericPart = parseFloat(input);
    if (input.endsWith('k') || input.endsWith('K')) {
        return numericPart * 1000;
    } else if (input.endsWith('m') || input.endsWith('M')) {
        return numericPart * 1000000;
    } else {
        return numericPart;
    }
}

function GetKocVideoData(data) {
    return Messenger.send('kocs', { action: 'receive', data }, { to: 'bg' });
}

function skipFun(url) {
    return Messenger.send('kocs', { action: 'skip', url }, { to: 'bg' });
}
