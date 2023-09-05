import React from 'react';
import * as XLSX from 'exceljs';

import { push } from 'extension/popover/messenger/crmcollection.js';

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

    return (
        <div>
            <h1>XLSX文件上传和解析示例</h1>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        </div>
    );
}
