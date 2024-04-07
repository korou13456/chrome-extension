import Messenger from '../index';
import acsVideoTitle from 'extension/background/acsVideoTitle';
import browser from 'webextension-polyfill';

Messenger.on('acs', async (message) => {
    const { content } = { ...message };
    const { action, data } = { ...content };
    switch (action) {
        case 'start':
            // redskins(data);
            console.log(data, '!---====><>>>');
            acsVideoTitle('', data);
            break;
        case 'detection':
            DownLoadFun(data);
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

const DownLoadFun = debounce((data) => {
    console.log(data, '!------>>======x');
    acsVideoTitle('downLoad', data);
}, 1000);

// async function getTabs() {
//     const currentWindow = await browser.windows.getCurrent({
//         populate: true,
//         windowTypes: ['normal'],
//     });
//     const { id } = { ...currentWindow };
//     const tabs = await browser.tabs.query({
//         active: true,
//         windowId: id,
//     });

//     return tabs;
// }

// // 获取页面元素

export async function enterFun(id) {
    console.log('链接');
    try {
        const response = await browser.tabs.sendMessage(id, {
            action: 'acs:getData',
        });
        return response;
    } catch (e) {
        return enterFun(id);
    }
}

export default { enterFun };
