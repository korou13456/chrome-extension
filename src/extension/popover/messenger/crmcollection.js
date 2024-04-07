import Messenger from '../messenger';

export function push(data) {
    return Messenger.send('crm', { action: 'push', data }, { to: 'bg' });
}

export function UploadCrm(data) {
    return Messenger.send('crm', { action: 'UploadCrm', data }, { to: 'bg' });
}

export function GetRedskinsInfo(data) {
    return Messenger.send('redskins', { action: 'start', data }, { to: 'bg' });
}

export function GetKocVideoData(data) {
    return Messenger.send('koc', { action: 'start', data }, { to: 'bg' });
}

export function GetKocVideoSupplement(data) {
    return Messenger.send('kocs', { action: 'start', data }, { to: 'bg' });
}

export function AcsGetVideoTitle(data) {
    return Messenger.send('acs', { action: 'start', data }, { to: 'bg' });
}

export default {
    push,
    UploadCrm,
    GetRedskinsInfo,
    GetKocVideoData,
    GetKocVideoSupplement,
    AcsGetVideoTitle,
};
