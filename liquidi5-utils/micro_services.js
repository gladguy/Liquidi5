require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { ICP_API, ckBtc_Transac_API } = require('./IDL/agent');
const { Principal } = require('@dfinity/principal');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const icp_canister_id = process.env.ICP_CANISTER_ID

// Home Router
app.get('/', (req, res, next) => {
    res.send(`<pre style="color:white; background-color:black">
       Liquidify Transaction Server
    </pre>`);
})

const arrayConstructor = (_array, _oldTxId) => {
    let shallGoAhead = true;
    let arr_ = [];
    _array.forEach((payment) => {
        const transDetails = payment.transaction.transfer[0];
        const { transfer, ...remainingDetails } = payment.transaction;
        const { from, to, amount } = transDetails;
        if (payment.id === _oldTxId) {
            shallGoAhead = false
        }
        if (payment.id !== _oldTxId && shallGoAhead) {
            arr_.push({
                from,
                to,
                amount,
                transaction: {
                    ...transDetails,
                    ...remainingDetails
                }
            })
        }
    })
    return arr_;
}

// ckBTC transactions
const getCkBtcTransactions = async () => {

    try {
        const getOldTxId = await ICP_API.getCkBTC_oldest_tx_id();
        const transactionArg = {
            max_results: 100,
            account: {
                owner: Principal.fromText(icp_canister_id),
                subaccount: [],
            },
            start: []
        }

        const ckBTCData = await ckBtc_Transac_API.get_account_transactions(transactionArg);
        await ICP_API.setCkBTC_oldest_tx_id(ckBTCData.Ok.transactions[0].id);

        const ckBTCtrans = arrayConstructor(ckBTCData.Ok.transactions, getOldTxId);
        const ckBtcTransactions = ckBTCtrans.map(async (trans) => {
            try {
                let _from = trans.from;
                let balanceRes;
                if (trans.from.owner.toText() === icp_canister_id) {
                    // Changing the canister id to user's plug address
                    _from = trans.to;
                } else {
                    // No need to add balance for withdrawl
                    balanceRes = await ICP_API.addckBTCBalance(_from.owner, trans.amount);
                }

                const transRes = await ICP_API.addckBTCTransactions(_from.owner, JSON.stringify(trans.transaction, (key, value) => {
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }));
                return { transRes, balanceRes };
            } catch (error) {
                console.log("Add Transaction Error", error);
            }
        })
        const result = await Promise.all(ckBtcTransactions);
        console.log("Btc result", result);
    } catch (error) {
        console.log("error", error);
    }
}

setInterval(() => {
    getCkBtcTransactions();
}, [process.env.TRANSACTIONS_FETCH_INTERVAL])
getCkBtcTransactions();

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