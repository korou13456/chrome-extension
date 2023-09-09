import main from '../main';
import { isEmpty } from 'lodash';

let num = -1;

let SourceArr = [];

export default async function redskins(domes = [], action) {
    switch (action) {
        case 'detection':
            // 开始获取数据
            await main('', action, domes);
            break;
        default:
            if (!isEmpty(domes)) SourceArr = domes;
            num++;
            // 输入词
            if (SourceArr.length <= num) {
                console.log('所有获取结束------------////');
                main('', 'end');
                return;
            }

            await main(SourceArr[num][1]);
            break;
    }
}
