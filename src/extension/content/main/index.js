// import $ from 'jquery';

import { Start } from 'extension/content/messenger/sender/extension';

export default function main() {
    const url = window.location.toString();

    window.addEventListener('load', function () {
        var loadStatus = document.readyState;
        if (loadStatus != 'complete') return;

        const Startreggexp = /https:\/\/www\.tiktok\.com\/search\?q=.*&t=\d+/;

        if (new RegExp(Startreggexp).test(url)) Start();

        // // 创建一个 MutationObserver 实例
        // const observer = new MutationObserver(function (mutationsList) {
        //     // mutationsList 包含了所有的变化
        //     // 在这里你可以处理元素的添加、删除或属性更改等操作
        //     mutationsList.forEach(function (mutation) {
        //         if (mutation.type === 'attributes') {
        //             // 元素属性发生变化
        //             console.log('元素属性发生变化');
        //             console.log(
        //                 // document.querySelectorAll('.tiktok-xsheez-DivPlayerContainer'),
        //                 $('[data-e2e="search-card-user-unique-id"]'),
        //                 '!-->'
        //             );
        //         }
        //     });
        // });

        // // 选择要观察的目标元素，可以是文档的整个body或任何其他元素
        // const targetElement = document.body;

        // // 配置观察器的选项
        // const config = { childList: true, attributes: true, subtree: true };

        // // 启动观察器并开始监听
        // observer.observe(targetElement, config);
    });

    // // 懒加载触发函数
    // function LazyTriggering() {
    //     window.scrollTo(0, document.body.scrollHeight);
    // }

    // // 开始获取红人数据

    // // 获取红人数量

    // // 跳转进入红人页面收集
}
