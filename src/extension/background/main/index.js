import browser from 'webextension-polyfill';
import BrowserStorage from 'shared/browser-storage';

import ExcelJS from 'exceljs';
import delay from 'delay';
import { isEmpty } from 'lodash';
import {
    get,
    getName,
    getDetails,
    clickGoVideo,
    lazyFun,
} from '../messenger/dataProcessing';

import axios from 'axios';

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/49623249-6703-4ed3-a233-2b1c1e355575';

let num = 0;

let Arr = [];

let key_word = '';

export default async function main(keyWord) {
    if (keyWord) key_word = keyWord;
    if (!window.ifgo) {
        if (!isEmpty(Arr)) {
            Fun(Arr);
            Arr = [];
            await BrowserStorage.local.set('thisNum', num);
        }
        return;
    }

    const thisNum = (await BrowserStorage.local.get('thisNum')) || 0;
    await BrowserStorage.local.del('thisNum');

    if (thisNum) {
        num = thisNum;
    }

    const { num: Total = 0 } = { ...(await get()) };
    if (!Total) return main();

    if (Total != 0 && num != 0 && Total == num) {
        // 要发送的消息内容
        const message = {
            msg_type: 'text',
            content: {
                text: '数据到底',
            },
        };
        await axios.post(webhookUrl, message);
    }

    if (Total - num <= 5) {
        lazyFun();
        await delay(1000);
        return main();
    }
    let obj = await getDate(num, key_word);

    const { fans = 0, amount = 0, is_it_up_to_date } = { ...obj };

    if (!hasDuplicateName(Arr, obj) && is_it_up_to_date) {
        if ((fans >= 10000 && amount >= 100000) || (fans == 0 && amount == 0)) {
            Arr.push(obj);
        }
    }
    console.log(Arr, num, '!--->><>>>>>');
    num += 1;
    await delay(2000);
    if (Arr.length >= 100) {
        // 要发送的消息内容
        const message = {
            msg_type: 'text',
            content: {
                text: '已经成功获取100条数据',
            },
        };
        await Fun(Arr);
        await axios.post(webhookUrl, message);
        Arr = [];
    }
    main();
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
    ]);

    list.forEach((item) => {
        worksheet.addRow([
            item.name,
            item.fans,
            item.amount,
            item.time,
            item.keyWord,
            item.url,
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
}

async function getDate(number, keyWord) {
    let obj = {};
    obj['keyWord'] = keyWord;
    const { name = '' } = await getName(number);
    obj['name'] = name;
    browser.tabs.create({ url: 'https://www.tiktok.com/@' + name });
    const { fansNum, amountArr } = {
        ...(await getDetails(number)),
    };

    obj['fans'] = parseNumberWithKAndM(fansNum);
    obj['amount'] = amountArrFun(amountArr);
    obj['url'] = 'https://www.tiktok.com/@' + name;
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
    const DateRegex = /^\d{1,2}-\d{1,2}$/;

    if (DateRegex.test(time)) {
        const givenDate = new Date(
            `${new Date().getFullYear()}-${time} 00:00:00`
        );
        const currentDate = new Date();
        const twoWeeksAgo = new Date(currentDate);
        twoWeeksAgo.setDate(currentDate.getDate() - 14);
        if (givenDate >= twoWeeksAgo && givenDate <= currentDate) {
            return true;
        } else {
            return false;
        }
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

function hasDuplicateName(arr, obj) {
    const names = arr.map((item) => item.name);

    if (names.includes(obj.name)) {
        return true;
    } else {
        return false;
    }
}
