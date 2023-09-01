import Messenger from '../index';
Messenger.on('extension', async (message, sendResponse, throwError) => {
    let { content = {} } = { ...message },
        { action = '' } = { ...content };
    try {
        switch (action) {
            case 'get':
                console.log(12312);
                break;
        }
    } catch (e) {
        throwError(e);
    }
});
