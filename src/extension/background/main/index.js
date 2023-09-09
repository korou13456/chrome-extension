import browser from 'webextension-polyfill';
import delay from 'delay';
import BrowserStorage from 'shared/browser-storage';

import ExcelJS from 'exceljs';

import axios from 'axios';

import { getDetails, clickGoVideo, lazyFun } from '../messenger/dataProcessing';

import { enterFun } from '../messenger/redskins';

import redskins from 'extension/background/redskins';

let NameArr = [];

let num = 0;

let Arr = [];
// 去重使用
let StorageName = [];

let key_word = '';

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/49623249-6703-4ed3-a233-2b1c1e355575';

export default async function main(source, action, data) {
    if (window.ifgo == 123) {
        Fun(Arr);
        return;
    }
    switch (action) {
        case 'end':
            (async () => {
                Fun(Arr);
                const message = {
                    msg_type: 'text',
                    content: {
                        text: '脚本运行完毕',
                    },
                };
                await axios.post(webhookUrl, message);
            })();
            break;
        case 'retry':
            // 已经重新加载
            console.log('重新加载页面');
            break;
        case 'detection':
            NameArr = data;
            main('', 'getData', '');
            break;
        case 'getData':
            (async () => {
                const obj = await getDate(num, NameArr[num]);
                const {
                    fans = 0,
                    amount = 0,
                    is_it_up_to_date,
                    name,
                } = { ...obj };

                console.log(
                    is_it_up_to_date,
                    fans >= 10000,
                    amount >= 100000,
                    '--->>>>===='
                );
                if (is_it_up_to_date) {
                    if (
                        (fans >= 10000 && amount >= 100000) ||
                        (fans == 0 && amount == 0)
                    ) {
                        // 判断当前名字是否重复

                        if (hasDuplicateName(name)) {
                            StorageName.push(name);
                            Arr.push(obj);
                        }
                    }
                }
                if (Arr.length >= 100) {
                    await Fun(Arr);
                    Arr = [];
                }
                console.log(obj, Arr, num, '---===>>>');
                num++;
                if (num == NameArr.length) {
                    console.log('换词--------->>><>>>>>>>>');
                    await BrowserStorage.local.set('storageName', StorageName);
                    NameArr = [];
                    StorageName = [];
                    //  要发送的消息内容
                    const message = {
                        msg_type: 'text',
                        content: {
                            text:
                                key_word +
                                '已经结束，即将换词，共有' +
                                num +
                                '条数据',
                        },
                    };
                    await axios.post(webhookUrl, message);
                    num = 0;
                    redskins([]);
                    return;
                }

                if (num >= NameArr.length - 5) {
                    await delay(2000);
                    lazyFun();
                    await delay(2000);
                    await enterFun();
                } else {
                    main('', 'getData', '');
                }
            })();
            break;
        default:
            // 输入搜索词
            console.log(source, '!---><>>>');
            browser.tabs.create({
                url:
                    'https://www.tiktok.com/search/video?q=' +
                    encodeURIComponent(source),
            });
            key_word = source;
            StorageName = (await BrowserStorage.local.get('storageName')) || [];

            // 开始检测是否进入页面
            await enterFun();
            break;
    }
}

async function Fun(list = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRow([
        'Name',
        'Fans',
        'Amount_of_playback',
        'Time',
        'Key_Word',
        'Url',
        'Email',
    ]);

    list.forEach((item) => {
        worksheet.addRow([
            item.name,
            item.fans,
            item.amount,
            item.time,
            item.keyWord,
            item.url,
            item.email,
        ]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'switchTemplate.xlsx';
        link.click();
        URL.revokeObjectURL(url);
    });
    const message = {
        msg_type: 'text',
        content: {
            text: '完成爬取100条，注意查看',
        },
    };
    await axios.post(webhookUrl, message);
}

async function getDate(number, name) {
    let obj = {};
    obj['name'] = name;
    obj['keyWord'] = key_word;
    browser.tabs.create({ url: 'https://www.tiktok.com/@' + name });
    const { fansNum, amountArr, emailText } = {
        ...(await getDetails(number)),
    };

    obj['fans'] = parseNumberWithKAndM(fansNum);
    obj['amount'] = amountArrFun(amountArr);
    obj['url'] = 'https://www.tiktok.com/@' + name;
    obj['email'] = extractEmail(emailText);
    const { response, tabs } = { ...(await clickGoVideo()) };
    const { time } = { ...response };

    obj['time'] = time;

    obj['is_it_up_to_date'] = TimeProcessing(time);
    browser.tabs.remove(tabs[0].id);
    return obj;
}

function TimeProcessing(time) {
    const chineseCharactersRegex = /[\u4e00-\u9fa5]/;
    if (chineseCharactersRegex.test(time)) {
        return true;
    }
    return false;
}

function amountArrFun(amountArr) {
    let arr = amountArr.map((v) => {
        return parseNumberWithKAndM(v);
    });
    if (arr.length <= 2) {
        return 0;
    }
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const sum = arr.reduce((acc, num) => acc + num, 0);
    const average = (sum - min - max) / (arr.length - 2);
    return average;
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

function hasDuplicateName(name) {
    try {
        if (StorageName.indexOf(name) == -1) return true;
        return false;
    } catch (error) {
        return true;
    }
}

function extractEmail(text) {
    // 使用正则表达式匹配邮箱地址的模式
    const emailRegex = /[\w\\.-]+@[\w\\.-]+\.\w+/;

    // 使用正则表达式的exec方法来查找匹配的邮箱地址
    const match = text.match(emailRegex);

    // 如果找到匹配的邮箱地址，返回它，否则返回null
    if (match) {
        return match[0];
    } else {
        return null;
    }
}
