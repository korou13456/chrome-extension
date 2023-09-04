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
    if (Total - num <= 5) {
        lazyFun();
        await delay(1000);
        return main();
    }
    let obj = await getDate(num, key_word);
    if (!hasDuplicateName(Arr, obj)) {
        Arr.push(obj);
    }
    num += 1;
    await delay(2000);
    console.log(Arr, '!---><>>>>');
    if (Arr.length >= 100) {
        await Fun(Arr);
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
        'Recently_released',
        'Key_Word',
    ]);

    list.forEach((item) => {
        worksheet.addRow([
            item.name,
            item.fans,
            item.amount,
            item.time,
            item.is_it_up_to_date,
            item.keyWord,
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
    if (chineseCharactersRegex.test(DateRegex)) {
        const givenDate = new Date(
            `${new Date().getFullYear()}-${time}T00:00:00`
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
