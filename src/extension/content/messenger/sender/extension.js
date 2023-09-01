import Messenger from '../index';

export function csloaded() {
    return Messenger.send(
        'extension',
        { action: 'cs:loaded' },
        { to: 'bg', ignoreResponse: true }
    );
}

export function Start() {
    return Messenger.send(
        'extension',
        { action: 'start' },
        { to: 'bg', ignoreResponse: true }
    );
}

csloaded();

export default {
    csloaded,
    Start,
};
