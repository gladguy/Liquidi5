const { getCrc32 } = require("@dfinity/principal/lib/esm/utils/getCrc");
const { sha224 } = require("@dfinity/principal/lib/esm/utils/sha224");
const { Principal } = require("@dfinity/principal");
const { Buffer } = require('buffer'); // Import Buffer module

const getSubAccountArray = (s) => {
    if (Array.isArray(s)) {
        return s.concat(Array(32 - s.length).fill(0));
    } else {
        //32 bit number only
        return Array(28)
            .fill(0)
            .concat(to32bits(s ? s : 0));
    }
};
/***************************************************************************/

const toHexString = (byteArray) => {
    return Array.from(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
};
/***************************************************************************/
const to32bits = (num) => {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
};
/***************************************************************************/

const principalToAccountIdentifier = (_p, _s) => {
    const padding = Buffer.from("\x0Aaccount-id");
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(_p).toUint8Array(),
        ...getSubAccountArray(_s),
    ]);
    const hash = new sha224(array);
    const checksum = to32bits(getCrc32(hash));
    const array2 = new Uint8Array([...checksum, ...hash]);
    return toHexString(array2);
};

const tokenIdentifier = (principal, index) => {
    const padding = Buffer.from("\x0Atid");
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(principal).toUint8Array(),
        ...to32bits(index),
    ]);
    return Principal.fromUint8Array(array).toText();
};

const from32bits = ba => {
    var value;
    for (var i = 0; i < 4; i++) {
        value = (value << 8) | ba[i];
    }
    return value;
}

const decodeTokenId = (tid) => {
    var p = [...Principal.fromText(tid).toUint8Array()];
    var padding = p.splice(0, 4);
    if (toHexString(padding) !== toHexString(Buffer.from("\x0Atid"))) {
        return {
            index: 0,
            canister: tid,
            token: tokenIdentifier(tid, 0)
        };
    } else {
        return {
            index: from32bits(p.splice(-4)),
            canister: Principal.fromUint8Array(p).toText(),
            token: tid
        };
    }
};

const JSON_Converter = (_brokedData) => {
    const stringified = JSON.stringify(_brokedData, (key, value) => {
        if (typeof value === 'bigint') {
            return Number(value);
        }
        return value;
    });

    return JSON.parse(stringified)
}

module.exports = { principalToAccountIdentifier, decodeTokenId, JSON_Converter, tokenIdentifier }