import Messenger from '../index';

function get() {
    return Messenger.send(
        'extension:cs:run',
        {},
        { to: 'cs', ignoreResponse: true }
    ).catch((e) => {
        console.log(e);
    });
}

export default {
    get,
};
