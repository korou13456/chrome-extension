import $ from 'jquery';
import { Start } from 'extension/content/messenger/sender/extension';

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
    });
}
