import browser from 'webextension-polyfill';
import _ from 'lodash';
import { enterFun } from '../messenger/kocVideo';
import BrowserStorage from 'shared/browser-storage';
import axios from 'axios';
import { postKocData } from 'extension/utils/axios';

let data = [];
let num = 0;
let arr = [];

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/da204390-7a4e-4372-9eec-33baeefe92e8';

export default async function kocVideoFetching(action, userData, id) {
    switch (action) {
        case 'start':
            (async () => {
                const [, url] = [...userData];
                console.log(userData, num, '!0-00000>>');
                const { id } = {
                    ...(await browser.tabs.create({
                        url,
                    })),
                };
                console.log(id);
                enterFun(id);
            })();
            break;
        case 'skip':
            (async () => {
                await browser.tabs.remove(id);
                let arr = (await BrowserStorage.local.get('koc:bu')) || [];
                arr.push(userData);
                await BrowserStorage.local.set('koc:bu', arr);
                num++;
                kocVideoFetching('start', data[num]);
            })();

            break;
        case 'receive': {
            num++;
            const {
                url,
                title,
                like_num = 0,
                comments = 0,
                collection = 0,
                share_num = 0,
            } = {
                ...userData,
            };
            arr.push({
                url,
                title,
                like_num,
                comments,
                collection,
                share_num,
            });
            if (arr.length >= 20) {
                await Fun(arr);
                arr = [];
            }
            if (num >= data.length) {
                await Fun(arr);
                return;
            }
            await browser.tabs.remove(id);
            kocVideoFetching('start', data[num]);
            break;
        }
        default:
            data = userData;
            if (!_.isEmpty(data[num])) {
                kocVideoFetching('start', data[num]);
            }
            break;
    }
}

async function Fun(list = []) {
    console.log(list, '!_-----:::');
    try {
        await postKocData('/tt_koc_data_supplement', list);
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
}
