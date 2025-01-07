const { icpIdlFactory } = require('./ordinals.did');
const { ckBtcTransactionIdlFactory } = require('./ckBtcTransac.did');
const HttpAgent = require("@dfinity/agent").HttpAgent;
const Actor = require("@dfinity/agent").Actor;

const icpCanisterId = process.env.ICP_CANISTER_ID;
const ckBtcTransactionCanisterId = process.env.CKBTC_TRANSAC_CANISTER_ID;

const httpAgent = new HttpAgent({
    host: process.env.HTTP_AGENT_ACTOR_HOST,
})

const ICP_API = Actor.createActor(icpIdlFactory, {
    agent: httpAgent,
    canisterId: icpCanisterId
});

const ckBtc_Transac_API = Actor.createActor(ckBtcTransactionIdlFactory, {
    agent: httpAgent,
    canisterId: ckBtcTransactionCanisterId
});

module.exports = { ICP_API, ckBtc_Transac_API };