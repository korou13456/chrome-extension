import $ from 'jquery';
import { Start } from 'extension/content/messenger/sender/extension';
import Messenger from '../messenger';

export default function main() {
    const url = window.location.toString();
    window.addEventListener('load', function () {
        var loadStatus = document.readyState;
        if (loadStatus != 'complete') return;

        const Startreggexp =
            /https:\/\/www\.tiktok\.com\/search\/video\?q=.*&t=\d+/;
        if (new RegExp(Startreggexp).test(url)) {
            const keyWord = $('[data-e2e="search-user-input"]').val();
            if (!keyWord) {
                return main();
            }
            Start(keyWord);
        }

        const regexp =
            /https:\/\/creatormarketplace\.tiktok\.com\/ad\/author\/\d+/;
        if (new RegExp(regexp).test(url)) {
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 3000);

            setTimeout(() => {
                canDetect();
            }, 5000);
        }
    });
}

async function canDetect() {
    Messenger.send(
        'crm',
        { action: 'canDetect' },
        { to: 'bg', ignoreResponse: true }
    );
}
