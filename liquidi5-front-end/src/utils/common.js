import axios from "axios";
import { Principal } from "@dfinity/principal";

export const API_METHODS = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};
export const apiUrl = {
  Api_base_url: process.env.REACT_APP_ORDINALS_API,
  Coin_base_url: process.env.REACT_APP_COINBASE_API,
  Asset_server_base_url: process.env.REACT_APP_ASSET_SERVER,
  Unisat_open_api: process.env.REACT_APP_UNISAT_OPEN_API,
};

export const PLUG_WALLET_KEY = "plug";
export const XVERSE_WALLET_KEY = "xverse";
export const UNISAT_WALLET_KEY = "unisat";

export const sliceAddress = (address, slicePoint = 5) => (
  <>
    {address?.slice(0, slicePoint)}
    ...
    {address?.slice(address.length - slicePoint, address.length)}
  </>
);

export const Capitalaize = (data) => {
  if (data) {
    const words = data.split(/\s+/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  }
};

export const DateTimeConverter = (timestamps) => {
  const date = new Date(timestamps);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
  const timeStamp = strTime.split(",");

  return timeStamp;
};

// Function to format hours in 12-hour clock format

export const daysCalculator = (_timestamp = Date.now(), _daysAfter = 7) => {
  const timestamp = Number(_timestamp);

  const givenDate = new Date(timestamp);

  const resultDate = new Date(givenDate);
  resultDate.setDate(givenDate.getDate() + _daysAfter);

  const formattedResult = `${resultDate.getDate()}/${resultDate.getMonth() + 1
    }/${resultDate.getFullYear()} ${format12Hour(
      resultDate.getHours()
    )}:${formatTwoDigits(resultDate.getMinutes())}:${formatTwoDigits(
      resultDate.getSeconds()
    )} ${resultDate.getHours() >= 12 ? "pm" : "am"}`;

  return { date_time: formattedResult, timestamp: resultDate.getTime() };
};
// Function to format hours in 12-hour clock format
export const format12Hour = (hours) => {
  return hours % 12 || 12;
}

// Function to format single-digit minutes and seconds with leading zero
export const formatTwoDigits = (value) => {
  return value.toString().padStart(2, '0');
}

const to32bits = (num) => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
};

export const tokenIdentifier = (principal, index) => {
  const padding = Buffer("\x0Atid");
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(principal).toUint8Array(),
    ...to32bits(index),
  ]);
  return Principal.fromUint8Array(array).toText();
};

const toHexString = (byteArray) => {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

const from32bits = ba => {
  var value;
  for (var i = 0; i < 4; i++) {
    value = (value << 8) | ba[i];
  }
  return value;
}

export const decodeTokenId = (tid) => {
  var p = [...Principal.fromText(tid).toUint8Array()];
  var padding = p.splice(0, 4);
  if (toHexString(padding) !== toHexString(Buffer("\x0Atid"))) {
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

const isHex = (h) => {
  var regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(h);
};

export const constructUser = (u) => {
  if (isHex(u) && u.length === 64) {
    return { 'address': u };
  } else {
    return { 'principal': Principal.fromText(u) };
  };
};



