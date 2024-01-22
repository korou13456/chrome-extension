import browser from 'webextension-polyfill';
import { enterFun } from '../messenger/kocVideo';
import BrowserStorage from 'shared/browser-storage';
import axios from 'axios';
import { postKocData } from 'extension/utils/axios';
import dayjs from 'dayjs';

let data = [];
let num = 0;

const webhookUrl =
    'https://open.feishu.cn/open-apis/bot/v2/hook/da204390-7a4e-4372-9eec-33baeefe92e8';

let dataArr = [];

export default async function kocVideoFetching(action, userData, id) {
    switch (action) {
        case 'start':
            (async () => {
                const { url } = { ...userData };
                const { id } = {
                    ...(await browser.tabs.create({
                        url,
                    })),
                };
                console.log(id);
                enterFun(id);
            })();
            break;
        case 'receive': {
            console.log(userData, '!----->>');
            Integration(userData, data[num]);
            num++;
            await browser.tabs.remove(id);
            kocVideoFetching('start', data[num]);
            break;
        }
        case 'skip':
            (async () => {
                const [, , , name] = [...data[num]];
                let noName = (await BrowserStorage.local.get('no:Name')) || [];
                noName.push(name);
                BrowserStorage.local.set('no:Name', noName);
                num++;
                if (num >= data.length) {
                    return;
                }
                await browser.tabs.remove(id);
                kocVideoFetching('start', data[num]);
            })();
            break;
        default:
            console.log(userData, '!---->>');
            data = userData;
            if (Array.isArray(userData) && userData.length > 0) {
                kocVideoFetching('start', data[num]);
            }
            break;
    }
}

function isNumber(value) {
    return typeof value === 'number';
}

function parseNumberWithKAndM(input) {
    const numericPart = parseFloat(input);
    if (input.endsWith('k') || input.endsWith('K')) {
        return numericPart * 1000;
    } else if (input.endsWith('m') || input.endsWith('M')) {
        return numericPart * 1000000;
    } else {
        return numericPart * 1;
    }
}

async function Integration(arr, thisDate) {
    const { port_id, in_charge, name, user_url } = { ...thisDate };
    arr.forEach((v) => {
        const { amount, time, title, collection, comments, like_num } = {
            ...v,
        };
        dataArr.push({
            ...v,
            release_time: dayjs(new Date(time)).format('YYYY-MM-DD 00:00:00'),
            port_id: (isNumber(port_id * 1) && port_id * 1) || 0,
            amount: Math.round(parseNumberWithKAndM(String(amount))),
            in_charge,
            name,
            user_url,
            title,
            domain: getDomain(title),
            template: getTemplate(title),
            collection: Math.round(parseNumberWithKAndM(String(collection))),
            comments: Math.round(parseNumberWithKAndM(String(comments))),
            like_num: Math.round(parseNumberWithKAndM(String(like_num))),
        });
    });

    await Fun(dataArr, name);
    dataArr = [];
}

async function Fun(list = [], name = '') {
    console.log(list);
    try {
        await postKocData('/tt_koc_collect', list);
        // postKocData('/tt_koc_time_repair', list);
    } catch (error) {
        const message = {
            msg_type: 'text',
            content: {
                text: name + '数据库存入失败，已经存入本地请尽快处理',
            },
        };
        let data = (await BrowserStorage.local.get('kocList')) || [];
        data = [...data, ...list];
        await BrowserStorage.local.set('kocList', data);
        await axios.post(webhookUrl, message);
        return;
    }
    const num = list.length;
    const message = {
        msg_type: 'text',
        content: {
            text: name + '完成爬取' + num + '条，注意查看',
        },
    };
    await axios.post(webhookUrl, message);
}

function getTemplate(str) {
    const TitleTemplate = [
        '#coupert',
        '#bestcouponcode',
        '#allcouponcode',
        '#joyfulshopper',
    ];
    for (const template of TitleTemplate) {
        const regex = new RegExp(template, 'g');
        const match = str.match(regex);
        if (match && match.length > 0) {
            return match[0];
        }
    }
    return null;
}

