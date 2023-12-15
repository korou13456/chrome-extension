import browser from 'webextension-polyfill';
import _ from 'lodash';
import { enterFun } from '../messenger/kocVideo';
import BrowserStorage from 'shared/browser-storage';
import ExcelJS from 'exceljs';
import axios from 'axios';
import { postKocData } from 'extension/utils/axios';
import dayjs from 'dayjs';

let data = [];
let num = 0;

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/da204390-7a4e-4372-9eec-33baeefe92e8';

export default async function kocVideoFetching(action, userData, tabs) {
    switch (action) {
        case 'start':
            (() => {
                const [, , , , url] = [...userData];
                browser.tabs.create({
                    url,
                });
                enterFun();
            })();

            break;
        case 'receive': {
            Integration(userData, data[num]);
            num++;
            if (num >= data.length) {
                return;
            }
            await browser.tabs.remove(tabs[0].id);
            kocVideoFetching('start', data[num]);
            break;
        }
        case 'skip':
            (async () => {
                const [, , , name] = [...data[num]];
                let noName = (await BrowserStorage.local.get('no:Name')) || [];
                noName.push(name);
                BrowserStorage.local.set('no:Name', noName);
                num++;
                if (num >= data.length) {
                    return;
                }
                await browser.tabs.remove(tabs[0].id);
                kocVideoFetching('start', data[num]);
            })();
            break;
        default:
            data = userData;
            if (!_.isEmpty(data[num])) {
                kocVideoFetching('start', data[num]);
            }
            break;
    }
}

let dataArr = [];

function isNumber(value) {
    return typeof value === 'number';
}

function parseNumberWithKAndM(input) {
    const numericPart = parseFloat(input);
    if (input.endsWith('k') || input.endsWith('K')) {
        return numericPart * 1000;
    } else if (input.endsWith('m') || input.endsWith('M')) {
        return numericPart * 1000000;
    } else {
        return numericPart * 1;
    }
}

async function Integration(arr, thisDate) {
    const [, port_id, in_charge, name, user_url] = [...thisDate];
    arr.forEach((v) => {
        const { amount, time } = { ...v };
        dataArr.push({
            ...v,
            release_time: dayjs(new Date(time)).format('YYYY-MM-DD 00:00:00'),
            port_id: (isNumber(port_id * 1) && port_id * 1) || 0,
            amount: parseNumberWithKAndM(String(amount)),
            in_charge,
            name,
            user_url,
        });
    });
    console.log(dataArr, '!====>>>');

    if (dataArr.length >= 50) {
        await Fun(dataArr);
        dataArr = [];
    }
}

async function Fun(list = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.addRow([
        '窗口编码',
        '负责人',
        '昵称',
        '账号主页链接',
        '播放量',
        '日期',
        '视频url',
    ]);

    // list.forEach((item) => {
    //     const { PortId, InCharge, name, userUrl, amount, time, url } = {
    //         ...item,
    //     };
    //     worksheet.addRow([PortId, InCharge, name, userUrl, amount, time, url]);
    // });

    // workbook.xlsx.writeBuffer().then((buffer) => {
    //     const blob = new Blob([buffer], {
    //         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     });
    //     const url = URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = 'koc.xlsx';
    //     link.click();
    //     URL.revokeObjectURL(url);
    // });
    try {
        postKocData('/tt_koc_collect', list);
    } catch (error) {
        const message = {
            msg_type: 'text',
            content: {
                text: '数据库存入失败，已经存入本地请尽快处理',
            },
        };
        let data = (await BrowserStorage.local.get('kocList')) || [];
        data = [...data, ...list];
        await BrowserStorage.local.set('kocList', data);
        await axios.post(webhookUrl, message);
    }
    const num = list.length;
    const message = {
        msg_type: 'text',
        content: {
            text: '完成爬取' + num + '条，注意查看',
        },
    };
    console.log(list, '!====>>>');
    await axios.post(webhookUrl, message);
}