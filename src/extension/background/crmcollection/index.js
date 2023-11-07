import { isEmpty } from 'lodash';
import browser from 'webextension-polyfill';
import { goMainPage, getData } from '../messenger/crmcollection';
import ExcelJS from 'exceljs';
import axios from 'axios';

let Arr = [];
let NoArr = [];
let num = 0;
let thisData = {};

let dataArr = [];

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/49623249-6703-4ed3-a233-2b1c1e355575';

const headers = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    authKey: 'f4d01d0db3a57484bbc37daf58c96fe0',
    sessionId: 'lo06p3ctg949ij69me7j9st1b7',
};

export default async function crmcollection(data, active) {
    switch (active) {
        case 'UploadCrm':
            console.log(data, '开始crm上传');
            break;
        case 'skip':
            NoArr.push(thisData);
            num++;
            crmcollection(dataArr);
            break;
        case 'canDetect':
            (async () => {
                const { response, tabs } = await getData();
                const { data } = { ...response };
                const {
                    name,
                    interactionRate,
                    ProportionOf,
                    title,
                    ValueRate,
                    countryRate,
                    url: tcmUrl,
                } = { ...data };
                const [, , fans, Amount_of_playback, , Key_Word, url, email] = [
                    ...dataArr[num],
                ];
                const defaultCountryRate = countryRate;
                let countryString = '';
                let ifCountry = false;
                if (!isEmpty(defaultCountryRate)) {
                    for (let i = 0; i < defaultCountryRate.length; i++) {
                        const { title, value } = { ...defaultCountryRate[i] };
                        if (title == '美国' || title == '英国') {
                            if (value.replace('%', '') >= 50) ifCountry = true;
                        }
                        countryString += `${title}:${value};`;
                    }
                }
                if (!ifCountry) {
                    setTimeout(() => {
                        num++;
                        crmcollection(dataArr);
                        setTimeout(() => {
                            browser.tabs.remove(tabs[0].id);
                        }, 2000);
                    }, 5000);
                    return;
                }

                const obj = {
                    name, // 客户名称
                    industry: '服装配饰', // 客户行业
                    inCharge: 'initialization', // 负责人
                    types: '红人', // 客户类型
                    progress: '待沟通', // 合作进度
                    LinkedIn_Acct: tcmUrl, // LinkedIn_Acct
                    fans, // 全平台粉丝
                    Amount_of_playback, // 平均播放量
                    interactionRate, // 互动率
                    customerLevel: '', // 客户级别
                    Source: '搜索引擎', // 客户来源
                    ProportionOf, // 女性占比
                    distribution: `${title}:${ValueRate}`, // 年龄分布
                    Country: countryString, // 国家受众占比
                    AppleRate: 0, // 设备apple占比
                    email,
                    url, // 红人主页
                    Key_Word,
                };
                axios
                    .post(
                        'http://crm.cpm.soarinfotech.com/index.php/crm/index/queryRepeat',
                        { type: 'name', content: name },
                        { headers }
                    )
                    .then((response) => {
                        const {
                            data: { data },
                        } = { ...response };
                        if (!isEmpty(data)) {
                            let ifShow = false;
                            for (let i = 0; i < data.length; i++) {
                                const { name: showName } = { ...data[i] };
                                if (showName == name) ifShow = true;
                            }
                            if (!ifShow) {
                                Arr.push(obj);
                            }
                        } else {
                            Arr.push(obj);
                        }
                        setTimeout(() => {
                            num++;
                            crmcollection(dataArr);
                            setTimeout(() => {
                                browser.tabs.remove(tabs[0].id);
                            }, 10000);
                        }, 2000);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })();
            break;
        default:
            (async () => {
                if (window.ifShou) {
                    if (!isEmpty(Arr)) Fun(Arr);
                    if (!isEmpty(NoArr)) Fun2(NoArr);
                    return;
                }
                if (data.length <= num) {
                    const message = {
                        msg_type: 'text',
                        content: {
                            text: '红人搜索完毕',
                        },
                    };
                    await axios.post(webhookUrl, message);
                    if (!isEmpty(Arr)) Fun(Arr);
                    console.log(NoArr, '!--->>>>11===');
                    if (!isEmpty(NoArr)) Fun2(NoArr);
                    return;
                }
                let url =
                    'https://creatormarketplace.tiktok.com/ad/market?query=';
                if (isEmpty(data)) return;
                dataArr = data;
                if (data.length < num) return;
                console.log(data[num], Arr, NoArr, num, '!-->M<>>>');
                thisData = data[num];
                const [, name] = [...data[num]];
                browser.tabs.create({ url: url + name });
                const { tabs } = await goMainPage(name);
                setTimeout(() => {
                    browser.tabs.remove(tabs[0].id);
                }, 10000);
            })();
            break;
    }
}

async function Fun(list = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRow([
        '*客户名称',
        '*客户行业',
        '*负责人',
        '*客户类型',
        '*合作进度',
        'LinkedIn Acct',
        '全平台粉丝数量',
        '平均播放量',
        '互动率',
        '客户级别',
        '*客户来源',
        '女性占比',
        '年龄受众分布',
        '国家受众占比',
        '设备APPLE占比',
        '*邮箱',
        '*红人主页',
        '备注',
        '下次联系时间',
        '手机',
        '固定电话',
        '省',
        '市',
        '区/县',
        '详细地址',
    ]);
    list.forEach((item) => {
        const {
            name,
            industry,
            inCharge,
            types,
            progress,
            LinkedIn_Acct,
            fans,
            Amount_of_playback,
            interactionRate,
            customerLevel,
            Source,
            ProportionOf,
            distribution,
            Country,
            AppleRate,
            email,
            url,
            Key_Word = null,
        } = {
            ...item,
        };
        let dd = '';
        if (interactionRate.includes('%')) {
            dd = interactionRate.replace(/%/g, '');
        } else {
            dd = interactionRate;
        }
        let nn = '';
        if (ProportionOf.includes('%')) {
            nn = ProportionOf.replace(/%/g, '');
        } else {
            nn = ProportionOf;
        }
        worksheet.addRow([
            name,
            industry,
            inCharge,
            types,
            progress,
            LinkedIn_Acct,
            fans,
            Amount_of_playback,
            dd,
            customerLevel,
            Source,
            nn,
            distribution,
            Country,
            AppleRate,
            email,
            url,
            Key_Word,
        ]);
    });
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'uploadFile.xlsx';
        link.click();
        URL.revokeObjectURL(url);
    });
}

async function Fun2(list = []) {
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
            item[1],
            item[2],
            item[3],
            item[4],
            item[5],
            item[6],
            item[7],
        ]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'nois.xlsx';
        link.click();
        URL.revokeObjectURL(url);
    });
}
