const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const BASE_URL = 'https://backendnew.coupert.com/api-go';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});

const dev = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});
const failedData = [];

const postKocGet = () => {
    return api.post(
        '/koc_account_list',
        {
            page: {
                page_size: 300,
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

const tApi = axios.create({
    baseURL: 'https://business-api.tiktok.com',
    timeout: 30000,
});

const AccountDataGet = (open_id, access_token, cursor) => {
    return tApi.get(
        `/open_api/v1.3/business/video/list/?business_id=${open_id}&max_count=20&fields=["item_id","create_time","thumbnail_url","share_url","embed_url","caption","video_views","likes","comments","shares","reach","video_duration","full_video_watched_rate","total_time_watched","average_time_watched","impression_sources","audience_countries"]${
            cursor ? '&cursor=' + cursor : ''
        }`,
        {
            headers: {
                'Access-Token': access_token,
            },
        }
    );
};

const postKocData = async (list) => {
    const data = new FormData();
    data.append('data', JSON.stringify(list));
    try {
        const response = await dev.post('/tt_koc_collect', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data, list.length, '!--->>');
    } catch (error) {
        console.error(error);
        failedData.push(...list);
    }
};
export default async function start() {
    console.log(1231231);
    const { data } = { ...(await postKocGet()) };
    const { data: dataObj } = { ...data };
    const { list } = { ...dataObj };
    console.log(list, '!---->>>/');
    for (const item of list) {
        const { open_id, access_token } = { ...item };
        if (!(open_id && access_token)) return;
        const result = await getData(open_id, access_token, item);
        await putFun(groupArray(result));
    }
    console.log(failedData, '!---->>>');

    // // After all requests are done, save failed data to a JSON file
    // if (failedData.length > 0) {
    //     fs.writeFile('failed_data.json', JSON.stringify(failedData), (err) => {
    //         if (err) {
    //             console.error('Error writing failed data to file:', err);
    //         } else {
    //             console.log('Failed data saved to failed_data.json');
    //         }
    //     });
    // }
}

function groupArray(array) {
    const groups = [];
    for (let i = 0; i < array.length; i += 20) {
        groups.push(array.slice(i, i + 20));
    }
    return groups;
}

async function putFun(list) {
    for (let i = 0; i < list.length; i++) {
        try {
            await postKocData(list[i]);
        } catch (error) {
            console.error(error);
        }
    }
    return;
}

let arr = [];
async function getData(open_id, access_token, item, cursor) {
    const { data } = {
        ...(await AccountDataGet(open_id, access_token, cursor)),
    };
    console.log(data, '--->>');
    const { data: dataObj } = { ...data };
    const { videos, has_more, cursor: cursorac } = { ...dataObj };
    arr.push(...getAmountData(videos, item));
    if (has_more) {
        return getData(open_id, access_token, item, cursorac);
    }
    let RArr = arr;
    arr = [];
    return RArr;
}

function getAmountData(list = [], item) {
    let arr = [];
    const { name, port_id = 0, url: user_url } = { ...item };
    list.forEach((item) => {
        const {
            create_time,
            caption,
            video_views,
            share_url,
            comments,
            likes,
            shares,
        } = { ...item };
        arr.push({
            name,
            port_id,
            user_url,
            amount: video_views,
            release_time: formatDateTime(create_time),
            url: share_url.split('?')[0],
            title: caption.slice(0, 255),
            collection: 0,
            comments,
            like_num: likes,
            share_num: shares,
            domain: getDomain(caption),
            template: getTemplate(caption),
        });
    });
    return arr;
}

function formatDateTime(seconds) {
    const timestampInMilliseconds = seconds * 1000;
    const date = new Date(timestampInMilliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} 00:00:00`;
    return formattedDateTime;
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
