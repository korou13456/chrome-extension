import browser from 'webextension-polyfill';

import { enterFun } from '../messenger/acsVideoTitle';

import ExcelJS from 'exceljs';
import axios from 'axios';

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/49623249-6703-4ed3-a233-2b1c1e355575';
let Data = [
    'Novelty',
    'Games & Accessories',
    'Heating, Cooling & Air Quality',
    'Furniture',
    'Kitchen & Dining',
    'Home Décor Products',
    'Hunting & Fishing',
    'Patio Furniture & Accessories',
    'Grills & Outdoor Cooking',
    'Video Projectors',
    'Accessories',
    'Hardware',
    'Skin Care',
];
let num = 0;
let domainType = 0;
let name = '';
let Thisid;
export default async function acsVideoTitle(action, data, id) {
    console.log(action, data, '!--->>>');
    switch (action) {
        case 'getData':
            Thisid = id;
            enterFun(id);
            break;
        case 'downLoad':
            Fun(data, name);
            browser.tabs.remove(Thisid);
            acsVideoTitle('resume');
            break;
        case 'resume':
            (() => {
                num++;
                console.log(num, domainType, Data.length, '!--->>---');
                if (num >= Data.length) {
                    return '结束';
                }
                // const [, domain] = [...Data[num]];
                goDomain(Data[num]);
            })();
            break;
        default:
            (() => {
                // Data = data;
                if (num >= Data.length) {
                    return '结束';
                }
                // const [, domain] = [...Data[num]];
                goDomain(Data[num]);
            })();
            break;
    }
}

function goDomain(domain) {
    CreateFun(domain, 'Coupon');
    // switch (domainType) {
    //     case 0:
    //         CreateFun(domain, 'Coupon');
    //         break;
    //     // case 1:
    //     //     CreateFun(domain, 'Code');
    //     //     break;
    //     // case 2:
    //     //     CreateFun(domain, 'Discount Code');
    //     //     break;
    // }
}

async function CreateFun(domain, str) {
    name = domain + ' ' + str;
    const { id } = {
        ...(await browser.tabs.create({
            url:
                'https://www.tiktok.com/search/video?q=' +
                encodeURIComponent(domain + ' ' + str),
        })),
    };
    acsVideoTitle('getData', '', id);
}

async function Fun(list = [], name) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRow(['Title']);

    list.forEach((item) => {
        worksheet.addRow([item]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name + '.xlsx';
        link.click();
        URL.revokeObjectURL(url);
    });
    const num = list.length;
    const message = {
        msg_type: 'text',
        content: {
            text: '完成抓取' + num + '条，注意查看',
        },
    };
    await axios.post(webhookUrl, message);
}
