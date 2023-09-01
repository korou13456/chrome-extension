import Messenger from '../index';

export function csrun(tabId) {
    return Messenger.send(
        'extension:cs:run',
        {},
        { tabId, to: 'cs', ignoreResponse: true }
    ).catch((e) => {
        console.log(e);
    });
}

export default {
    csrun,
};
