import Messenger from '../index';

function get() {
    return Messenger.send(
        'dataProcessing',
        {
            action: 'get',
            data: {},
        },
        { to: 'cs', ignoreResponse: true }
    ).catch((e) => {
        console.log(e);
    });
}

export default {
    get,
};
