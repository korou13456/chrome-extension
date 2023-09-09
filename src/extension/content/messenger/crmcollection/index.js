import $ from 'jquery';
import Messenger from '../index';

import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { action, name } = { ...request };
    switch (action) {
        case 'crmcollection:goMainPage':
            (async () => {
                let num = 0;
                let time = setInterval(async () => {
                    const total = $('[total-count]').attr('total-count');
                    num++;
                    const demo = $('.el-table__row')[0];
                    if (demo || num == 10) {
                        clearInterval(time);
                        console.log(total, '!---><>>');
                        if (total == 0) {
                            clearInterval(time);
                            skipFun(name);
                            return;
                        } else if (total == 1) {
                            if (demo) {
                                clearInterval(time);
                                const clickEvent = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                });
                                demo.dispatchEvent(clickEvent);
                            }
                        } else {
                            const nameArr =
                                document.querySelectorAll('.user-name');
                            let num = -1;
                            for (let i = 0; i < nameArr.length; i++) {
                                const Newname = nameArr[i].innerText;
                                console.log(
                                    nameArr,
                                    nameArr[i].innerText,
                                    name,
                                    '!--->>>>>,><>>>>>'
                                );

                                console.log(Newname, name, '!--->>>>>,><>>>>>');
                                if (Newname == name) num = i;
                            }
                            console.log(num, '!--->>>=====');
                            if (num == -1) {
                                skipFun(name);
                                return;
                            }
                            const demoO =
                                document.querySelectorAll('.el-table__row')[
                                    num
                                ];
                            if (demoO) {
                                clearInterval(time);
                                const clickEvent = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                });
                                demoO.dispatchEvent(clickEvent);
                            }
                        }
                    }
                }, 1000);
            })();
            break;
        case 'crmcollection:getData':
            (() => {
                const response = {
                    data: getData(),
                };
                sendResponse(response);
            })();
            break;
    }
});

async function skipFun(name) {
    console.log(name, '!---->>>');
    Messenger.send(
        'crm',
        { action: 'skip', name },
        { to: 'bg', ignoreResponse: true }
    );
}

function getData() {
    // #1
    const name =
        document.querySelector('.user-name div').textContent.trim() || null;
    // #2
    const signature =
        $(
            '.basic-info .base-info-item .el-popover__reference-wrapper'
        ).text() || '未找到签名';
    // #3
    const fansNumber =
        document.querySelector(
            '.author-data-card .data-item:first-child span.font-semibold'
        ).innerText || '';
    // #4
    const averageNumber =
        document.querySelector(
            '.author-data-card .data-item:nth-child(2) span.font-semibold'
        ).innerText || '';

    // #5
    const interactionRate =
        document.querySelector(
            '.author-data-card .data-item:last-child span.font-semibold'
        ).innerText || '';

    // #6
    const ProportionOf = document.querySelector(
        '.author-audience .gender-icon + .profile-val'
    ).innerText;

    // #11
    function CountryRateFun() {
        let datas = [];
        const eles = document.querySelectorAll('#world_map+div .line-percent');
        for (let ele of eles) {
            let data = {};
            data.title = ele.querySelector('h4').innerText;
            data.value = ele.querySelector('.percent').innerText;
            datas.push(data);
        }
        return datas.length > 0 ? datas : '无数据';
    }

    const countryRate = CountryRateFun();

    // 获取年龄占比
    const title = document.querySelector('.profile-title').innerText;
    const ValueRate = document.querySelectorAll('.profile-val')[2].innerText;

    const url = window.location.toString();

    return {
        name,
        signature,
        fansNumber,
        averageNumber,
        interactionRate,
        ProportionOf,
        countryRate,
        title,
        ValueRate,
        url,
    };
}
