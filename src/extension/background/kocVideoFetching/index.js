import browser from 'webextension-polyfill';
import _ from 'lodash';
import { enterFun } from '../messenger/kocVideo';
import BrowserStorage from 'shared/browser-storage';
import axios from 'axios';
import { postKocData } from 'extension/utils/axios';
import dayjs from 'dayjs';

let data = [];
let num = 0;

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/da204390-7a4e-4372-9eec-33baeefe92e8';

let dataArr = [];

export default async function kocVideoFetching(action, userData, id) {
    switch (action) {
        case 'start':
            (async () => {
                const [, , , , url] = [...userData];
                const { id } = {
                    ...(await browser.tabs.create({
                        url,
                    })),
                };
                console.log(id);
                enterFun(id);
            })();
            break;
        case 'receive': {
            Integration(userData, data[num]);
            num++;
            if (num >= data.length) {
                Fun(dataArr);
                return;
            }
            await browser.tabs.remove(id);
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
                await browser.tabs.remove(id);
                kocVideoFetching('start', data[num]);
            })();
            break;
        default:
            data = userData;
            if (!_.isEmpty(data[num])) {
                for (let i = 0; i < 1; i++) {
                    kocVideoFetching('start', data[num]);
                    num++;
                }
            }
            break;
    }
}

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

    await Fun(dataArr);
    dataArr = [];
}

async function Fun(list = []) {
    try {
        await postKocData('/tt_koc_collect', list);
        // postKocData('/tt_koc_time_repair', list);
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
        return;
    }
    const num = list.length;
    const message = {
        msg_type: 'text',
        content: {
            text: '完成爬取' + num + '条，注意查看',
        },
    };
    await axios.post(webhookUrl, message);
}
