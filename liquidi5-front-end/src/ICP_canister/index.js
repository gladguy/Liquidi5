export const ICP_IdlFactory = ({ IDL }) => {
    const ApprovedCollection = IDL.Record({
        'websiteLink': IDL.Text,
        'terms': IDL.Nat,
        'thumbnailURI': IDL.Text,
        'contentType': IDL.Text,
        'collectionID': IDL.Nat,
        'twitterLink': IDL.Text,
        'collectionURI': IDL.Text,
        'description': IDL.Text,
        'marketplaceLink': IDL.Text,
        'yield': IDL.Float64,
        'canisterID': IDL.Principal,
        'collectionName': IDL.Text,
    });
    const CollateralTransfer = IDL.Record({
        'collectionID': IDL.Nat,
        'borrowerPrincipal': IDL.Principal,
        'borrowerAccountID': IDL.Text,
        'offerID': IDL.Nat,
        'token_hash': IDL.Text,
        'token_number': IDL.Nat,
        'canisterID': IDL.Principal,
    });
    const CollectionOffers = IDL.Record({
        'loanToValue': IDL.Float64,
        'terms': IDL.Nat,
        'loanAmount': IDL.Nat,
        'collectionID': IDL.Nat,
        'platformFee': IDL.Nat,
        'ckTransactionID': IDL.Text,
        'loanFiatValue': IDL.Nat,
        'loanTime': IDL.Int,
        'lender_account_id': IDL.Text,
        'yieldRate': IDL.Nat,
        'yieldAccured': IDL.Nat,
        'lender': IDL.Principal,
        'repayment_amount': IDL.Nat,
        'floorValue': IDL.Float64,
        'offerID': IDL.Nat,
        'offerStatus': IDL.Bool,
    });
    const Account__1 = IDL.Record({
        'owner': IDL.Principal,
        'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    });
    const Burn = IDL.Record({
        'from': Account__1,
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
        'spender': IDL.Opt(Account__1),
    });
    const Mint = IDL.Record({
        'to': Account__1,
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
    });
    const Approve = IDL.Record({
        'fee': IDL.Opt(IDL.Nat),
        'from': Account__1,
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
        'expected_allowance': IDL.Opt(IDL.Nat),
        'expires_at': IDL.Opt(IDL.Nat64),
        'spender': Account__1,
    });
    const Transfer = IDL.Record({
        'to': Account__1,
        'fee': IDL.Opt(IDL.Nat),
        'from': Account__1,
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
        'spender': IDL.Opt(Account__1),
    });
    const Transaction = IDL.Record({
        'burn': IDL.Opt(Burn),
        'kind': IDL.Text,
        'mint': IDL.Opt(Mint),
        'approve': IDL.Opt(Approve),
        'timestamp': IDL.Int,
        'transfer': IDL.Opt(Transfer),
    });
    const GetBlocksRequest = IDL.Record({
        'start': IDL.Nat,
        'length': IDL.Nat,
    });
    const TransactionRange = IDL.Record({
        'transactions': IDL.Vec(Transaction),
    });
    const ArchivedRange_1 = IDL.Record({
        'callback': IDL.Func([GetBlocksRequest], [TransactionRange], ['query']),
        'start': IDL.Nat,
        'length': IDL.Nat,
    });
    const GetTransactionsResponse = IDL.Record({
        'first_index': IDL.Nat,
        'log_length': IDL.Nat,
        'transactions': IDL.Vec(Transaction),
        'archived_transactions': IDL.Vec(ArchivedRange_1),
    });
    const OfferManager = IDL.Record({
        'collectionID': IDL.Nat,
        'lenderPrincipal': IDL.Principal,
        'lenderAccountID': IDL.Text,
        'offerID': IDL.Nat,
    });
    const NFT_Information = IDL.Record({
        'mime_type': IDL.Text,
        'collection_name': IDL.Text,
        'canister': IDL.Principal,
        'owner_principal': IDL.Principal,
        'token_hash': IDL.Text,
        'owner_account_id': IDL.Text,
        'token_number': IDL.Nat,
    });
    const LentData = IDL.Record({
        'nft': NFT_Information,
        'transaction_id': IDL.Text,
        'loan_amount': IDL.Nat,
        'lender_account_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Int,
        'repayment_amount': IDL.Nat,
        'offerID': IDL.Nat,
    });
    const ForeClosureData = IDL.Record({
        'lendData': LentData,
        'lender': IDL.Principal,
    });
    const Balance = IDL.Nat;
    const AccountIdentifier = IDL.Text;
    const TokenIdentifier = IDL.Text;
    const TransferResponse = IDL.Variant({
        'ok': Balance,
        'err': IDL.Variant({
            'CannotNotify': AccountIdentifier,
            'InsufficientBalance': IDL.Null,
            'InvalidToken': TokenIdentifier,
            'Rejected': IDL.Null,
            'Unauthorized': AccountIdentifier,
            'Other': IDL.Text,
        }),
    });
    const BorrowRequest = IDL.Record({
        'account_id': IDL.Text,
        'token_id': IDL.Text,
        'token_details': NFT_Information,
    });
    const User__1 = IDL.Variant({
        'principal': IDL.Principal,
        'address': AccountIdentifier,
    });
    const Memo__1 = IDL.Vec(IDL.Nat8);
    const SubAccount__1 = IDL.Vec(IDL.Nat8);
    const TransferRequest = IDL.Record({
        'to': User__1,
        'token': TokenIdentifier,
        'notify': IDL.Bool,
        'from': User__1,
        'memo': Memo__1,
        'subaccount': IDL.Opt(SubAccount__1),
        'amount': Balance,
    });
    const Time = IDL.Int;
    const HistoryData = IDL.Record({
        'lendData': LentData,
        'timestamp': Time,
        'details': IDL.Text,
        'receiver': IDL.Principal,
        'paid_transaction_id': IDL.Nat,
    });
    const AccountIdentifier__1 = IDL.Text;
    const User = IDL.Variant({
        'principal': IDL.Principal,
        'address': AccountIdentifier__1,
    });
    const TokenIdentifier__1 = IDL.Text;
    const Memo = IDL.Vec(IDL.Nat8);
    const SubAccount = IDL.Vec(IDL.Nat8);
    const Balance__1 = IDL.Nat;
    const TransferredRequest = IDL.Record({
        'to': User,
        'token': TokenIdentifier__1,
        'notify': IDL.Bool,
        'from': User,
        'memo': Memo,
        'subaccount': IDL.Opt(SubAccount),
        'timestamp': Time,
        'amount': Balance__1,
    });
    const UserPortfolio = IDL.Record({
        'user': IDL.Principal,
        'activeLendings': IDL.Nat,
        'borrowValue': IDL.Float64,
        'completedLoans': IDL.Nat,
        'profitEarned': IDL.Float64,
        'registeredTime': IDL.Int,
        'lendingValue': IDL.Float64,
        'activeBorrows': IDL.Nat,
    });
    const NFT_details = IDL.Record({
        'mime_type': IDL.Text,
        'collection_name': IDL.Text,
        'canister': IDL.Principal,
        'owner_principal': IDL.Principal,
        'token_hash': IDL.Text,
        'owner_account_id': IDL.Text,
        'token_number': IDL.Nat,
    });
    const Account = IDL.Record({
        'owner': IDL.Principal,
        'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    });
    const TransferredLendAmount__1 = IDL.Record({
        'to': Account,
        'fee': IDL.Opt(IDL.Nat),
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'timestamp': Time,
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
    });
    const LentData__1 = IDL.Record({
        'nft': NFT_Information,
        'transaction_id': IDL.Text,
        'loan_amount': IDL.Nat,
        'lender_account_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Int,
        'repayment_amount': IDL.Nat,
        'offerID': IDL.Nat,
    });
    const RepaymentData = IDL.Record({
        'transferRequest': TransferredLendAmount__1,
        'lenddata': LentData__1,
        'repayment_transaction_id': IDL.Text,
        'borrower_account_id': IDL.Text,
        'timestamp': IDL.Nat64,
        'repayment_amount': IDL.Nat,
        'token_hash': IDL.Text,
    });
    const TransferredLendAmount = IDL.Record({
        'to': Account,
        'fee': IDL.Opt(IDL.Nat),
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'timestamp': Time,
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat,
    });
    const LoanSettlementData = IDL.Record({
        'transaction_id': IDL.Nat,
        'lendData': LentData,
        'paid_amount': IDL.Nat,
        'borrower': IDL.Principal,
        'paid_to': IDL.Principal,
        'transfer_time': IDL.Nat64,
        'paid_from': IDL.Principal,
    });
    const WithAssetRequest = IDL.Record({
        'account_id': IDL.Text,
        'assetCanister': IDL.Text,
        'token_hash': IDL.Text,
    });
    return IDL.Service({
        'acceptCycles': IDL.Func([], [], []),
        'addApprovedCollections': IDL.Func([ApprovedCollection], [IDL.Bool], []),
        'addCollateralTransfer': IDL.Func([CollateralTransfer], [IDL.Bool], []),
        'addPointsWithMultiplier': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'addckBTCBalance': IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
        'addckBTCTransactions': IDL.Func(
            [IDL.Principal, IDL.Text],
            [IDL.Bool],
            [],
        ),
        'addloanOffer': IDL.Func([CollectionOffers, IDL.Nat], [IDL.Bool], []),
        'availableCycles': IDL.Func([], [IDL.Nat], ['query']),
        'canister_admin': IDL.Func([], [IDL.Principal], ['query']),
        'checkWithdraw': IDL.Func([IDL.Text], [IDL.Principal], []),
        'ckBTCBalance': IDL.Func([], [IDL.Nat], []),
        'ckBTCTransactions': IDL.Func([IDL.Nat], [GetTransactionsResponse], []),
        'deleteOffer': IDL.Func([OfferManager], [IDL.Bool], []),
        'foreclosure': IDL.Func([ForeClosureData], [TransferResponse], []),
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
        'getAllBorrows': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(LentData)))],
            ['query'],
        ),
        'getAllLent': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(LentData)))],
            ['query'],
        ),
        'getAllTransactions': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(TransferRequest)))],
            ['query'],
        ),
        'getApprovedCollections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, ApprovedCollection))],
            ['query'],
        ),
        'getAskRequest': IDL.Func([IDL.Text], [IDL.Vec(BorrowRequest)], ['query']),
        'getCkBTC_oldest_tx_id': IDL.Func([], [IDL.Nat], ['query']),
        'getCollateral': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Principal, CollateralTransfer))],
            ['query'],
        ),
        'getDebug': IDL.Func([], [IDL.Text], ['query']),
        'getHistory': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(HistoryData)))],
            ['query'],
        ),
        'getLoanOffersByLender': IDL.Func(
            [IDL.Principal],
            [IDL.Vec(CollectionOffers)],
            ['query'],
        ),
        'getMaxLoanAmounts': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, CollectionOffers))],
            ['query'],
        ),
        'getOffer': IDL.Func([IDL.Nat], [IDL.Vec(CollectionOffers)], ['query']),
        'getOffers': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Vec(CollectionOffers)))],
            ['query'],
        ),
        'getPoints': IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], []),
        'getTokenHistory': IDL.Func([IDL.Text], [IDL.Vec(HistoryData)], ['query']),
        'getTransactions': IDL.Func([IDL.Text], [IDL.Vec(TransferredRequest)], []),
        'getUserBorrows': IDL.Func([IDL.Text], [IDL.Vec(LentData)], ['query']),
        'getUserData': IDL.Func([IDL.Principal], [UserPortfolio], ['query']),
        'getUserLent': IDL.Func([IDL.Text], [IDL.Vec(LentData)], ['query']),
        'getUserOffers': IDL.Func(
            [IDL.Principal],
            [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(CollectionOffers)))],
            ['query'],
        ),
        'getckBTCAmount': IDL.Func([], [IDL.Nat], []),
        'getckBTCBalance': IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
        'getckBTCTransactions': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Vec(IDL.Text))],
            ['query'],
        ),
        'redeemPoints': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'removeApprovedCollections': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'resetDebug': IDL.Func([], [IDL.Text], []),
        'setAskRequest': IDL.Func(
            [IDL.Text, IDL.Text, NFT_details],
            [IDL.Bool],
            [],
        ),
        'setCkBTC_oldest_tx_id': IDL.Func([IDL.Nat], [IDL.Nat], []),
        'setPauseRequest': IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
        'setRepayment': IDL.Func([IDL.Text, RepaymentData], [IDL.Bool], []),
        'setRepaymentCheck': IDL.Func([IDL.Text], [IDL.Text], []),
        'setRepaymentLendData': IDL.Func([LentData], [LentData], []),
        'setRepaymentTransferData': IDL.Func(
            [TransferredLendAmount],
            [TransferredLendAmount],
            [],
        ),
        'setTransaction': IDL.Func([IDL.Text, TransferredRequest], [IDL.Bool], []),
        'settleLoan': IDL.Func([LoanSettlementData], [TransferResponse], []),
        'transferComplete': IDL.Func([CollateralTransfer], [IDL.Text], []),
        'updateYieldNTerms': IDL.Func(
            [IDL.Float64, IDL.Nat, IDL.Nat],
            [IDL.Bool],
            [],
        ),
        'wallet_receive': IDL.Func(
            [],
            [IDL.Record({ 'accepted': IDL.Nat64 })],
            [],
        ),
        'withDrawAsset': IDL.Func([WithAssetRequest], [TransferResponse], []),
    });
};