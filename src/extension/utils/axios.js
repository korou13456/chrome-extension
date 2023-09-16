// api.js

import axios from 'axios';

const DEV_BASE_URL = 'http://127.0.0.1:8085/api-go'; // 替换为实际的 API 地址
// const BASE_URL = 'https://backendnew.coupert.com/api-go'; // 替换为实际的 API 地址

const api = axios.create({
    baseURL: DEV_BASE_URL,
    timeout: 10000, // 请求超时时间
});

// GET 请求示例
export const get = (url, params = {}) => {
    return api.get(url, { params });
};
// POST 请求示例（支持 FormData 格式）
export const postFormData = (url, formData) => {
    const data = new FormData();
    data.append('name', formData.name);
    return api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data', // 设置请求头为 FormData
        },
    });
};

// POST 请求示例（支持 FormData 格式）
export const postUpload = (url, file) => {
    const data = new FormData();
    data.append('file', file);
    return api.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data', // 设置请求头为 FormData
        },
    });
};

export default {
    postFormData,
    get,
    postUpload,
};
