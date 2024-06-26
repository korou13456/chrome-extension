import React from 'react';
import * as XLSX from 'exceljs';

import {
    push,
    UploadCrm,
    GetRedskinsInfo,
    GetKocVideoData,
    GetKocVideoSupplement,
    AcsGetVideoTitle,
} from 'extension/popover/messenger/crmcollection';

export default function File() {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = new XLSX.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
                // 解析工作表数据
                const jsonData = [];
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber > 1) {
                        jsonData.push(row.values);
                    }
                });
                console.log('解析的数据:', jsonData);
                push(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleFileCrm = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = new XLSX.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
                // 解析工作表数据
                const jsonData = [];
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber > 1) {
                        jsonData.push(row.values);
                    }
                });
                console.log('解析的数据:', jsonData);
                UploadCrm(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleFileword = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = new XLSX.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
                // 解析工作表数据
                const jsonData = [];
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber > 1) {
                        jsonData.push(row.values);
                    }
                });
                console.log('解析的数据:', jsonData);
                GetRedskinsInfo(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleUploadKoc = () => {
        GetKocVideoData();
    };

    const handleUploadKocAmount = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = new XLSX.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
                // 解析工作表数据
                const jsonData = [];
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber > 0) {
                        jsonData.push(row.values);
                    }
                });
                GetKocVideoSupplement(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleUploadAcsGetVideoTitle = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = new XLSX.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
                // 解析工作表数据
                const jsonData = [];
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber > 0) {
                        jsonData.push(row.values);
                    }
                });
                AcsGetVideoTitle(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div>
            <h4>XLSX文件上传和解析示例</h4>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
            <div style={{ borderTop: '1px solid #ccc' }}>
                <h4>XLSX上传crm</h4>
                <input type="file" accept=".xlsx" onChange={handleFileCrm} />
            </div>
            <div style={{ borderTop: '1px solid #ccc' }}>
                <h4>上传检测词：</h4>
                <input type="file" accept=".xlsx" onChange={handleFileword} />
            </div>
            <div style={{ borderTop: '1px solid #ccc' }}>
                <h4>koc视频数据拉取</h4>
                <button onClick={handleUploadKoc}>开</button>
            </div>
            <div style={{ borderTop: '1px solid #ccc' }}>
                <h4>koc视频数据补充</h4>
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleUploadKocAmount}
                />
            </div>
            <div style={{ borderTop: '1px solid #ccc' }}>
                <h4>acs获取标题</h4>
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleUploadAcsGetVideoTitle}
                />
            </div>
        </div>
    );
}
