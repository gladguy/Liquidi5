const icpIdlFactory = ({ IDL }) => {
    return IDL.Service({
        'addckBTCBalance': IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
        'addckBTCTransactions': IDL.Func(
            [IDL.Principal, IDL.Text],
            [IDL.Bool],
            [],
        ),
        'getCkBTC_oldest_tx_id': IDL.Func([], [IDL.Nat], ['query']),
        'getckBTCTransactions': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Vec(IDL.Text))],
            ['query'],
        ),
        'setCkBTC_oldest_tx_id': IDL.Func([IDL.Nat], [IDL.Nat], []),
    });

};

module.exports = { icpIdlFactory }