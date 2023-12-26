import browser from 'webextension-polyfill';
import _ from 'lodash';
import dayjs from 'dayjs';
import delay from 'delay';
import $ from 'jquery';
import Messenger from '../index';

browser.runtime.onMessage.addListener((request) => {
    const { action } = { ...request };
    switch (action) {
        case 'kocVideo:enter':
            (async () => {
                await kocVideoEnter();
            })();
            break;
    }
});

let Arr = [];
let num = 0;

let returnNum = 0;

async function kocVideoEnter() {
    const demos = document.querySelectorAll('[data-e2e="user-post-item-desc"]');
    const amountArr = document.querySelectorAll('[data-e2e="video-views"]');
    if (returnNum >= 5) {
        returnNum = 0;
        return skipFun();
    }
    if (_.isEmpty(demos) && _.isEmpty(amountArr)) {
        returnNum++;
        await delay(2000);
        return await kocVideoEnter();
    }
    await delay(1000);
    Arr.push(await getData(demos[num], amountArr[num]));
    num++;

    if (demos.length <= num + 5) {
        window.scrollTo(0, document.body.scrollHeight);
        await delay(3000);
    }

    if (demos.length <= num) {
        console.log(Arr);
        GetKocVideoData(Arr);
        return;
    }
    return await kocVideoEnter();
}

async function getData(demo, amount) {
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    if (demo) {
        demo.dispatchEvent(clickEvent);
    }
    let url = window.location.href;
    let time = getTime();
    if (time) {
        const CloseBtn = document.querySelector('[data-e2e="browse-close"]');
        if (CloseBtn) {
            CloseBtn.dispatchEvent(clickEvent);
        }
    }

    if (time.includes('天前')) {
        const match = time.match(/\d+/);
        const currentDate = new Date();
        const fourDaysAgo = new Date(currentDate);
        time = fourDaysAgo.setDate(currentDate.getDate() - match);
    } else if (time.includes('周前')) {
        const currentDate = new Date();
        const fourDaysAgo = new Date(currentDate);
        time = fourDaysAgo.setDate(currentDate.getDate() - 7);
    } else if (time.includes('小时')) {
        const match = time.match(/\d+/);
        const currentDate = new Date();
        const fourDaysAgo = new Date(currentDate);
        time = fourDaysAgo.setHours(currentDate.getHours() - match);
    } else if (time.includes('分钟')) {
        const match = time.match(/\d+/);
        const currentDate = new Date();
        const fourDaysAgo = new Date(currentDate);
        time = fourDaysAgo.setMinutes(currentDate.getMinutes() - match);
    } else if (time.includes('-')) {
        const formattedDate = time.replace(' · ', '');
        const dateParts = formattedDate.split('-');
        if (dateParts[0].length === 4) {
            time = formattedDate;
        } else {
            const currentYear = new Date().getFullYear();
            const formattedDate = currentYear + '-' + time.replace(' · ', '');
            time = formattedDate;
        }
    } else {
        const currentYear = new Date().getFullYear();
        const formattedDate = currentYear + '-' + time.replace(' · ', '');
        time = formattedDate;
    }

    return {
        amount: parseNumberWithKAndM(amount.textContent),
        time: dayjs(time).format('YYYY-MM-DD'),
        // time: '2022-12-11',
        url,
    };
}

function parseNumberWithKAndM(input) {
    const numericPart = parseFloat(input);
    if (input.endsWith('k') || input.endsWith('K')) {
        return numericPart * 1000;
    } else if (input.endsWith('m') || input.endsWith('M')) {
        return numericPart * 1000000;
    } else {
        return numericPart;
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

function GetKocVideoData(data) {
    return Messenger.send('koc', { action: 'receive', data }, { to: 'bg' });
}

function skipFun(data) {
    return Messenger.send('koc', { action: 'skip', data }, { to: 'bg' });
}
