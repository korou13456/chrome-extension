import { isEmpty } from 'lodash';
import browser from 'webextension-polyfill';
import { goMainPage } from '../messenger/crmcollection';

export default async function crmcollection(data) {
    let url = 'https://creatormarketplace.tiktok.com/ad/market?query=';
    if (isEmpty(data)) return;

    for (let i = 0; i < data.length; i++) {
        const newDate = data[i];
        const [, name] = [...newDate];

        console.log(name);
        browser.tabs.create({ url: url + name });
        await goMainPage();
    }
}
