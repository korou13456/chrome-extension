import { fromUrl } from 'parse-domain';
import { parse } from 'psl';
import accounting from 'accounting';

const DECIMALS_SEPARATOR_REGEXP = /([,.\s\d]+)(\.(?:\d{1,2})|,(?:\d{1,2}))\b/;
const SPECIAL_PRICE_REGEXP = /([.,\d]+)([^.,\d]+)(\d{2})/;

export function cleanString(str) {
    let argm =
        arguments.length > 1 && undefined !== arguments[1] ? arguments[1] : '';
    return ('' + (str || '')).trim() || argm;
}

export function cleanWhiteSpace(str) {
    return ('' + (str || '')).replace(/\s/g, '');
}

export function decimalSeparator(price) {
    var matches = price.match(DECIMALS_SEPARATOR_REGEXP);
    return matches
        ? matches[2].substring(0, 1) || ','
        : !matches && price.split('.').length > 1
        ? ','
        : !matches && price.split(' ').length > 1
        ? ','
        : '.';
}

export function cleanPrice(price) {
    let cleaned = cleanString(price);
    cleaned = cleanWhiteSpace(price);
    if (SPECIAL_PRICE_REGEXP.test(cleaned)) {
        cleaned = cleaned.replace(/[.,]/, ',');
        cleaned = cleaned.replace(/[^.,\d]+/, '.');
        return Number(accounting.unformat(cleaned, decimalSeparator(cleaned)));
    }
    if (
        cleaned.length >= 3 &&
        '(' === cleaned[0] &&
        ')' === cleaned.substr(-1)
    ) {
        cleaned = '-' + cleaned.substr(1, cleaned.length - 2);
    }

    let numIndex = cleaned.search(/\d/),
        nonNumberCharacters = cleaned.substr(0, numIndex);

    cleaned = cleaned.substr(numIndex);
    if (nonNumberCharacters.includes('-')) {
        cleaned = '-' + cleaned;
    }

    if (cleaned.split('.').length > 1 && 0 == cleaned.split(',').length - 1) {
        if (!cleaned.match(DECIMALS_SEPARATOR_REGEXP)) {
            cleaned += ',00';
        }
    }

    let matches = cleaned.match(/(^-?\.?[\d+]?[,.\s\d+]+)/);
    if (matches) {
        cleaned = matches[1];
    }

    return Number(accounting.unformat(cleaned, decimalSeparator(cleaned)));
}

export function parsePrice(price) {
    const withoutWhiteSpacePrice = price.replace(/\s/g, ''),
        lettersNotLettersGroups =
            withoutWhiteSpacePrice.match(/[0-9]+|[^0-9]+/gi),
        groups = lettersNotLettersGroups.map(function (group, i) {
            return {
                text: group,
                numeral: /[0-9]+/.test(group),
                subs: i,
            };
        });
    return groups;
}

export function parseSymbol(currency = '$') {
    currency = cleanString(currency);
    currency = cleanWhiteSpace(currency);
    const CURRENCY_REGEXP = /^(.*?)(-?\d+[,.\d+]+)(.*?)$/;

    if (SPECIAL_PRICE_REGEXP.test(currency)) {
        return {
            position: 'left',
            symbol: currency.match(SPECIAL_PRICE_REGEXP)[2],
        };
    }

    let currencyMatches = CURRENCY_REGEXP.exec(currency),
        position = 'left',
        symbol = '$';

    if (currencyMatches) {
        let rightMatch = (currencyMatches[1] || '').trim(),
            leftMatch = (currencyMatches[3] || '').trim();
        if (rightMatch) {
            symbol = rightMatch;
            position = 'left';
        } else if (leftMatch) {
            symbol = leftMatch;
            position = 'right';
        }
    }
    return {
        position,
        symbol,
    };
}

export function parseDomain(url = '') {
    try {
        const parsed = parse(fromUrl(url));
        let {
            tld,
            domain = url,
            subdomain,
        } = {
            ...parsed,
        };

        domain = domain ? domain : url;
        subdomain = subdomain ? subdomain : '';
        subdomain = subdomain.replace(/^www/, '');
        subdomain = (subdomain ? subdomain + '.' : '') + domain;

        return {
            tld,
            subdomain,
            domain,
        };
    } catch (error) {
        console.log(error);
    }
    return {
        tld: '',
        subdomain: '',
        domain: '',
    };
}

export default {
    cleanPrice,
    cleanString,
    parseDomain,
    parseSymbol,
    decimalSeparator,
};