function getDomain(str) {
    const domainArr = [
        'lookfantastic',
        'hellomolly',
        'Colorpop',
        'Lululemon',
        '2nd Swing',
        '32 degrees',
        '4partriots',
        '4patriots',
        'Abbott Lyon',
        'academy',
        'ace hardware',
        'acme tools',
        'action',
        'Adam & Eve',
        'adanola',
        'adidas',
        'ae',
        'Aeropostale',
        'air up',
        'Airbnb October hotel',
        "Al's Sports",
        'aldi foto',
        'Alibaba france',
        'aliexpress',
        'aliexpress,walmart,temu,target,express',
        'Alive By Science',
        'allbeauty',
        'Ally',
        'Altitude Sports',
        'American Eagle Outfitters',
        'American Signature Furniture',
        'anastasia',
        'Anker',
        'anthropologie',
        'ANYCUBIC',
        'ao',
        'APMEX',
        'argos',
        'ariat',
        'Aritzia',
        'Aroma360',
        'asda',
        'ASICS',
        'asos',
        'aspinal of london ar',
        'AT&T Internet',
        'att',
        'auchan',
        'autozone',
        'aveda',
        'Aventon Bikes',
        'Avid',
        'B&Q',
        'Banggood',
        'barkbox',
        'Bass Pro Shops',
        'Bath & Body',
        'Bath and body',
        'baur',
        'becker',
        'bed bath & beyond',
        'belk',
        'bergdorf',
        'Best Buy',
        'best western hotel',
        'bestcanvas',
        'BFCM Sale Predictions',
        'Big W',
        'bloomchic',
        "Bloomingdale's",
        'Bluetti',
        'Bombas',
        'Bonobos',
        'BoohooMAN',
        'boohoo',
        'boostmobile',
        'boots',
        'boozt',
        'Born Shoes',
        'Boux Avenue',
        'brooks',
        'Brylane Home',
        'BSTN Store',
        'buckle',
        'Burger King',
        'Burton Europe',
        'Buster + Punch',
        'but',
        'Buy A Gift',
        'By Charlotte',
        "Cabela's",
        'Cadbury Gifts Direct',
        'Camping World',
        'carhartt',
        'carparts',
        "carter's",
        'casetify',
        'Castlery Inc',
        'cdkeys',
        'Centauro coupon',
        'cettire',
        'Champs Sports',
        'chewy',
        'chipotle',
        'christ',
        'City Beach',
        "Claire's",
        'Clearly',
        'coach',
        'Coast',
        'Cobasi',
        'Cole Haan',
        'columbia',
        'converse',
        'cos',
        'Costco',
        'Cotopaxi',
        'cottonon',
        'cozy earth',
        'Crazy',
        'cricut',
        'crocs',
        'Cult Beauty',
        'cvs',
        'cyber',
        'debenhams',
        'dell',
        'demellier london',
        'dhgate',
        "Dick's Sporting Goods",
        'Dior',
        'Disney',
        'Dollar Tree',
        "Domino's",
        'doordash',
        'Dossier',
        'douglas',
        'DQ',
        'Dunkin Donuts',
        'DXL',
        'dyson',
        'EaseUS',
        'easyjet',
        'Eileen',
        'ELEGOO',
        'ELEMIS',
        'eneba',
        'Escentual',
        'Estee Lauder Australia',
        'ethika',
        'Europcar Australia',
        'Everlane',
        'express',
        'EyeBuyDirect',
        'fabfitfun',
        'fabletics',
        'Factor Meals',
        'Faherty coupon',
        'Famous Footwear',
        'fanatics',
        'farfetch',
        'fashion nova',
        'Fenty Beauty + Fenty Skin',
        'Ferragamo',
        'Finish Line',
        'Five Below',
        'Flight Club',
        'flowers',
        'fnac',
        'Foot Locker',
        'footasylum',
        'forever21',
        'fossil',
        'fragrancenet',
        'Francoise Saget',
        'Frankies Bikinis',
        'Free People',
        'g2a',
        'game',
        'Gamivo',
        'gap',
        'ginatricot',
        'go city',
        'Groupon',
        'gucci',
        'Guess',
        'gymshark',
        'h&m',
        'halfords',
        'hello molly',
        'hellofresh',
        'heydude',
        'Hilton',
        'hismileteeth',
        'hm',
        'Hoka',
        'holland & barrett',
        'Hot Topic',
        'Hotel',
        'houseoffraser',
        'Hulu',
        'iherb',
        'ikea',
        'ilDuomo Novara',
        'iPlace',
        'ipsy',
        'J.Crew',
        'Jaded London',
        'janie and jack',
        'JB Tools',
        'JCpenny',
        'JD',
        'JEGS',
        'JetBlue Vacations',
        "JJ's House",
        'joann',
        'Jos. A. Bank',
        'journeys',
        'Julian Fashion',
        'JW PEI',
        'Kate Spade',
        'kate-spade-surprise-non-content-rate',
        'kay',
        'Kendra Scott',
        'kfzteile24',
        'Kickz',
        "Kiehl's",
        'Kiko Milano',
        'Kingguin new balance Shein target',
        'kinguin',
        'Kiwoko Spain',
        "Kohl's",
        'L.L. Bean',
        'Lampenwelt.at',
        'Lampy',
        'Lancôme,bathandbodyworks,Aerie',
        'lastminute',
        'Lee Jeans',
        'less germany',
        'levi',
        'LG',
        'LilySilk',
        'Lonely planet',
        "Lulu's",
        'MAC',
        "macy's",
        'mailchimp',
        'Marc',
        'Marks & Spencer',
        'Marshalls',
        'matalan',
        'matchesfashion',
        'maurices',
        'MERIT',
        'Michaels',
        'microsoft',
        'Missguided',
        'Mister Spex Germany',
        'montirex',
        'moonpig',
        'Mountain Warehouse',
        'Muji',
        'my-picture',
        'myprotein',
        'na-kd',
        'Nasty Gal',
        'NBA Store',
        'nelly',
        'New Balance',
        'New Era',
        'New Look',
        'nflshop',
        'nike',
        'Nocibe France',
        'norstorm rack',
        'Notino',
        'O2',
        'Ocado',
        'office',
        'official revice',
        'Onitsuka Tiger',
        'RONLINE',
        'PacSun',
        'Pandora',
        'Paramount+',
        'Parfum parfumdreams',
        'Patagonia',
        'peacocks',
        'personalizationmall',
        'petco',
        'Pets at',
        'petsmart',
        'photobox',
        'Pizza Hut',
        'Pollin Electronic',
        'Pottery Barn',
        'Premier Inn',
        'prettylittlething',
        'priceline',
        'Princess Polly',
        'printerpix',
        'Pro-Direct Sport',
        'Pull & Bear',
        'Rack Room Shoes',
        'Reebok',
        'Regatta UK',
        'Renner',
        'Revice',
        'revolve',
        'Rituals',
        'River Island',
        "Roaman's",
        'Roman Originals',
        'Saks Fifth Avenue',
        'saksoff5th',
        'Sally Beauty',
        "Sam's",
        'samsung',
        'SATURN',
        'scheels',
        'Schuh',
        'See Tickets',
        'sephora',
        'shein',
        'shoe carnival',
        'SHOP APOTHEKE',
        'shopdisney',
        'Shopify Pay',
        'shutterfly',
        'SiriusXM',
        'skechers',
        'skims',
        'sky',
        'Smartbox',
        'Sol de Janeiro',
        'soma',
        'Stanley',
        'Stuart Weitzman',
        'stubhub',
        'SuperDry',
        'swarovski',
        't-mobile',
        'Tactical Series',
        'target',
        'tarte',
        'Tchibo',
        'temu',
        'Thalia',
        'The Body Shop',
        "The Children's Place",
        'The Entertainer',
        'The Fragrance Shop',
        'The North Face',
        'The Works',
        'three',
        'ticketmaster',
        'tiqets',
        'tommy',
        'tonies',
        'Too Faced',
        'toolstation',
        'Tractor Supply',
        'tradeinn',
        'Trainline',
        'Tripadvisor',
        'True Religion',
        'ugg',
        'ulta',
        'Under Armour',
        'uniqlo',
        'Urban Outfitters',
        'Verizon',
        'very',
        'vestiairecollective',
        'VEVOR',
        'Viator',
        'victoria secret',
        "Victoria's Secret",
        'vistaprint',
        'Vivid Seats',
        'walgreen',
        'walgreens',
        'walmart',
        "Wendy's",
        'wish',
        'woot',
        'Wowcher',
        'xfinity',
        'yesstyle',
        'yeti',
        'Yours Clothing',
        'zales',
        'zazzle',
        'Zenni Optical',
        'zoro',
        'Kylie Cosmetics',
        "Cater's",
        'forloveandlemons',
    ];
    for (const domain of domainArr) {
        const regex = new RegExp(`\\b${domain}\\b`, 'gi');
        const match = str.match(regex);

        if (match && match.length > 0) {
            return domain;
        }
    }

    return null;
}
