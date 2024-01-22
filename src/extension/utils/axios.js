import axios from 'axios';

// const BASE_URL = 'http://127.0.0.1:8085/api-go';
const BASE_URL = 'https://backendnew.coupert.com/api-go';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});

export const get = (url, params = {}) => {
    return api.get(url, { params });
};
export const postFormData = (url, formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    return api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const postKocData = (url, list) => {
    console.log(list, '!====>>');
    const data = new FormData();
    data.append('data', JSON.stringify(list));
    return api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const postKocGet = () => {
    return api.post(
        '/koc_account_list',
        {
            page: {
                page_size: 10000,
                page: 1,
            },
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};

export const postUpload = (url, file) => {
    const data = new FormData();
    data.append('file', file);
    return api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default {
    postFormData,
    get,
    postUpload,
};
