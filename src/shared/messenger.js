import _, { isUndefined } from 'lodash';
import { sprintf } from 'sprintf-js';
import EventEmitter from 'eventemitter3';
import browser from 'webextension-polyfill';

import { parseDomain } from './parse';
import BrowserPolyfill from './browser-polyfill';

const CONTENT_SCRIPT = 'cs';
const BACKGROUND_PAGE = 'bg';
const POPOVER_PAGE = 'pg';

const supportEnvironments = {
    [CONTENT_SCRIPT]: CONTENT_SCRIPT,
    [BACKGROUND_PAGE]: BACKGROUND_PAGE,
    [POPOVER_PAGE]: POPOVER_PAGE,
};

export default class Messenger extends EventEmitter {
    constructor(environment = 'bg') {
        super();
        this.setEnvironment(environment);
        this._initListener();
    }

    setEnvironment(environment) {
        if (!environment || typeof environment != 'string') {
            throw new Error('environment must be a non empty string.');
        }
        if (!supportEnvironments[environment]) {
            throw new Error(
                sprintf(
                    'unsupported environment, only supported [%s, %s, %s]',
                    CONTENT_SCRIPT,
                    BACKGROUND_PAGE,
                    POPOVER_PAGE
                )
            );
        }
        this.environment = environment;
    }

    getEnvironment() {
        return this.environment;
    }

    _initListener() {
        browser.runtime.onMessage.addListener((message, sender) => {
            const {
                ignoreResponse = false,
                from,
                to,
            } = {
                ...message,
            };
            if (this.getEnvironment() === to) {
                return new Promise((resolve, reject) => {
                    (async () => {
                        if (BACKGROUND_PAGE == to) {
                            let tab = {};
                            if (CONTENT_SCRIPT == from) {
                                tab = sender.tab;
                            } else if (POPOVER_PAGE == from) {
                                const { windowId } = {
                                    ...message,
                                };
                                let tabs = await BrowserPolyfill.getTabs({
                                    active: true,
                                    windowId: windowId,
                                });
                                tab = tabs[0];
                            }

                            const { url } = tab;
                            tab = _.assign(tab, parseDomain(url));
                            message = {
                                ...message,
                                tab,
                            };
                        }

                        message = {
                            ...message,
                            sender,
                        };

                        this.emit(
                            message,
                            {
                                resolve,
                                reject,
                            },
                            {
                                ignoreResponse,
                            }
                        );
                    })();
                });
            }
        });
    }

    emit(message, promise, opts = {}) {
        const { event } = {
                ...message,
            },
            { ignoreResponse = false } = {
                ...opts,
            },
            { resolve, reject } = {
                ...promise,
            };
        if (ignoreResponse) {
            super.emit(
                event,
                {
                    ...message,
                },
                () => {},
                () => {}
            );
            resolve();
        } else {
            let hasListener = super.emit(
                event,
                {
                    ...message,
                },
                (r) => {
                    if (isUndefined(r)) {
                        r = null;
                    }
                    resolve(r);
                },
                (e) => {
                    let error = e;
                    if (!(error instanceof Error)) {
                        error = new Error(error);
                    }
                    reject(error);
                }
            );
            if (!hasListener) {
                reject(new Error(sprintf('No Listener: %s', event)));
            }
        }
    }

    async send(event, content = {}, opts = {}) {
        const { to = 'self', ignoreResponse = false } = {
            ...opts,
        };
        let message = {
            to,
            event,
            content,
            ignoreResponse,
            from: this.getEnvironment(),
        };

        if (CONTENT_SCRIPT == to) {
            const { tabId } = {
                ...opts,
            };

            return browser.tabs.sendMessage(tabId, message);
        }
        if (BACKGROUND_PAGE == to) {
            if (POPOVER_PAGE == this.getEnvironment()) {
                let windowInfo = await browser.windows.getCurrent({
                    populate: true,
                });
                message = {
                    windowId: windowInfo.id,
                    ...message,
                };
            }

            return browser.runtime.sendMessage(message);
        }
        if (POPOVER_PAGE == to) {
            return browser.runtime.sendMessage(message);
        }
        return new Promise((resolve, reject) => {
            this.emit(
                message,
                {
                    resolve,
                    reject,
                },
                opts
            );
        });
    }
}
