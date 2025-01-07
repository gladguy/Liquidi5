import axios from "axios";
import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/esm/utils/getCrc";
import { sha224 } from "@dfinity/principal/lib/esm/utils/sha224";
import { lazy } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";

export const API_METHODS = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};
export const apiUrl = {
  Asset_server_base_url: process.env.REACT_APP_ASSET_SERVER,
};

export const PLUG_WALLET_KEY = "plug";
export const STOIC_WALLET_KEY = "stoic";
export const TELEGRAM = process.env.REACT_APP_TELEGRAM;
export const MAILTO = process.env.REACT_APP_MAILTO;
export const TWITTER = process.env.REACT_APP_TWITTER;
export const DISCORD = process.env.REACT_APP_DISCORD;
export const icpCanisterId = process.env.REACT_APP_ICP_CANISTER_ID;
export const ckBtcCanisterId = process.env.REACT_APP_BTC_CANISTER_ID;
export const icpAccountId = process.env.REACT_APP_ICP_AC_ID;

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

export const getUniqueRandomNumbers = (length) => {
  // Create an array with numbers from 0 to the given length
  const numbers = Array.from({ length }, (_, i) => i);

  // Shuffle the array
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Return the first three numbers from the shuffled array
  return numbers.slice(0, 3);
}

export const DateTimeConverter = (timestamps) => {
  const date = new Date(timestamps);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
  const timeStamp = strTime.split(",");

  return timeStamp;
};

export const convertTimestampToDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

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
  const firstSpaceIndex = formattedResult.indexOf(' ');

  const firstPart = formattedResult.substring(0, firstSpaceIndex);
  const secondPart = formattedResult.substring(firstSpaceIndex + 1);
  return { date_time: [firstPart, secondPart], timestamp: resultDate.getTime(), dateTimeString: `${firstPart}, ${secondPart}` };
};
// Function to format hours in 12-hour clock format
export const format12Hour = (hours) => {
  return hours % 12 || 12;
}

// Function to format single-digit minutes and seconds with leading zero
export const formatTwoDigits = (value) => {
  return value.toString().padStart(2, '0');
}

// Getting time ago statement
// export const getTimeAgo = (timestamp) => {
//   const now = new Date(); // Current date and time
//   const diff = now.getTime() - timestamp; // Difference in milliseconds

//   // Convert milliseconds to seconds
//   const seconds = Math.floor(diff / 1000);

//   // Calculate time difference in various units
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);
//   const months = Math.floor(days / 30);
//   const years = Math.floor(months / 12);

//   // Determine appropriate phrase based on time difference
//   if (seconds < 60) {
//     return "Just now";
//   } else if (minutes < 60) {
//     return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
//   } else if (hours < 24) {
//     return `${hours} hour${hours === 1 ? '' : 's'} ago`;
//   } else if (days < 30) {
//     return `${days} day${days === 1 ? '' : 's'} ago`;
//   } else if (months < 12) {
//     return `${months} month${months === 1 ? '' : 's'} ago`;
//   } else {
//     return `${years} year${years === 1 ? '' : 's'} ago`;
//   }
// }

// Getting time ago statement
export const getTimeAgo = (timestamp) => {
  const now = new Date(); // Current date and time
  const past = new Date(timestamp); // Date from timestamp

  // Calculate the difference in total milliseconds
  const diff = now.getTime() - past.getTime();

  // Convert milliseconds to seconds
  const seconds = Math.floor(diff / 1000);

  // Calculate time difference in various units
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Calculate the number of months and remaining days
  let months = now.getMonth() - past.getMonth() + (12 * (now.getFullYear() - past.getFullYear()));
  let remainingDays = now.getDate() - past.getDate();

  if (remainingDays < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month
    remainingDays += previousMonth.getDate();
  }

  const years = Math.floor(months / 12);
  months %= 12;

  // Determine appropriate phrase based on time difference
  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (years > 0) {
    return `${years} year${years === 1 ? '' : 's'}${months > 0 ? `, ${months} month${months === 1 ? '' : 's'}` : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays === 1 ? '' : 's'}` : ''} ago`;
  } else {
    return `${months} month${months === 1 ? '' : 's'}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays === 1 ? '' : 's'}` : ''} ago`;
  }
}

