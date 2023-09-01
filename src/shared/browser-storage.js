import browser from 'webextension-polyfill';
import escapeStringRegexp from 'escape-string-regexp';

const BrowserStorage = (() => {
    function store(type) {
        const storage = browser.storage[type];

        async function get(key) {
            let items = await storage.get(key);
            let value = items && items[key];
            // try {
            //     value = JSON.parse(value);
            // } catch (e) {}
            return value;
        }

        async function getAll() {
            let items = await storage.get(null);
            return items;
        }

        async function set(key, value) {
            await storage.set(
                ((items, key, value) => {
                    if (key in items) {
                        return Object.defineProperty(items, key, {
                            value,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0,
                        });
                    }
                    items[key] = value;
                    return items;
                    // })({}, key, JSON.stringify(value))
                })({}, key, value)
            );
            return value;
        }

        async function del(key) {
            await storage.remove(key);
            return true;
        }

        async function clear() {
            await storage.clear();
            return true;
        }

        function prefixed(prefix, containsColon = true) {
            if (containsColon) {
                prefix += ':';
            }
            return {
                del: function (key) {
                    return del(prefix + key);
                },
                get: function (key) {
                    return get(prefix + key);
                },
                set: function (key, value) {
                    return set(prefix + key, value);
                },
                clear: async function () {
                    const keys = Object.keys(await getAll());
                    let delCount = 0;
                    keys.forEach((key) => {
                        const escapedString = escapeStringRegexp(prefix);
                        if (new RegExp('^' + escapedString).test(key)) {
                            del(key);
                            delCount++;
                        }
                    });
                    return delCount;
                },
            };
        }

        return {
            set,
            get,
            getAll,
            del,
            clear,
            prefixed,
        };
    }

    return {
        local: store('local'),
        sync: store('sync'),
    };
})();

export default BrowserStorage;

export async function isEnableTestingPanel() {
    return !(await BrowserStorage.local.get('_disableTestingPanel'));
}
