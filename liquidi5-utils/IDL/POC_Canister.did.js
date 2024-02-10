const PocIdlFactory = ({ IDL }) => {
    const NFT_details = IDL.Record({
        'token_id': IDL.Nat,
        'mime_type': IDL.Text,
        'collection_name': IDL.Text,
        'canister': IDL.Principal,
        'token_hash': IDL.Text,
        'owner_account_id': IDL.Text,
    });
    const NFT_Information = IDL.Record({
        'token_id': IDL.Nat,
        'mime_type': IDL.Text,
        'collection_name': IDL.Text,
        'canister': IDL.Principal,
        'token_hash': IDL.Text,
        'owner_account_id': IDL.Text,
    });
    const BorrowRequest = IDL.Record({
        'account_id': IDL.Text,
        'token_id': IDL.Text,
        'token_details': NFT_Information,
    });
    const AccountIdentifier__1 = IDL.Text;
    const User = IDL.Variant({
        'principal': IDL.Principal,
        'address': AccountIdentifier__1,
    });
    const TokenIdentifier = IDL.Text;
    const Memo = IDL.Vec(IDL.Nat8);
    const SubAccount = IDL.Vec(IDL.Nat8);
    const Balance = IDL.Nat;
    const TransferRequest = IDL.Record({
        'to': User,
        'token': TokenIdentifier,
        'notify': IDL.Bool,
        'from': User,
        'memo': Memo,
        'subaccount': IDL.Opt(SubAccount),
        'amount': Balance,
    });
    const Time = IDL.Int;
    const TransferredRequest = IDL.Record({
        'to': User,
        'token': TokenIdentifier,
        'notify': IDL.Bool,
        'from': User,
        'memo': Memo,
        'subaccount': IDL.Opt(SubAccount),
        'timestamp': Time,
        'amount': Balance,
    });
    const LendData__1 = IDL.Record({
        'nft': NFT_Information,
        'transaction_id': IDL.Text,
        'loan_amount': IDL.Nat,
        'lender_account_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Nat64,
        'repayment_amount': IDL.Nat,
    });
    const LendData = IDL.Record({
        'nft': NFT_Information,
        'transaction_id': IDL.Text,
        'loan_amount': IDL.Nat,
        'lender_account_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Nat64,
        'repayment_amount': IDL.Nat,
    });
    const RepaymentData = IDL.Record({
        'lenddata': LendData,
        'repayment_transaction_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Nat64,
        'repayment_amount': IDL.Nat,
        'token_hash': IDL.Text,
    });
    const TransferResponse = IDL.Variant({
        'ok': Balance,
        'err': IDL.Variant({
            'CannotNotify': AccountIdentifier__1,
            'InsufficientBalance': IDL.Null,
            'InvalidToken': TokenIdentifier,
            'Rejected': IDL.Null,
            'Unauthorized': AccountIdentifier__1,
            'Other': IDL.Text,
        }),
    });
    return IDL.Service({
        'acceptCycles': IDL.Func([], [], []),
        'addWalletAssets': IDL.Func([IDL.Text, NFT_details], [IDL.Bool], []),
        'availableCycles': IDL.Func([], [IDL.Nat], ['query']),
        'getAllActiveLendings': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
            ['query'],
        ),
        'getAllAskRequests': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, BorrowRequest))],
            ['query'],
        ),
        'getAllTransactions': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(TransferRequest)))],
            [],
        ),
        'getAskRequest': IDL.Func([IDL.Text], [IDL.Vec(BorrowRequest)], ['query']),
        'getCallerPrincipal': IDL.Func([], [IDL.Principal], []),
        'getTransactions': IDL.Func([IDL.Text], [IDL.Vec(TransferredRequest)], []),
        'getUserLending': IDL.Func([IDL.Text], [IDL.Vec(LendData__1)], ['query']),
        'getWalletAssets': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Vec(NFT_details))],
            ['query'],
        ),
        'setActiveLending': IDL.Func([IDL.Text, LendData__1], [IDL.Bool], []),
        'setAskRequest': IDL.Func(
            [IDL.Text, IDL.Text, NFT_details],
            [IDL.Bool],
            [],
        ),
        'setPauseRequest': IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
        'setRepayment': IDL.Func([IDL.Text, RepaymentData], [IDL.Bool], []),
        'setTransaction': IDL.Func([IDL.Text, TransferredRequest], [IDL.Bool], []),
        'wallet_receive': IDL.Func(
            [],
            [IDL.Record({ 'accepted': IDL.Nat64 })],
            [],
        ),
        'withDrawAsset': IDL.Func(
            [IDL.Text, TransferRequest],
            [TransferResponse],
            [],
        ),
    });
};

module.exports = { PocIdlFactory }