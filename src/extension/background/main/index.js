import browser from 'webextension-polyfill';
import delay from 'delay';

import ExcelJS from 'exceljs';

import axios from 'axios';

import {
    getDetails,
    clickGoVideo,
    lazyFun,
    getTabs,
    getTime,
    getAmount,
} from '../messenger/dataProcessing';

import { enterFun } from '../messenger/redskins';

import redskins from 'extension/background/redskins';

import { postFormData } from 'extension/utils/axios';

let NameArr = [];

let num = 0;

let Arr = [];

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
                    amount = 0, // 播放量
                    is_it_up_to_date,
                    name,
                } = { ...obj };

                if (is_it_up_to_date) {
                    if (fans >= 10000 && amount >= 15000) {
                        try {
                            // 判断当前名字是否重复
                            const { data: urlData } = {
                                ...(await postFormData('/tt_name_search', {
                                    name,
                                })),
                            };
                            const { data } = { ...urlData };
                            if (!data) {
                                const { data: nameData } = await postFormData(
                                    '/tt_name_push',
                                    {
                                        name,
                                    }
                                );
                                const { code } = { ...nameData };
                                if (code == 0) {
                                    Arr.push(obj);
                                } else {
                                    const message = {
                                        msg_type: 'text',
                                        content: {
                                            text: '输入库插入名字失败' + name,
                                        },
                                    };
                                    await axios.post(webhookUrl, message);
                                }
                            }
                        } catch (error) {
                            console.log(error, name, '!====>>>');
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
                    NameArr = [];
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
                    const tabs = await getTabs();
                    await browser.tabs.remove(tabs[0].id);
                    num = 0;
                    redskins([]);
                    return;
                }

                if (num >= NameArr.length - 5) {
                    lazyFun();
                    await delay(1000);
                    await enterFun();
                } else {
                    main('', 'getData', '');
                }
            })();
            break;
        default:
            // 输入搜索词
            browser.tabs.create({
                url:
                    'https://www.tiktok.com/search/video?q=' +
                    encodeURIComponent(source),
            });
            key_word = source;
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
    const num = list.length;
    const message = {
        msg_type: 'text',
        content: {
            text: '完成爬取' + num + '条，注意查看',
        },
    };
    await axios.post(webhookUrl, message);
}

let getNum = 0;
async function getDate(number, name) {
    let obj = {};
    obj['name'] = name;
    obj['keyWord'] = key_word;
    browser.tabs.create({ url: 'https://www.tiktok.com/@' + name });
    const { fansNum, emailText } = {
        ...(await getDetails(number)),
    };
    await delay(2000);
    const { amountArr } = { ...(await getAmountFun()) };
    if (amountArr.length <= 0) {
        return {};
    }
    obj['fans'] = parseNumberWithKAndM(fansNum);
    obj['amount'] = amountArrFun(amountArr);
    obj['url'] = 'https://www.tiktok.com/@' + name;
    obj['email'] = extractEmail(emailText);
    await clickGoVideo();
    getNum = 0;
    const { time, tabs } = { ...(await getTimeFun()) };
    obj['time'] = time;
    obj['is_it_up_to_date'] = TimeProcessing(time);
    await browser.tabs.remove(tabs[0].id);
    return obj;
}
async function getAmountFun() {
    const { amountArr = [] } = { ...(await getAmount()) };
    let a = false;

    try {
        for (let i = 0; i < amountArr.length; i++) {
            if (parseNumberWithKAndM(amountArr[i]) > 0) a = true;
        }
    } catch (error) {
        console.error(error);
    }
    if (a || getNum >= 10) {
        console.log(amountArr, '!----->>返回');

        return { amountArr };
    }
    getNum++;
    const promises = [new Promise((resolve) => setTimeout(resolve, 1000))];
    await Promise.all(promises);
    return getAmountFun();
}

async function getTimeFun() {
    await delay(1000);
    const { response, tabs } = { ...(await getTime()) };
    const { time } = { ...response };
    if (time || getNum >= 10) {
        return { time, tabs };
    }
    getNum++;
    return await getTimeFun();
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
    try {
        const numericPart = parseFloat(input);
        if (input.endsWith('k') || input.endsWith('K')) {
            return numericPart * 1000;
        } else if (input.endsWith('m') || input.endsWith('M')) {
            return numericPart * 1000000;
        } else {
            return numericPart;
        }
    } catch (error) {
        return 0;
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