export const getRemainingTime = (timestamp) => {
  const now = new Date(); // Current date and time
  const futureDate = new Date(timestamp); // Future date from timestamp

  const diff = futureDate.getTime() - now.getTime(); // Difference in milliseconds

  // Check if the timestamp is in the future
  if (diff <= 0) {
    return 'The loan period has expired.';
  }

  // Convert milliseconds to days and hours
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const millisecondsInAnHour = 60 * 60 * 1000;

  const days = Math.floor(diff / millisecondsInADay);
  const hours = Math.floor((diff % millisecondsInADay) / millisecondsInAnHour);

  return `${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
}

/***************************************************************************/

export const principalToAccountIdentifier = (p, s) => {
  const padding = Buffer("\x0Aaccount-id");
  const array = new Uint8Array([
    ...padding,
    ...Principal.fromText(p).toUint8Array(),
    ...getSubAccountArray(s),
  ]);
  const hash = new sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([...checksum, ...hash]);
  return toHexString(array2);
};
/***************************************************************************/

export const getSubAccountArray = (s) => {
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

export const icpAgentCreator = async (apiFactory, canisterId) => {
  const agent = await window.ic?.plug.createActor({
    canisterId,
    interfaceFactory: apiFactory,
  });
  return agent;
};

export const agentCreator = (apiFactory, canisterId) => {
  const agent = new HttpAgent({
    host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
  });
  const API = Actor.createActor(apiFactory, {
    agent,
    canisterId,
  });
  return API;
};

// eg randomNumberGenerator(o, 10); will return random number between 0 to 9.
export const randomNumberGenerator = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

export const calculateAPY = (interestRate, numberOfDays, toFixed = 2) => {
  const rateDecimal = interestRate / 100;
  const apy = Math.pow(1 + rateDecimal, 365 / numberOfDays) - 1;
  const apyPercentage = apy * 100;

  return apyPercentage.toFixed(toFixed);
}

export const calculateDailyInterestRate = (annualInterestRate, toFixed = 2) => {
  const rateDecimal = annualInterestRate / 100;
  const dailyInterestRate = rateDecimal / 365;
  const dailyInterestRatePercentage = dailyInterestRate * 100;

  return dailyInterestRatePercentage.toFixed(toFixed); // Return daily interest rate rounded to 5 decimal places
}

export const Pages = [
  {
    name: "Home",
    path: "/",
    component: lazy(() => import("../pages/home")),
  },
  {
    name: "borrow",
    path: "/borrow",
    component: lazy(() => import("../pages/borrow")),
  },
  {
    name: "Lend",
    path: "/lend",
    component: lazy(() => import("../pages/lend")),
  },
  {
    name: "dashboard",
    path: "/dashboard",
    component: lazy(() => import("../pages/dashboard")),
  },
  {
    name: "portfolio",
    path: "/portfolio",
    component: lazy(() => import("../pages/portfolio")),
  },
  {
    name: "analytics",
    path: "/analytics",
    component: lazy(() => import("../pages/analytics")),
  },
]

export const ApprovedCollections = [
  {
    collectionName: "Motoko Ghost",
    canisterId: "oeee4-qaaaa-aaaak-qaaeq-cai",
  },
  {
    collectionName: "IC Kitties",
    canisterId: "rw7qm-eiaaa-aaaak-aaiqq-cai",
  },
  {
    collectionName: "Pineapple Punks",
    canisterId: "skjpp-haaaa-aaaae-qac7q-cai",
  },
  {
    collectionName: "Poked Bots",
    canisterId: "bzsui-sqaaa-aaaah-qce2a-cai",
  },
  {
    collectionName: "Boxy",
    canisterId: "s36wu-5qaaa-aaaah-qcyzq-cai",
  },
  {
    collectionName: "Boxy Girl",
    canisterId: "cchps-gaaaa-aaaak-qasaa-cai",
  },
  {
    collectionName: "Good Guy",
    canisterId: "h4gro-4aaaa-aaaag-qczsq-cai",
  },
];

export const tellMeCanisterName = (key) => {
  switch (key) {
    case "oeee4-qaaaa-aaaak-qaaeq-cai":
      return "Motoko Ghost";

    case "rw7qm-eiaaa-aaaak-aaiqq-cai":
      return "IC Kittis";

    case "skjpp-haaaa-aaaae-qac7q-cai":
      return "Pine Apple";

    case "bzsui-sqaaa-aaaah-qce2a-cai":
      return "Poked Bots";

    case "s36wu-5qaaa-aaaah-qcyzq-cai":
      return "Boxy";

    case "cchps-gaaaa-aaaak-qasaa-cai":
      return "Boxy Girl";

    case "h4gro-4aaaa-aaaag-qczsq-cai":
      return "Good Guy";

    default:
      return "";
  }
};