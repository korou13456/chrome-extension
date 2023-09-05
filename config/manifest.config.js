module.exports = (() => {
    return {
        name: '__MSG_app_name__',
        version: '0.0.1',
        manifest_version: 2,
        description: '__MSG_app_description__',
        default_locale: 'en_US',
        icons: {
            128: 'icon/icon-128.png',
            38: 'icon/icon-38.png',
            32: 'icon/icon-32.png',
            19: 'icon/icon-19.png',
            16: 'icon/icon-16.png',
        },
        externally_connectable: {
            matches: ['*://*.coupert.com/*', '*://*.coupert.me/*'],
        },
        background: {
            persistent: false,
            page: 'chrome-extension.html',
        },
        browser_action: {
            default_icon: {
                38: 'icon/icon-38.png',
                32: 'icon/icon-32.png',
                19: 'icon/icon-19.png',
                16: 'icon/icon-16.png',
            },
            default_title: '__MSG_app_name__',
            default_popup: 'popover.html',
        },
        content_scripts: [
            {
                all_frames: false,
                js: ['content.js'],
                css: [
                    'css/inject-cb.css',
                    'css/inject-cb-rate.css',
                    'css/five-time.css',
                ],
                match_about_blank: false,
                matches: ['http://*/*', 'https://*/*'],
                run_at: 'document_end',
            },
            {
                all_frames: false,
                js: ['guide.js'],
                match_about_blank: false,
                matches: ['http://*/*', 'https://*/*'],
                run_at: 'document_start',
            },
        ],
        permissions: [
            'cookies',
            'tabs',
            'storage',
            'nativeMessaging',
            'unlimitedStorage',
            'http://*/*',
            'https://*/*',
        ],
        web_accessible_resources: ['image/*', 'css/*', 'template/*', 'font/*'],
        content_security_policy:
            "script-src 'self' 'unsafe-eval' https://www.google-analytics.com; object-src 'self'",
    };
})();
