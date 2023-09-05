import Messenger from '../messenger';

export function push(data) {
    return Messenger.send('crm', { action: 'push', data }, { to: 'bg' });
}

export default {
    push,
};
