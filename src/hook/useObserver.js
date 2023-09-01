import { useEffect } from 'react';

export default function useObserver(node) {
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const HtmlNode = document.querySelector('html');

            if (HtmlNode) {
                const LastChildNode = HtmlNode.lastChild;
                if (LastChildNode !== node) {
                    HtmlNode.insertBefore(node, null);
                }
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);
}
