require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const { agentCreator } = require("./IDL/agent");
const { headIdlFactory } = require('./IDL/HeadCanister.did');
const { PocIdlFactory } = require('./IDL/POC_Canister.did');
const { principalToAccountIdentifier, decodeTokenId, JSON_Converter, tokenIdentifier } = require('./utils');
// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// console.log(tokenIdentifier("h4gro-4aaaa-aaaag-qczsq-cai", 1752));
console.log(decodeTokenId("bx2ja-2ykor-uwiaa-aaaaa-b4awg-maqca-aaede-a"));
// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; font-size:large; background-color:black;">
    Hello there, Welcome to POC server of My Ordinals Loan!!!                                                                                                      
    </pre>`);
})

const ApprovedCollections = [
    {
        collectionName: "Motoko Ghost",
        canisterId: "oeee4-qaaaa-aaaak-qaaeq-cai",
    },
    {
        collectionName: "BTC Flower",
        canisterId: "pk6rk-6aaaa-aaaae-qaazq-cai",
    },
    {
        collectionName: "IC Kittis",
        canisterId: "rw7qm-eiaaa-aaaak-aaiqq-cai",
    },
    {
        collectionName: "Pine Apple",
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

const PocCanisterId = process.env.ICP_POC_CANISTER_ID;
const PocCanisterAccId = principalToAccountIdentifier(PocCanisterId, 0);
console.log("PocCanisterAccId", PocCanisterAccId);
// http://localhost:4040/api/v1/fetchUserTokens/73ed2ed6edada3089aed042b72343f3ec16d114f00a1fa2015497098bb860409

app.get('/api/v1/fetchUserTokens/:userAccountId', async (req, res, next) => {
    const { userAccountId } = req.params;
    console.log("userAccountId", userAccountId);

    // ------------------------------------------------------------------------------------

    const POC_Canister_API = agentCreator(PocCanisterId, PocIdlFactory);
    const transferedTokens = await POC_Canister_API.getTransactions(userAccountId);

    const transferedJSON = JSON_Converter(transferedTokens);

    // ------------------------------------------------------------------------------------

    const transactions = ApprovedCollections.map(async (canister) => {
        return new Promise(async (res, rej) => {
            const Head_Canister_API = agentCreator(canister.canisterId, headIdlFactory);
            const canisterTokens = await Head_Canister_API.tokens(PocCanisterAccId);

            if (canisterTokens.ok) {
                res({
                    success: true,
                    ...canister,
                    tokens: canisterTokens.ok
                });
            } else {
                res({
                    ...canister,
                    success: false
                });
            }
        })
    })

    const promises = await Promise.all(transactions);

    const jsonString = JSON_Converter(promises).filter(canister => canister.success).map(canister => Object.values(canister.tokens));

    const tokenArray = jsonString.flat();

    const finalresult = transferedJSON.filter(asset => tokenArray.includes(decodeTokenId(asset.token).index))

    res.status(200).send({
        success: true,
        message: "Fetched user tokens",
        data: finalresult
    })
})

// Error handler
app.use((req, res, next) => {
    const err = new Error('not found');
    err.status = 404;
    next(err)
})

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        success: false,
        status: err.status || 500,
        message: err.message
    })
})

app.listen(process.env.APP_PORT, () => {
    console.log(`Running on PORT ${process.env.APP_PORT}`);
})