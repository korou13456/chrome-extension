import Messenger from '../index';
import Extension from '../sender/extension';
import main from 'extension/background/main';

Messenger.on('extension', async (message) => {
    try {
        let { content = {}, tab = {} } = { ...message },
            { id: tabId } = { ...tab },
            { action = '', keyWord } = { ...content };
        switch (action) {
            case 'cs:loaded':
                Extension.csrun(tabId);
                break;
            case 'start':
                console.log('!@#lll开始');
                main(keyWord);
                break;
        }
    } catch (e) {
        console.log(e);
    }
});
