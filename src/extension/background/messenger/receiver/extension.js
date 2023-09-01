import Messenger from '../index';
// import Extension from '../sender/extension';
import main from 'extension/background/main';

Messenger.on('extension', async (message) => {
    try {
        let { content = {}, tab = {} } = { ...message },
            { id: tabId } = { ...tab },
            { action = '' } = { ...content };
        switch (action) {
            case 'cs:loaded':
                // Extension.csrun(tabId);
                main(tabId);
                break;
        }
    } catch (e) {
        console.log(e);
    }
});
