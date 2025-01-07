import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int64 "mo:base/Int64";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Float "mo:base/Float";
import Types "Types";
import Time "mo:base/Time";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import AID "./lib/AID";

actor class ICPLendingProtocol() = this {

    type BorrowRequest = Types.BorrowRequest;
    type LentData = Types.LentData;
    type RepaymentData = Types.RepaymentData;
    type NFT_details = Types.NFT_Information;
    type TransferredRequest = Types.TransferredRequest;
    type TransferredLendAmount = Types.TransferredLendAmount;

    let limit = 50_000_000_000_000;
    func isEqP(x : Principal, y : Principal) : Bool { x == y };
    func isEq(x : Nat, y : Nat) : Bool { x == y };

    //CONFIG
    private stable var config_owner : Principal  = Principal.fromText("3ygh5-cghxa-tjmy5-ve2wj-hkrcz-44a6v-5ovdv-5jesg-ngs2g-jzsxs-eqe");
    private stable var config_admin : Principal  = config_owner;

    public type CollateralTransfer = {
        collectionID : Nat;
        token_hash : Text;
        token_number : Nat;
        borrowerPrincipal : Principal;
        borrowerAccountID : Text;
        offerID : Nat;
        canisterID : Principal;
    };

    public type OfferManager = {
        collectionID : Nat;
        lenderPrincipal : Principal;
        lenderAccountID : Text;
        offerID : Nat;
    };
    public type WithAssetRequest = {
        assetCanister : Text;
        account_id : Text;
        token_hash : Text;
    };

    private stable var _nftCount : Nat = 0;

    private stable var hashMapSize : Nat = 0;

    var debugMessage : Text = "";
    private stable var points_multiplier : Nat  = 1;

    private stable var _activeLendingCount : Nat = 0;
    private stable var _approvedCollectionID : Nat = 0;
    private stable var _offerID : Nat = 0;
    private stable var ckBTC_oldest_tx_id : Nat = 0;

    //Loan Settlement Data
    public type LoanSettlementData = {
        lendData : LentData;
        transaction_id : Nat;
        borrower : Principal;
        transfer_time : Nat64;
        paid_amount : Nat;
        paid_from : Principal;
        paid_to : Principal;
    };

    //Loan Settlement Data
    public type ForeClosureData = {
        lendData : LentData;
        lender : Principal;
    };

    public type HistoryData = {
        lendData : LentData;
        details : Text;
        receiver : Principal;
        paid_transaction_id : Nat;
        timestamp : Time.Time;
    };

    //private stable var canisterAccountID : Text = "c71642ec597853749485ae1a07e34eba58358973d532e2f1ad5adb91bcf12293";

    public type AccountIdentifier = Text;
    public type TokenIdentifier = Text;
    public type Memo = Blob;
    public type Balance = Nat;

    public type User = {
        #principal : Principal;
        #address : AccountIdentifier;
    };

    public type TransferRequest = {
        to : User;
        token : TokenIdentifier;
        notify : Bool;
        from : User;
        memo : Memo;
        subaccount : ?SubAccount;
        amount : Balance;
    };

    public type TransferResponse = {
        #ok : Balance;
        #err : {
            #CannotNotify : AccountIdentifier;
            #InsufficientBalance;
            #InvalidToken : TokenIdentifier;
            #Rejected;
            #Unauthorized : AccountIdentifier;
            #Other : Text;
        };
    };

    /*****************************************************/
    public type TokenIdentifier__1 = Text;
    public type Time = Int;
    public type CommonError = {
        #InvalidToken : TokenIdentifier;
        #Other : Text;
    };
    public type Listing = { locked : ?Time; seller : Principal; price : Nat64 };
    public type Result_10 = {
        #ok : (AccountIdentifier__1, ?Listing);
        #err : CommonError;
    };

    public type NFTCanister = actor {
        details : shared query TokenIdentifier__1 -> async Result_10;
    };

    public type TransferError = {
        #GenericError : { message : Text; error_code : Nat };
        #TemporarilyUnavailable;
        #BadBurn : { min_burn_amount : Nat };
        #Duplicate : { duplicate_of : Nat };
        #BadFee : { expected_fee : Nat };
        #CreatedInFuture : { ledger_time : Nat64 };
        #TooOld;
        #InsufficientFunds : { balance : Nat };
    };
    public type Account = { owner : Principal; subaccount : ?Blob };
    public type TransferArg = {
        to : Account;
        fee : ?Nat;
        memo : ?Blob;
        from_subaccount : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
    };

    public type TransactionRange = { transactions : [Transaction] };

    public type ArchivedRange_1 = {
        callback : shared query GetBlocksRequest -> async TransactionRange;
        start : Nat;
        length : Nat;
    };

    public type Burn = {
        from : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
        spender : ?Account;
    };

    public type Approve = {
        fee : ?Nat;
        from : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
        expected_allowance : ?Nat;
        expires_at : ?Nat64;
        spender : Account;
    };
    public type Mint = {
        to : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
    };
    public type Transaction = {
        burn : ?Burn;
        kind : Text;
        mint : ?Mint;
        approve : ?Approve;
        timestamp : Int;
        transfer : ?Transfer;
    };
    public type Transfer = {
        to : Account;
        fee : ?Nat;
        from : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
        spender : ?Account;
    };

    public type TransferFromArgs = {
        to : Account;
        fee : ?Nat;
        spender_subaccount : ?Blob;
        from : Account;
        memo : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
    };

    public type TransferFromError = {
        #GenericError : { message : Text; error_code : Nat };
        #TemporarilyUnavailable;
        #InsufficientAllowance : { allowance : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #Duplicate : { duplicate_of : Nat };
        #BadFee : { expected_fee : Nat };
        #CreatedInFuture : { ledger_time : Nat64 };
        #TooOld;
        #InsufficientFunds : { balance : Nat };
    };
    public type Result_2 = { #Ok : Nat; #Err : TransferFromError };

    public type GetBlocksRequest = { start : Nat; length : Nat };
    public type GetTransactionsResponse = {
        first_index : Nat;
        log_length : Nat;
        transactions : [Transaction];
        archived_transactions : [ArchivedRange_1];
    };

    public type Result = { #Ok : Nat; #Err : TransferError };
    let ckBTC_Canister = actor "mxzaz-hqaaa-aaaar-qaada-cai" : actor {
        icrc1_balance_of : shared query Account -> async Nat;
        icrc1_transfer : shared TransferArg -> async Result;
        icrc2_transfer_from : shared TransferFromArgs -> async Result_2;
        icrc1_fee : shared query () -> async Nat;
        get_transactions : shared query GetBlocksRequest -> async GetTransactionsResponse;
    };
    /*****************************************************/

    private stable var _collateralTransferData : [(Principal, CollateralTransfer)] = [];
    private var _collateralTransferTable = HashMap.HashMap<Principal, CollateralTransfer>(hashMapSize, isEqP, Principal.hash);

    private stable var _ActiveLendID : [(Text, Nat)] = [];
    private var _ActiveLendingTable = HashMap.HashMap<Text, Nat>(hashMapSize, Text.equal, Text.hash);

    //Assets with Active Lending
    private stable var _ActiveLending : [(Nat, Text)] = [];
    private var _ActiveLendingAssetsTable = HashMap.HashMap<Nat, Text>(hashMapSize, isEq, Nat32.fromNat);

    //Currently Lendings that are in Active status ActiveLendTable
    private stable var _activeLendersData : [(Text, [LentData])] = [];
    private var _activeLendersTable = HashMap.HashMap<Text, [LentData]>(hashMapSize, Text.equal, Text.hash);

    // Borrower and Asset Relations
    private stable var _activeBorrowersData : [(Text, [LentData])] = [];
    private var _activeBorrowersTable = HashMap.HashMap<Text, [LentData]>(hashMapSize, Text.equal, Text.hash);

    private stable var _tokenHistory : [(Text, [HistoryData])] = [];
    private var _tokenHistoryTable = HashMap.HashMap<Text, [HistoryData]>(hashMapSize, Text.equal, Text.hash);

    private stable var _ckBTCBalance : [(Principal, Nat)] = [];
    private var _ckBTCBalanceTable = HashMap.HashMap<Principal, Nat>(hashMapSize, isEqP, Principal.hash);

    private stable var _ckBTCTransactions : [(Principal, [Text])] = [];
    private var _ckBTCTransactionsTable = HashMap.HashMap<Principal, [Text]>(hashMapSize, isEqP, Principal.hash);

    private var _loanOffersTable = HashMap.HashMap<Nat, [CollectionOffers]>(hashMapSize, isEq, Nat32.fromNat);
    private stable var _loanOffersData : [(Nat, [CollectionOffers])] = [];

    private var _offersTable = HashMap.HashMap<Nat, CollectionOffers>(hashMapSize, isEq, Nat32.fromNat);
    private stable var _offersData : [(Nat, CollectionOffers)] = [];

    //Repayment Details
    private stable var _repaymentData : [(Text, [RepaymentData])] = [];
    private var _RepaymentTable = HashMap.HashMap<Text, [RepaymentData]>(hashMapSize, Text.equal, Text.hash);

    // Whether Repayment is done for the Lendings - Account ID and Token Hash
    private stable var _repaymentDetails : [(Text, [Text])] = [];
    private var _lenderRepaymentTable = HashMap.HashMap<Text, [Text]>(hashMapSize, Text.equal, Text.hash);

    private stable var _approved_collections : [(Nat, ApprovedCollection)] = [];
    private var _approvedCollectionTable = HashMap.HashMap<Nat, ApprovedCollection>(hashMapSize, isEq, Nat32.fromNat);

    private stable var _approved_list : [(Text, Nat)] = [];
    private var _approvedListTable = HashMap.HashMap<Text, Nat>(hashMapSize, Text.equal, Text.hash);
    /******************************************************************/

    private stable var _walletAssets : [(Text, [NFT_details])] = [];
    private var _walletAssetsTable = HashMap.HashMap<Text, [NFT_details]>(hashMapSize, Text.equal, Text.hash);

    // Borrow Request -- Account ID & Token Details
    private stable var _borrowRequest : [(Text, [BorrowRequest])] = [];
    private var _borrowRequestTable = HashMap.HashMap<Text, [BorrowRequest]>(hashMapSize, Text.equal, Text.hash);

    // Asset Details and Asset ID
    private stable var _assetDetails : [(Text, BorrowRequest)] = [];
    private var _assetDetailsTable = HashMap.HashMap<Text, BorrowRequest>(hashMapSize, Text.equal, Text.hash);

    // After the NFT storage store the Transactions
    private stable var _transactions : [(Text, [TransferredRequest])] = [];
    private var _transactionsTable = HashMap.HashMap<Text, [TransferredRequest]>(hashMapSize, Text.equal, Text.hash);

    // After the NFT storage store the Transactions   Account ID / Transactions
    private stable var _repaymentTransactions : [(Text, [TransferredLendAmount])] = [];
    private var _repaymentTransactionTable = HashMap.HashMap<Text, [TransferredLendAmount]>(hashMapSize, Text.equal, Text.hash);

    //Portfolio Details
    private stable var _userPortfolio : [(Principal, UserPortfolio)] = [];
    private var _userPortfolioTable = HashMap.HashMap<Principal, UserPortfolio>(0, isEqP, Principal.hash);


    // Initialize _pointsTable as a HashMap with Principal as the key and Nat as the value
    private var _pointsTable : HashMap.HashMap<Principal, Nat> = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
    private stable var _points : [(Principal, Nat)] = [];

    /**************************************************************************/

    public type BorrowerAccountId = Text;

    public type AccountIdentifier__1 = Text;

    public type SubAccount = Blob;

    public type ApprovedCollection = {
        collectionID : Nat;
        collectionName : Text;
        collectionURI : Text;
        thumbnailURI : Text;
        canisterID : Principal;
        description : Text;
        contentType : Text;
        marketplaceLink : Text;
        twitterLink : Text;
        websiteLink : Text;
        yield : Float;
        terms : Nat;
    };

    public type DeleteOfferParams = {
        offerID : Nat;
        collectionID : Nat;
        foundaryID : Nat;
    };

    public type UpdateOfferParams = {
        offerID : Nat;
        collectionID : Nat;
        loanAmount : ?Float;
        yieldRate : ?Float;
        terms : ?Nat;
        yieldAccrued : ?Float;
        loanToValue : ?Float;
        floorValue : ?Float;
        platformFee : ?Float;
    };
    public type CollectionOffers = {
        offerID : Nat;
        loanAmount : Nat;
        yieldRate : Nat;
        terms : Nat;
        yieldAccured : Nat;
        loanToValue : Float;
        floorValue : Float;
        platformFee : Nat;
        collectionID : Nat;
        ckTransactionID : Text;
        loanTime : Int;
        lender : Principal;
        lender_account_id : Text;
        repayment_amount : Nat;
        offerStatus : Bool;
        loanFiatValue : Nat;

    };
    public type UserPortfolio = {
        activeLendings : Nat;
        activeBorrows : Nat;
        completedLoans : Nat;
        lendingValue : Float;
        borrowValue : Float;
        profitEarned : Float;
        registeredTime : Int;
        user : Principal;
    };

    type ToniqLab_NFT_Canister = actor {
        transfer : shared TransferRequest -> async TransferResponse;
    };

    type TestCanister = actor {
        transfer : shared Text -> async Principal;
    };

    private stable var toniqLabNFTCanister_ : ?ToniqLab_NFT_Canister = null;

    private stable var testCanister : ?TestCanister = null;

    /**************************************************************************/

    type CanisterActor = actor {
        transfer : (TransferRequest) -> async TransferResponse;
    };

    private var nftCanister_ : ?CanisterActor = null;

    system func preupgrade() {

        _ckBTCBalance := Iter.toArray(_ckBTCBalanceTable.entries());
        _ckBTCTransactions := Iter.toArray(_ckBTCTransactionsTable.entries());

        _walletAssets := Iter.toArray(_walletAssetsTable.entries());
        _borrowRequest := Iter.toArray(_borrowRequestTable.entries());
        _assetDetails := Iter.toArray(_assetDetailsTable.entries());

        _activeLendersData := Iter.toArray(_activeLendersTable.entries());
        _ActiveLending := Iter.toArray(_ActiveLendingAssetsTable.entries());
        _ActiveLendID := Iter.toArray(_ActiveLendingTable.entries());
        _activeBorrowersData := Iter.toArray(_activeBorrowersTable.entries());

        _repaymentData := Iter.toArray(_RepaymentTable.entries());
        _repaymentDetails := Iter.toArray(_lenderRepaymentTable.entries());

        _transactions := Iter.toArray(_transactionsTable.entries());
        _repaymentTransactions := Iter.toArray(_repaymentTransactionTable.entries());

        _approved_list := Iter.toArray(_approvedListTable.entries());
        _approved_collections := Iter.toArray(_approvedCollectionTable.entries());
        _loanOffersData := Iter.toArray(_loanOffersTable.entries());

        _userPortfolio := Iter.toArray(_userPortfolioTable.entries());
        _collateralTransferData := Iter.toArray(_collateralTransferTable.entries());

        _offersData := Iter.toArray(_offersTable.entries());

        _tokenHistory := Iter.toArray(_tokenHistoryTable.entries());

        _points := Iter.toArray(_pointsTable.entries());



    };

    system func postupgrade() {

        _tokenHistoryTable := HashMap.fromIter<Text, [HistoryData]>(_tokenHistory.vals(), hashMapSize, Text.equal, Text.hash);

        _ckBTCBalanceTable := HashMap.fromIter<Principal, Nat>(_ckBTCBalance.vals(), hashMapSize, isEqP, Principal.hash);
        _ckBTCTransactionsTable := HashMap.fromIter<Principal, [Text]>(_ckBTCTransactions.vals(), hashMapSize, isEqP, Principal.hash);

        _offersTable := HashMap.fromIter<Nat, CollectionOffers>(_offersData.vals(), hashMapSize, isEq, Nat32.fromNat);

        _loanOffersTable := HashMap.fromIter<Nat, [CollectionOffers]>(_loanOffersData.vals(), hashMapSize, isEq, Nat32.fromNat);

        _borrowRequestTable := HashMap.fromIter<Text, [BorrowRequest]>(_borrowRequest.vals(), hashMapSize, Text.equal, Text.hash);
        _assetDetailsTable := HashMap.fromIter<Text, BorrowRequest>(_assetDetails.vals(), hashMapSize, Text.equal, Text.hash);

        _walletAssetsTable := HashMap.fromIter<Text, [NFT_details]>(_walletAssets.vals(), hashMapSize, Text.equal, Text.hash);

        _activeLendersTable := HashMap.fromIter<Text, [LentData]>(_activeLendersData.vals(), hashMapSize, Text.equal, Text.hash);
        _ActiveLendingAssetsTable := HashMap.fromIter<Nat, Text>(_ActiveLending.vals(), hashMapSize, isEq, Nat32.fromNat);
        _ActiveLendingTable := HashMap.fromIter<Text, Nat>(_ActiveLendID.vals(), hashMapSize, Text.equal, Text.hash);
        _activeBorrowersTable := HashMap.fromIter<Text, [LentData]>(_activeBorrowersData.vals(), hashMapSize, Text.equal, Text.hash);

        _RepaymentTable := HashMap.fromIter<Text, [RepaymentData]>(_repaymentData.vals(), hashMapSize, Text.equal, Text.hash);
        _lenderRepaymentTable := HashMap.fromIter<Text, [Text]>(_repaymentDetails.vals(), hashMapSize, Text.equal, Text.hash);

        _transactionsTable := HashMap.fromIter<Text, [TransferredRequest]>(_transactions.vals(), hashMapSize, Text.equal, Text.hash);
        _repaymentTransactionTable := HashMap.fromIter<Text, [TransferredLendAmount]>(_repaymentTransactions.vals(), hashMapSize, Text.equal, Text.hash);

        _approvedCollectionTable := HashMap.fromIter<Nat, ApprovedCollection>(_approved_collections.vals(), hashMapSize, isEq, Nat32.fromNat);
        _approvedListTable := HashMap.fromIter<Text, Nat>(_approved_list.vals(), hashMapSize, Text.equal, Text.hash);

        _userPortfolioTable := HashMap.fromIter<Principal, UserPortfolio>(_userPortfolio.vals(), hashMapSize, isEqP, Principal.hash);

        _collateralTransferTable := HashMap.fromIter<Principal, CollateralTransfer>(_collateralTransferData.vals(), hashMapSize, isEqP, Principal.hash);

        _pointsTable := HashMap.fromIter<Principal, Nat>(_points.vals(), hashMapSize, isEqP, Principal.hash);

    };

    /*------------------------------------------------------------*/

    public func getLenderByOfferID(offerID : Nat) : async Principal {
        let defaultPrincipal = Principal.fromText("aaaaa-aa"); // Use a default or invalid Principal value
        for ((collectionID, offers) in _loanOffersTable.entries()) {
            // Find the offer with the given offerID
            let offerOpt = Array.find<CollectionOffers>(
                offers,
                func(offer : CollectionOffers) : Bool {
                    offer.offerID == offerID;
                },
            );
            switch (offerOpt) {
                case (?offer) {
                    return offer.lender; // Return the lender if offer is found
                };
                case (null) {
                    // Continue searching in the next collection
                };
            };
        };
        return defaultPrincipal; // Return the default Principal if offerID not found in any collection
    };

    public func getLoanAmount(offersOpt : ?[CollectionOffers], offerID : Nat) : async ?Nat {
        switch (offersOpt) {
            case (?offers) {
                // Find the offer with the given offerID
                let offerOpt = Array.find<CollectionOffers>(
                    offers,
                    func(offer : CollectionOffers) : Bool {
                        offer.offerID == offerID;
                    },
                );
                switch (offerOpt) {
                    case (?offer) {
                        return ?offer.loanAmount; // Return the loan amount if offer is found
                    };
                    case (null) {
                        return null; // OfferID not found
                    };
                };
            };
            case (null) {
                return null; // Offers array not provided
            };
        };
    };

    public query func isLoanOfferActive(offerID : Nat) : async Bool {
        for ((collectionID, offers) in _loanOffersTable.entries()) {
            // Check if any offer matches the given offerID and has offerStatus == true
            let offerOpt = Array.find<CollectionOffers>(
                offers,
                func(offer : CollectionOffers) : Bool {
                    offer.offerID == offerID and offer.offerStatus;
                },
            );
            switch (offerOpt) {
                case (?offer) {
                    return true; // Return true if the offer is found and is active
                };
                case (null) {
                    // Continue searching in the next collection
                };
            };
        };
        return false; // OfferID not found in any collection with offerStatus true
    };

    public shared (msg) func deleteOffer(collateralTransfer : OfferManager) : async Bool {

        let collectionID : Nat = collateralTransfer.collectionID;
        let offerID : Nat = collateralTransfer.offerID;

        // Check if the caller is the same as the borrower principal
        if (msg.caller != collateralTransfer.lenderPrincipal) {
            return false; // Caller is not the borrower
        };

        let offerStatus : Bool = await isLoanOfferActive(offerID);

        if (offerStatus == false) {
            return false; // Caller is not the borrower
        };

        switch (_loanOffersTable.get(collectionID)) {
            case (?offers) {

                let loanAmountOpt = await getLoanAmount(?offers, offerID);
                var _loanAmount : Nat = 0;

                switch (loanAmountOpt) {
                    case (?loanAmount) {
                        // Handle the found loan amount
                        _loanAmount := loanAmount;
                    };
                    case (null) {
                        // Handle the case where the loan amount was not found
                    };
                };

                // Filter out the offer with the given offerID
                let updatedOffers = Array.filter<CollectionOffers>(
                    offers,
                    func(offer : CollectionOffers) : Bool {
                        offer.offerID != offerID;
                    },
                );

                // If the length of updatedOffers is less than the original offers,
                // it means the offer was found and removed
                if (updatedOffers.size() < offers.size()) {
                    // Update the hash map with the updated offers
                    _loanOffersTable.put(collectionID, updatedOffers);

                    var result = await transferckBTC(_loanAmount, collateralTransfer.lenderPrincipal);
                    var returnValue = handleResult(result);

                    debugMessage := debugMessage # "\n " # "Trying to transfer Amount " # Nat.toText(_loanAmount) # "To " # Principal.toText(collateralTransfer.lenderPrincipal);

                    return true;
                } else {
                    return false; // OfferID not found
                };
            };
            case (null) {
                return false; // CollectionID not found
            };
        };
    };

    public func setCkBTC_oldest_tx_id(oldest_tx_id : Nat) : async Nat {
        ckBTC_oldest_tx_id := oldest_tx_id;
        ckBTC_oldest_tx_id;
    };

    public query func getCkBTC_oldest_tx_id() : async Nat {
        ckBTC_oldest_tx_id;
    };
    public shared (msg) func addckBTCBalance(spender : Principal, amount : Nat) : async Bool {

        // Only by specific principal which is allowed to store the value
        var previous_balance = _ckBTCBalanceTable.get(spender);

        switch (previous_balance) {
            case (?previous_balance) {
                _ckBTCBalanceTable.put(spender, previous_balance + amount);
            };
            case (_) {
                _ckBTCBalanceTable.put(spender, amount);
            };
        };
        return true;
    };
    public query func getckBTCBalance(spender : Principal) : async Nat {

        var previous_balance = _ckBTCBalanceTable.get(spender);

        switch (previous_balance) {
            case (?previous_balance) {
                return previous_balance;
            };
            case (_) {
                return 0;
            };
        };
    };
    public shared ({ caller }) func getckBTCAmount() : async Nat {
        let currentAccount : Account = {
            owner = caller;
            subaccount = null; // or provide subaccount if needed
        };
        let balance : Nat = await ckBTC_Canister.icrc1_balance_of(currentAccount);
        return balance;
    };

    private func _getckBTCBalance(spender : Principal) : async Nat {

        var previous_balance = _ckBTCBalanceTable.get(spender);

        switch (previous_balance) {
            case (?previous_balance) {
                return previous_balance;
            };
            case (_) {
                return 0;
            };
        };
    };
    public query func getckBTCTransactions(userPrincipal : Text) : async ?[Text] {

        var _userPrincipal = Principal.fromText(userPrincipal);

        var _userckBTCTransactions = _ckBTCTransactionsTable.get(_userPrincipal);

        switch (_userckBTCTransactions) {
            case (?_userckBTCTransactions) {

                return ?_userckBTCTransactions;
            };
            case (_) {
                return ?[];
            };
        };
    };

    public shared (msg) func ckBTCTransactions(id : Nat) : async GetTransactionsResponse {

        var request : GetBlocksRequest = {
            start = 2;
            length = 2;
        };
        var balance = await ckBTC_Canister.get_transactions(request);

        return balance;
    };

    public shared (msg) func addckBTCTransactions(spender : Principal, transaction : Text) : async Bool {

        var old_transactions = _ckBTCTransactionsTable.get(spender);

        switch (old_transactions) {
            case (?old_transactions) {
                _ckBTCTransactionsTable.put(spender, Array.append(old_transactions, [transaction]));
            };
            case (_) {
                _ckBTCTransactionsTable.put(spender, Array.make(transaction));
            };
        };
        return true;
    };

    func getCanisterId_() : Principal { Principal.fromActor(this) };

    public shared (msg) func ckBTCBalance() : async Nat {

        let zeroThSubAccount : ?Blob = null;

        var canister : Account = {
            owner = getCanisterId_();
            subaccount = zeroThSubAccount;
        };
        var balance = await ckBTC_Canister.icrc1_balance_of(canister);
        return balance;
    };

    // Step 1 : Borrowing ckBTC
    // Step 2 : Transfer the NFT to Canister
    public shared (msg) func addCollateralTransfer(collateralTransfer : CollateralTransfer) : async Bool {
        _collateralTransferTable.put(msg.caller, collateralTransfer);
        return true;
    };

    public query func getCollateral() : async [(Principal, CollateralTransfer)] {

        return Iter.toArray(_collateralTransferTable.entries());
    };

    public shared (msg) func resetDebug() : async Text {
        //assert(_isAdmin(msg.caller));
        debugMessage := "";
        return "Debug cleared!";
    };
    public query func getDebug() : async Text {
        debugMessage;
    };






    // Step 3 : After the transfer of NFT front-end will this function
    public shared (msg) func transferComplete(collateralTransfer : CollateralTransfer) : async Text {

        debugMessage := debugMessage # "\n " # " collateralTransfer.canisterID: " # Principal.toText(collateralTransfer.canisterID);

        var nftCanister : NFTCanister = actor (Principal.toText(collateralTransfer.canisterID));
        //var nftCanister : NFTCanister = actor("efbpx-hqaaa-aaaam-ab7ja-cai");

        var tokenID : TokenIdentifier__1 = collateralTransfer.token_hash;

        debugMessage := debugMessage # "\n collateralTransfer.token_hash " # collateralTransfer.token_hash;

        let result = await nftCanister.details(tokenID);

        //let result = await callCanister();

        debugMessage := debugMessage # "\n Details done 558";

        switch (result) {
            case (#ok(accountIdentifier, _)) {

                debugMessage := debugMessage # "\n OK " # "Result is ok";

                if (accountIdentifier == "c71642ec597853749485ae1a07e34eba58358973d532e2f1ad5adb91bcf12293") {
                    let _lendData = getLentData(collateralTransfer);

                    debugMessage := debugMessage # "\n _lendData.lender_account_id = " # _lendData.lender_account_id;

                    if (_lendData.lender_account_id == "error") {
                        return _lendData.transaction_id;
                    };

                    let loanResult = await startLoan(_lendData);

                    //Now, remove the current Lend Request, to stop double loan
                    let removeResult = removeOffer(collateralTransfer);

                    return loanResult;
                    //return "Yes, Token is in Canister " # _lendData.lender_account_id;
                } else {
                    debugMessage := debugMessage # "\n ERROR " # "NFT is not in the collateral canister";

                };
            };
            case (#err(_)) {
                debugMessage := debugMessage # "\n ERROR" # "Result is Error";
                return "Token details error";
            };
        };

        debugMessage := debugMessage # "\n " # "Token not found";
        return "Token not found";
    };

    private func transferckBTC(amount : Nat, receiver : Principal) : async Result {

        let zeroThSubAccount : ?Blob = null;

        var user : Account = {
            owner = receiver;
            subaccount = zeroThSubAccount;
        };

        let ckBTCTransferFee = 0;
        let amountTransfer = (amount - ckBTCTransferFee);

        //let new_balance = balance - amountTransfer;

        var transferArgs : TransferArg = {
            to = user;
            fee = null;
            amount = amountTransfer;
            memo = null;
            from_subaccount = null;
            created_at_time = null;
        };

        var result = await ckBTC_Canister.icrc1_transfer(transferArgs);

        //_ckBTCBalanceTable.put(receiver, new_balance);

        return result;
    };

    private func getLentData(collateral : CollateralTransfer) : LentData {
        // Fetch the approved collection details
        let approvedCollectionOpt = _approvedCollectionTable.get(collateral.collectionID);

        let emptynftInformation : NFT_details = {
            canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
            collection_name = " ";
            token_hash = " ";
            token_number = 0;
            owner_account_id = " ";
            owner_principal = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
            mime_type = " ";
        };

        var emptyLentData : LentData = {
            nft = emptynftInformation;
            transaction_id = "";
            borrower_account_id = " ";
            lender_account_id = " ";
            loan_amount = 0;
            repayment_amount = 0;
            timestamp = Time.now();
            offerID = 0;
        };

        switch (approvedCollectionOpt) {
            case (null) {
                // If the collection is not approved, return null

                debugMessage := debugMessage # "{Error: Collection is not approved}";

                var emptyLentData : LentData = {
                    nft = emptynftInformation;
                    transaction_id = "Collection is not approved";
                    borrower_account_id = " ";
                    lender_account_id = "error";
                    loan_amount = 0;
                    repayment_amount = 0;
                    timestamp = Time.now();
                    offerID = 0;

                };
                return emptyLentData;
            };
            case (?approvedCollection) {
                // Fetch the loan offer details
                let collectionOffersOpt = _loanOffersTable.get(collateral.collectionID);
                switch (collectionOffersOpt) {
                    case (null) {
                        // If no offers found for the collection, return null
                        debugMessage := debugMessage # "{Error: No offers found for the collection}";

                        var emptyLentData : LentData = {
                            nft = emptynftInformation;
                            transaction_id = "No offers found for the collection";
                            borrower_account_id = " ";
                            lender_account_id = "error";
                            loan_amount = 0;
                            repayment_amount = 0;
                            timestamp = Time.now();
                            offerID = 0;

                        };
                        return emptyLentData;
                    };
                    case (?offers) {

                        var offer = _offersTable.get(collateral.offerID);

                        switch (offer) {
                            case (null) {
                                debugMessage := debugMessage # "{Error: OfferID not found}";

                                return emptyLentData; // OfferID not found
                            };
                            case (?offer) {
                                debugMessage := debugMessage # "{Success: Offer Found}";
                                // Populate NFT_Information
                                let nftInformation : NFT_details = {
                                    canister = approvedCollection.canisterID;
                                    collection_name = approvedCollection.collectionName;
                                    token_hash = collateral.token_hash;
                                    token_number = collateral.token_number;
                                    owner_account_id = collateral.borrowerAccountID;
                                    owner_principal = collateral.borrowerPrincipal;
                                    mime_type = approvedCollection.contentType;
                                };

                                // Populate LentData
                                let lentData : LentData = {
                                    nft = nftInformation;
                                    transaction_id = offer.ckTransactionID;
                                    borrower_account_id = collateral.borrowerAccountID;
                                    lender_account_id = offer.lender_account_id;
                                    loan_amount = offer.loanAmount;
                                    repayment_amount = offer.repayment_amount;
                                    timestamp = Time.now();
                                    offerID = offer.offerID;

                                };
                                return lentData;
                            };
                        };
                    };
                };
            };
        };
    };

    public query func getMaxLoanAmounts() : async [(Nat, CollectionOffers)] {
        let maxLoanAmounts = HashMap.HashMap<Nat, CollectionOffers>(100, Nat.equal, Nat32.fromNat);

        var _maxLoan : CollectionOffers = {
            offerID = 0;
            loanAmount = 0;
            yieldRate = 0;
            terms = 0;
            yieldAccured = 0;
            loanToValue = 0;
            floorValue = 0.0;
            platformFee = 0;
            ckTransactionID = "0";
            collectionID = 0;
            loanTime = Time.now();
            lender = Principal.fromText("ibuvb-6aaaa-aaaam-ab6ea-cai");
            lender_account_id = "";
            repayment_amount = 0;
            offerStatus = true;
            loanFiatValue = 0;
        };

        let _offers = _loanOffersTable.entries();
        var maxLoan : CollectionOffers = _maxLoan;
        var _collectionID : Nat = 0;

        var isOfferAvailable : Bool = false;

        for ((id, offer) in _offers) {
            for (i in Iter.range(0, offer.size() - 1)) {
                if (offer[i].loanAmount > maxLoan.loanAmount and offer[i].offerStatus ) {
                    maxLoan := offer[i];
                    _collectionID := offer[i].collectionID;
                    isOfferAvailable := true;
                };
            };
            if(isOfferAvailable)
            {
                maxLoanAmounts.put(id, maxLoan);
            };
            maxLoan := _maxLoan;
            isOfferAvailable := false;
        };
        return Iter.toArray(maxLoanAmounts.entries());
           
    };

    public query func getUserOffers(userPrincipal : Principal) : async [(Principal, [CollectionOffers])] {
        let _userOffers = HashMap.HashMap<Principal, [CollectionOffers]>(100, isEqP, Principal.hash);

        let _offers = _loanOffersTable.entries();
        var _collectionID : Nat = 0;
        var _userOfferCount : Nat = 0;

        for ((id, offer) in _offers) {
            for (i in Iter.range(0, offer.size() - 1)) {
                if (Principal.equal(offer[i].lender, userPrincipal) and offer[i].offerStatus) {
                    var offers = _userOffers.get(userPrincipal);

                    switch (offers) {
                        case (?offers) {
                            _userOffers.put(userPrincipal, Array.append(offers, [offer[i]]));
                        };
                        case (_) {
                            _userOffers.put(userPrincipal, Array.make(offer[i]));
                        };
                    };
                };
            };
        };
        return Iter.toArray(_userOffers.entries());
    };

    public query func getUserData(userPrincipal : Principal) : async UserPortfolio {

        var _userPortFolio : UserPortfolio = {
            loanAmount = 0.0;
            yieldRate = 0.0;
            terms = 0;
            yieldAccured = 0.0;
            loanToValue = 0;
            activeLendings = 0;
            activeBorrows = 0;
            completedLoans = 0;
            lendingValue = 0.0;
            borrowValue = 0.0;
            profitEarned = 0.0;
            registeredTime = 0;
            user = userPrincipal;
        };

        var userPortfolio = _userPortfolioTable.get(userPrincipal);

        switch (userPortfolio) {
            case (?userPortfolio) {
                return userPortfolio;
            };
            case (_) {
                _userPortfolioTable.put(userPrincipal, _userPortFolio);
                return _userPortFolio;
            };
        };
    };

    public query func getLoanOffersByLender(lender : Principal) : async [CollectionOffers] {
        var lenderOffers : [CollectionOffers] = [];

        // Iterate through all collection offers
        for ((collectionID, offers) in _loanOffersTable.entries()) {
            // Filter offers by the lender
            let filteredOffers = Array.filter(
                offers,
                func(offer : CollectionOffers) : Bool {
                    return offer.lender == lender;
                },
            );
            // Append the filtered offers to the lenderOffers array
            lenderOffers := Array.append(lenderOffers, filteredOffers);
        };

        return lenderOffers;
    };

    public func addloanOffer(loanOffer : CollectionOffers, collectionID : Nat) : async Bool {
        var _loanOffer : CollectionOffers = {
            offerID = _offerID;
            loanAmount = loanOffer.loanAmount;
            yieldRate = loanOffer.yieldRate;
            terms = loanOffer.terms;
            yieldAccured = loanOffer.yieldAccured;
            loanToValue = loanOffer.loanToValue;
            floorValue = loanOffer.floorValue;
            platformFee = loanOffer.platformFee;
            ckTransactionID = loanOffer.ckTransactionID;
            collectionID = loanOffer.collectionID;
            loanTime = Time.now();
            lender = loanOffer.lender;
            lender_account_id = loanOffer.lender_account_id;
            repayment_amount = loanOffer.repayment_amount;
            offerStatus = true;
            loanFiatValue = loanOffer.loanFiatValue;
        };
        var offers = _loanOffersTable.get(collectionID);

        switch (offers) {
            case (?offers) {
                _loanOffersTable.put(collectionID, Array.append(offers, [_loanOffer]));
            };
            case (_) {
                _loanOffersTable.put(collectionID, Array.make(_loanOffer));
            };
        };
        _offersTable.put(_offerID, _loanOffer);
        _offerID := _offerID + 1;

        // Update points for the lender
        let currentPointsOpt = _pointsTable.get(loanOffer.lender);
        let updatedPoints = switch (currentPointsOpt) {
            case (?points) {
                points + (loanOffer.loanAmount * points_multiplier)
            };
            case null {
                loanOffer.loanAmount * points_multiplier
            };
        };
        _pointsTable.put(loanOffer.lender, updatedPoints);
        return true;
    };

    public func getPoints(lender : Principal) : async ?Nat {
        return _pointsTable.get(lender);
    };

    public shared (msg) func redeemPoints(pointsToRedeem : Nat) : async Bool {
        let currentPointsOpt = _pointsTable.get(msg.caller);

        switch (currentPointsOpt) {
            case (?currentPoints) {
                if (currentPoints >= pointsToRedeem) {
                    _pointsTable.put(msg.caller, currentPoints - pointsToRedeem);
                    return true; // Points successfully redeemed
                } else {
                    return false; // Not enough points to redeem
                };
            };
            case null {
                return false; // Caller has no points
            };
        };
    };

    public shared (msg) func addPointsWithMultiplier(_points_multiplier: Nat) : async Bool {

        assert(_isAdmin(msg.caller));

        points_multiplier := _points_multiplier;
        
        return true;
    };


    public query func getOffer(collectionID : Nat) : async [CollectionOffers] {
        var offersOpt = _loanOffersTable.get(collectionID);

        switch (offersOpt) {
            case (?offers) {
                let filteredOffers = Array.filter<CollectionOffers>(
                    offers,
                    func(offer : CollectionOffers) : Bool {
                        offer.offerStatus;
                    },
                );
                return filteredOffers;
            };
            case (_) {
                return [];
            };
        };
    };

    public query func getOffers() : async [(Nat, [CollectionOffers])] {
        Iter.toArray(_loanOffersTable.entries());
    };
    /************************************************************************************/

    public query func getApprovedCollections() : async [(Nat, ApprovedCollection)] {

        var _collections = Iter.toArray(_approvedCollectionTable.entries());
        return _collections;

    };

    public func updateYieldNTerms(yield_ : Float, terms_ : Nat, _approvedCollectionID : Nat) : async Bool {

        var _approvedCollection = _approvedCollectionTable.get(_approvedCollectionID);

        switch (_approvedCollection) {
            case (?_approvedCollection) {

                var approvedCollection_ : ApprovedCollection = {
                    collectionID = _approvedCollection.collectionID;
                    collectionName = _approvedCollection.collectionName;
                    collectionURI = _approvedCollection.collectionURI;
                    thumbnailURI = _approvedCollection.thumbnailURI;
                    contentType = _approvedCollection.contentType;
                    canisterID = _approvedCollection.canisterID;
                    description = _approvedCollection.description;
                    marketplaceLink = _approvedCollection.marketplaceLink;
                    twitterLink = _approvedCollection.twitterLink;
                    websiteLink = _approvedCollection.websiteLink;
                    yield = yield_;
                    terms = terms_;
                };
                ignore _approvedCollectionTable.replace(_approvedCollectionID, approvedCollection_);
                return true;
            };
            case (_) {
                return false;
            };
        };
        return false;
    };

    func _isAdmin(p : Principal) : Bool {
        return true;
        //return (p == config_admin);
    };
    public query func canister_admin() : async Principal {
        config_admin;
    };
    public shared (msg) func addApprovedCollections(_approvedCollection : ApprovedCollection) : async Bool {

        assert(_isAdmin(msg.caller));
        var collectionNameExists = _approvedListTable.get(_approvedCollection.collectionName);
        var approvedCollection_ : ApprovedCollection = {
            collectionID = _approvedCollectionID;
            collectionName = _approvedCollection.collectionName;
            collectionURI = _approvedCollection.collectionURI;
            thumbnailURI = _approvedCollection.thumbnailURI;
            contentType = _approvedCollection.contentType;
            canisterID = _approvedCollection.canisterID;
            description = _approvedCollection.description;
            marketplaceLink = _approvedCollection.marketplaceLink;
            twitterLink = _approvedCollection.twitterLink;
            websiteLink = _approvedCollection.websiteLink;
            yield = 2.5;
            terms = 7;
        };
        switch (collectionNameExists) {
            case (_) {
                _approvedCollectionTable.put(_approvedCollectionID, approvedCollection_);
                _approvedCollectionID += 1;
                return true;
            };
        };
        return false;
    };

    public shared (msg) func removeApprovedCollections(collectionID : Nat) : async Bool {

        assert(_isAdmin(msg.caller));
        _approvedCollectionTable.delete(collectionID);
        return true;
    };
    /*------------------------------------------------------------*/

    // Called after Lending
    public func setTransaction(owner_account_id : Text, transferRequest : TransferredRequest) : async Bool {

        var _userTransactions = _transactionsTable.get(owner_account_id);

        switch (_userTransactions) {
            case (?_userTransactions) {
                _transactionsTable.put(owner_account_id, Array.append(_userTransactions, [transferRequest]));
            };
            case (_) {
                _transactionsTable.put(owner_account_id, Array.make(transferRequest));
            };
        };
        return true;
    };
    /*------------------------------------------------------------*/


    public func getTransactions(owner_account_id : Text) : async [TransferredRequest] {

        var _userTransactions = _transactionsTable.get(owner_account_id);

        switch (_userTransactions) {
            case (?_userTransactions) {

                var __userTransactions = Option.unwrap(_transactionsTable.get(owner_account_id));

                switch (__userTransactions) {
                    case (__userTransactions) {
                        return __userTransactions;
                    };
                    case (_) {
                        return [];
                    };
                };

            };
            case (_) {
                return [];
            };
        };
    };
    /*------------------------------------------------------------*/
    public func withDrawAsset(withdraw : WithAssetRequest) : async TransferResponse {

        // Create the TransferRequest with default values
        let request : TransferRequest = {
            to = #address(withdraw.account_id);
            token = withdraw.token_hash;
            notify = false;
            from = #principal(Principal.fromActor(this));
            memo = Blob.fromArray([]);
            subaccount = null;
            amount = 1;
        };

        toniqLabNFTCanister_ := ?actor (withdraw.assetCanister);
        let res = await Option.unwrap(toniqLabNFTCanister_).transfer(request);
        return res;
    };

    public func checkWithdraw(assetCanister : Text) : async Principal {

        testCanister := ?actor (assetCanister);
        let res = await Option.unwrap(testCanister).transfer(assetCanister);
        return res;
    };
    /*------------------------------------------------------------*/
    public query func getAllActiveLendings() : async [(Nat, Text)] {
        Iter.toArray(_ActiveLendingAssetsTable.entries());
    };

    public query func getAllTransactions() : async [(Text, [TransferRequest])] {

        Iter.toArray(_transactionsTable.entries());

    };
    /*------------------------------------------------------------*/

    public query func getAllBorrows() : async [(Text, [LentData])] {
        _activeBorrowersData := Iter.toArray(_activeBorrowersTable.entries());
        return _activeBorrowersData;
    };

    public query func getAllLent() : async [(Text, [LentData])] {
        _activeLendersData := Iter.toArray(_activeLendersTable.entries());
        return _activeLendersData;
    };

    public query func getUserBorrows(_account_id : Text) : async [LentData] {

        var _userBorrows = _activeBorrowersTable.get(_account_id);
        switch (_userBorrows) {
            case (?_userBorrows) {
                return _userBorrows;
            };
            case (_) {
                return [];
            };
        };
    };

    public query func getUserLent(_account_id : Text) : async [LentData] {

        var _userLending = _activeLendersTable.get(_account_id);
        switch (_userLending) {
            case (?_userLending) {
                return _userLending;
            };
            case (_) {
                return [];
            };
        };
    };

/*--------------------------------------------------------------
    Called after the Lender send the loan to the user
---------------------------------------------------------------*/
    // Function to handle Result
    private func handleResult(result : Result) : Nat {
        switch (result) {
            case (#Ok(value)) {
                // Handle the Ok case
                debugMessage := debugMessage # "\n " # "Handle Result OK " # " " # Nat.toText(value);
                return value;
            };
            case (#Err(error)) {
                // Handle the Error case
                switch (error) {
                    case (#GenericError { message; error_code }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: GenericError" # " " # message # " " # Nat.toText(error_code);
                    };
                    case (#TemporarilyUnavailable) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: TemporarilyUnavailable";
                    };
                    case (#BadBurn { min_burn_amount }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: BadBurn" # " " # Nat.toText(min_burn_amount);
                    };
                    case (#Duplicate { duplicate_of }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: Duplicate" # " " # Nat.toText(duplicate_of);
                    };
                    case (#BadFee { expected_fee }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: BadFee" # " " # Nat.toText(expected_fee);
                    };
                    case (#CreatedInFuture { ledger_time }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: CreatedInFuture" # " " # Nat64.toText(ledger_time);
                    };
                    case (#TooOld) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: TooOld";
                    };
                    case (#InsufficientFunds { balance }) {
                        debugMessage := debugMessage # "\n " # "Handle Result ERROR: InsufficientFunds" # " " # Nat.toText(balance);
                    };
                };
                return 0;
            };
        };
    };

    private func modifyLentData(_lendData : LentData, transaction : Text) : LentData {

        var _newLentData : LentData = {
            nft = _lendData.nft;
            transaction_id = transaction;
            borrower_account_id = _lendData.borrower_account_id;
            lender_account_id = _lendData.lender_account_id;
            loan_amount = _lendData.loan_amount;
            repayment_amount = _lendData.repayment_amount;
            timestamp = _lendData.timestamp;
            offerID = _lendData.offerID;
        };

        return _newLentData;
    };

    private func removeOffer(collateralTransfer : CollateralTransfer) : async Bool {
        let collectionID : Nat = collateralTransfer.collectionID;
        let offerID : Nat = collateralTransfer.offerID;

        switch (_loanOffersTable.get(collectionID)) {
            case (?offers) {
                var offerUpdated = false;
                let updatedOffers = Array.map<CollectionOffers, CollectionOffers>(
                    offers,
                    func(offer : CollectionOffers) : CollectionOffers {
                        if (offer.offerID == offerID) {
                            offerUpdated := true;
                            return {
                                offerID = offer.offerID;
                                loanAmount = offer.loanAmount;
                                yieldRate = offer.yieldRate;
                                terms = offer.terms;
                                yieldAccured = offer.yieldAccured;
                                loanToValue = offer.loanToValue;
                                floorValue = offer.floorValue;
                                platformFee = offer.platformFee;
                                collectionID = offer.collectionID;
                                ckTransactionID = offer.ckTransactionID;
                                loanTime = offer.loanTime;
                                lender = offer.lender;
                                lender_account_id = offer.lender_account_id;
                                repayment_amount = offer.repayment_amount;
                                offerStatus = false;
                                loanFiatValue = offer.loanFiatValue;
                            };
                        } else {
                            return offer;
                        };
                    },
                );

                if (offerUpdated) {
                    _loanOffersTable.put(collectionID, updatedOffers);
                    return true;
                } else {
                    return false; // OfferID not found
                };
            };
            case (null) {
                return false; // CollectionID not found
            };
        };
    };

    private func startLoan(_lendData : LentData) : async Text {

        debugMessage := debugMessage # "\n " # "Starting Loan " # Nat.toText(_lendData.loan_amount) # "To " # Principal.toText(_lendData.nft.owner_principal);

        // Check if the asset is already on lending
        var isOnLending = _ActiveLendingTable.get(_lendData.nft.token_hash);

        // If the asset is already on lending, return false
        switch (isOnLending) {
            case (?isOnLending) {
                return "NFT already on lending";
            };
            case (_) {};
        };

        debugMessage := debugMessage # "\n " # "Starting Loan Stage 2 " # Nat.toText(_lendData.loan_amount) # "To " # Principal.toText(_lendData.nft.owner_principal);

        var result = await transferckBTC(_lendData.loan_amount, _lendData.nft.owner_principal);
        var returnValue = handleResult(result);

        debugMessage := debugMessage # "\n " # "Trying to transfer Amount " # Nat.toText(_lendData.loan_amount) # "To " # Principal.toText(_lendData.nft.owner_principal);

        // Create a new LentData based on the existing one but with the new transaction_id
        var newLentData : LentData = modifyLentData(_lendData, Nat.toText(returnValue));

        // Retrieve user's active lending data
        var _account_id = _lendData.lender_account_id;
        var _userLending = _activeLendersTable.get(_account_id);

        // If the user has active lending data
        switch (_userLending) {
            case (?_userLending) {

                // Add the asset to active lending assets
                _ActiveLendingAssetsTable.put(_activeLendingCount, _lendData.nft.token_hash);

                // Update active lending table with asset and count
                _ActiveLendingTable.put(_lendData.nft.token_hash, _activeLendingCount);

                // Add lending data to user's active lending table
                _activeLendersTable.put(_account_id, Array.append(_userLending, [newLentData]));

                // Increment active lending count
                _activeLendingCount := _activeLendingCount + 1;
            };
            case (_) {
                // If user does not have active lending data
                // Add the asset to active lending assets
                _ActiveLendingAssetsTable.put(_activeLendingCount, _lendData.nft.token_hash);

                // Update active lending table with asset and count
                _ActiveLendingTable.put(_lendData.nft.token_hash, _activeLendingCount);

                // Add lending data to user's active lending table
                _activeLendersTable.put(_account_id, Array.make(newLentData));

                // Increment active lending count
                _activeLendingCount := _activeLendingCount + 1;
            };
        };

        // Retrieve borrower's wallet and asset
        var _borrowerWallet = _lendData.borrower_account_id;
        var _borrowerAsset = _activeBorrowersTable.get(_borrowerWallet);

        // If borrower already has assets
        switch (_borrowerAsset) {
            case (?_borrowerAsset) {
                // Add the lending data to borrower's assets
                _activeBorrowersTable.put(_borrowerWallet, Array.append(_borrowerAsset, [newLentData]));
            };
            case (_) {
                // If borrower does not have assets
                // Add the lending data to borrower's assets
                _activeBorrowersTable.put(_borrowerWallet, Array.make(newLentData));
            };
        };
        // Return true to indicate successful lending activation

        return "Loan has started successfully";
    };
    /*------------------------------------------------------------*/

    public shared (msg) func foreclosure(foreclosureData : ForeClosureData) : async TransferResponse {

        // Check if the caller is the lender
        if (foreclosureData.lender != msg.caller) {
            return #err(#Unauthorized(Principal.toText(msg.caller)));
        };

        /*
        // Check if the loan has expired
        let currentTime = Time.now();
        if (foreclosureData.lendData.timestamp >= currentTime) {
            return #err(#Other("Loan period has not expired."));
        };
        */

        // Create the TransferRequest with default values
        let request : TransferRequest = {
            to = #address(foreclosureData.lendData.lender_account_id);
            token = foreclosureData.lendData.nft.token_hash;
            notify = false;
            from = #principal(Principal.fromActor(this));
            memo = Blob.fromArray([]);
            subaccount = null;
            amount = 1;
        };
        // Create actor
        nftCanister_ := ?actor (Principal.toText(foreclosureData.lendData.nft.canister));

        let activeLendingCount = _ActiveLendingTable.get(foreclosureData.lendData.nft.token_hash);

        // Check if activeLendingCount exists
        switch (activeLendingCount) {
            case (null) {
                // Handle the case where the activeLendingCount does not exist
                // Debug.print("Error: activeLendingCount not found for the given token_hash.");
            };
            case (?count) {
                // Delete the entry from _ActiveLendingAssetsTable
                let result = _ActiveLendingAssetsTable.remove(count);

                // Find the lentData in _activeLendersTable and delete it
                let userLending = _activeLendersTable.get(foreclosureData.lendData.lender_account_id);
                switch (userLending) {
                    case (null) {
                        // Handle the case where the lender's data does not exist
                        // Debug.print("Error: Lender data not found.");
                    };

                    case (?lendings) {
                        let updatedLendings = Array.filter<LentData>(
                            lendings,
                            func(item : LentData) {
                                item.nft.token_hash != foreclosureData.lendData.nft.token_hash;
                            },
                        );
                        _activeLendersTable.put(foreclosureData.lendData.lender_account_id, updatedLendings);
                    };
                };

                // Find the lentData in _activeBorrowersTable and delete it
                let borrowerLending = _activeBorrowersTable.get(foreclosureData.lendData.borrower_account_id);
                switch (borrowerLending) {
                    case (null) {
                        // Handle the case where the borrower's data does not exist
                        // Debug.print("Error: Borrower data not found.");
                    };
                    case (?borrowings) {
                        let updatedBorrowings = Array.filter<LentData>(
                            borrowings,
                            func(item : LentData) {
                                item.nft.token_hash != foreclosureData.lendData.nft.token_hash;
                            },
                        );
                        _activeBorrowersTable.put(foreclosureData.lendData.borrower_account_id, updatedBorrowings);
                    };
                };

                // Finally, remove the entry from _ActiveLendingTable
                let result2 = _ActiveLendingTable.remove(foreclosureData.lendData.nft.token_hash);
            };
        };

        var _tokenHistoryData = _tokenHistoryTable.get(foreclosureData.lendData.nft.token_hash);

        var _historyData : HistoryData = {
            lendData = foreclosureData.lendData;
            details = "Foreclosed";
            receiver = foreclosureData.lender;
            timestamp = Time.now();
            paid_transaction_id = 0;
        };

        // If borrower already has assets
        switch (_tokenHistoryData) {
            case (?_tokenHistoryData) {
                // Add the lending data to borrower's assets
                _tokenHistoryTable.put(foreclosureData.lendData.nft.token_hash, Array.append(_tokenHistoryData, [_historyData]));
            };
            case (_) {
                // If borrower does not have assets
                // Add the lending data to borrower's assets
                _tokenHistoryTable.put(foreclosureData.lendData.nft.token_hash, Array.make(_historyData));
            };
        };
        // Perform the transfer
        let response = await Option.unwrap(nftCanister_).transfer(request);

        return response;
    };

    private func isRecentBy30Seconds(unixTimestamp: Nat64): Bool {
        // Get the current system time in seconds
        let currentTime = Time.now() / 1_000_000_000;
        
        
        let natValue : Nat = Int.abs(currentTime);       

        // Calculate the difference between the current time and the provided timestamp
        let timeDiff = natValue - Nat64.toNat(unixTimestamp);

        // Check if the difference is less than or equal to 30 seconds
        return timeDiff <= 30;
    };

    // Function to check if the loan amount has been transferred
    private func checkLoanAmountTransferred(loansettlement : LoanSettlementData) : async Bool {

        debugMessage := debugMessage # "\n " # "Inside 2 " # " " # "Calling checkLoanAmountTransferred";

        // Get the current time
        let currentTime : Nat64 = Nat64.fromIntWrap(Time.now());

        debugMessage := debugMessage # "\n " # "Inside 2 Time " # " " # Nat64.toText(currentTime);


        //let isRecent = isRecentBy30Seconds(loansettlement.transfer_time);
        let isRecent = true;

        let loanPaidCheck = (loansettlement.paid_amount >= loansettlement.lendData.loan_amount);
        if(loanPaidCheck)
        {
            addDebug("Loan is paid","info");
        }
        else
        {
            addDebug("Loan amount is low","info");
        };
        //let isRecent = true;
        if (
            loansettlement.paid_to == Principal.fromActor(this) and
            loansettlement.paid_from == loansettlement.borrower and
            loansettlement.paid_amount >= loansettlement.lendData.loan_amount and
            isRecent
        ) {
            return true;
        };
        return false;
    };

    private func isCallerLender(caller : Principal, lender : Principal) : Bool {

        debugMessage := debugMessage # "\n " # " Inside isCallerLender ";

        return (caller == lender);
    };

    private func isLoanExpired(timestamp : Int) : Bool {
        let currentTime = Time.now();
        return timestamp < currentTime;
    };

    private func addDebug(msg : Text, info : Text)  {
        debugMessage := debugMessage # "\n " # info # " : " # msg;
    };

    // Function to settle the loan
    public shared (msg) func settleLoan(loansettlement : LoanSettlementData) : async TransferResponse {


        // Check if the caller is the lender
        if (not isCallerLender(msg.caller, loansettlement.borrower)) {
            addDebug("Caller is not a Borrower","Error");
            return #err(#Unauthorized(Principal.toText(loansettlement.borrower)));
        };

        addDebug("Caller is a Borrower","Good");

        // Check if the loan amount has been transferred
        let loanAmountTransferred = await checkLoanAmountTransferred(loansettlement);

        if (not loanAmountTransferred) {
            addDebug("Loan amount has not been transferred.","Error");
            return #err(#Other("Loan amount has not been transferred."));
        };

        addDebug("Loan amount has been transferred.","Good");

        let activeLendingCount = _ActiveLendingTable.get(loansettlement.lendData.nft.token_hash);

        // Check if activeLendingCount exists
        switch (activeLendingCount) {
            case (null) {
                // Handle the case where the activeLendingCount does not exist
                // Debug.print("Error: activeLendingCount not found for the given token_hash.");
                addDebug("Error: activeLendingCount not found for the given token_hash.","Error");

            };
            case (?count) {
                // Delete the entry from _ActiveLendingAssetsTable
                let result = _ActiveLendingAssetsTable.remove(count);

                // Find the lentData in _activeLendersTable and delete it
                let userLending = _activeLendersTable.get(loansettlement.lendData.lender_account_id);
                switch (userLending) {
                    case (null) {
                        // Handle the case where the lender's data does not exist
                        // Debug.print("Error: Lender data not found.");
                        addDebug("Error: Lender data not found.","Error");

                    };

                    case (?lendings) {
                        let updatedLendings = Array.filter<LentData>(
                            lendings,
                            func(item : LentData) {
                                item.nft.token_hash != loansettlement.lendData.nft.token_hash;
                            },
                        );
                        _activeLendersTable.put(loansettlement.lendData.lender_account_id, updatedLendings);
                    };
                };

                // Find the lentData in _activeBorrowersTable and delete it
                let borrowerLending = _activeBorrowersTable.get(loansettlement.lendData.borrower_account_id);
                switch (borrowerLending) {
                    case (null) {
                        // Handle the case where the borrower's data does not exist
                        // Debug.print("Error: Borrower data not found.");              
                        addDebug("Error: Borrower data not found.","Error");

                    };
                    case (?borrowings) {
                        let updatedBorrowings = Array.filter<LentData>(
                            borrowings,
                            func(item : LentData) {
                                item.nft.token_hash != loansettlement.lendData.nft.token_hash;
                            },
                        );
                        _activeBorrowersTable.put(loansettlement.lendData.borrower_account_id, updatedBorrowings);
                    };
                };

                addDebug("Finally, remove the entry from _ActiveLendingTable","Good");

                // Finally, remove the entry from _ActiveLendingTable
                let result2 = _ActiveLendingTable.remove(loansettlement.lendData.nft.token_hash);
            };
        };

        /// await transferckBTC
        let defaultPrincipal = Principal.fromText("aaaaa-aa");
        var lenderPrincipal = await getLenderByOfferID(loansettlement.lendData.offerID);
        let _loanAmount = loansettlement.lendData.repayment_amount;

        if (lenderPrincipal == defaultPrincipal) {
            // Handle the case where the offer was not found
            addDebug("Lender ID aaaaa-aa Offer ID Not found","Error");

        } else {
            // Handle the found lender
            var result = await transferckBTC(_loanAmount, lenderPrincipal);
            var returnValue = handleResult(result);

            addDebug("Trying to transfer Amount " # Nat.toText(_loanAmount) # "To " # Principal.toText(lenderPrincipal),"info");

            var _tokenHistoryData = _tokenHistoryTable.get(loansettlement.lendData.nft.token_hash);

            var _historyData : HistoryData = {
                lendData = loansettlement.lendData;
                details = "Loan repaid";
                receiver = loansettlement.borrower;
                timestamp = Time.now();
                paid_transaction_id = returnValue;
            };

            // If borrower already has assets
            switch (_tokenHistoryData) {
                case (?_tokenHistoryData) {
                    // Add the lending data to borrower's assets
                    _tokenHistoryTable.put(loansettlement.lendData.nft.token_hash, Array.append(_tokenHistoryData, [_historyData]));
                };
                case (_) {
                    // If borrower does not have assets
                    // Add the lending data to borrower's assets
                    _tokenHistoryTable.put(loansettlement.lendData.nft.token_hash, Array.make(_historyData));
                };
            };

        };

        addDebug("NFT Transfer","info");
        // Perform the NFT transfer
        return await transferNFT(loansettlement.lendData);
    };

    private func transferNFT(lentDetails : LentData) : async TransferResponse {

        // Create the TransferRequest with default values
        let request : TransferRequest = {
            to = #address(lentDetails.borrower_account_id);
            token = lentDetails.nft.token_hash;
            notify = false;
            from = #principal(Principal.fromActor(this));
            memo = Blob.fromArray([]);
            subaccount = null;
            amount = 1;
        };
        // Create actor
        nftCanister_ := ?actor (Principal.toText(lentDetails.nft.canister));

        // Perform the transfer
        let response = await Option.unwrap(nftCanister_).transfer(request);

        return response;
    };

    /*
_assetDetailsTable
_borrowRequestTable

_ActiveLendingTable
_activeLendersTable*
_ActiveLendingAssetsTable

_activeBorrowersTable
*/
    public func setRepaymentTransferData(data : TransferredLendAmount) : async TransferredLendAmount {
        return data;
    };
    public func setRepaymentLendData(data : LentData) : async LentData {
        return data;
    };
    public func setRepaymentCheck(data : Text) : async Text {
        return data;
    };

    public func setRepayment(token_hash : Text, _repayment_details : RepaymentData) : async Bool {

        // Check if the asset is already on lending
        var isOnLending = _ActiveLendingTable.get(token_hash);
        var _borrowerWallet = _repayment_details.lenddata.borrower_account_id;
        var _lenderWallet = _repayment_details.lenddata.lender_account_id;

        var isAssetOnLending : Bool = false;

        // If the asset is on lending then only accept the Repayment
        switch (isOnLending) {
            case (?isOnLending) {

                isAssetOnLending := true;

                var assetRepaymentDetails = _RepaymentTable.get(_repayment_details.token_hash);

                switch (assetRepaymentDetails) {
                    case (?assetRepaymentDetails) {
                        _RepaymentTable.put(_repayment_details.token_hash, Array.append(assetRepaymentDetails, [_repayment_details]));
                    };
                    case (_) {
                        _RepaymentTable.put(_repayment_details.token_hash, Array.make(_repayment_details));
                    };
                };

                // Removing the Lending Status
                // Set the asset to the default 'Ask' status

                var borrowRequests = Option.unwrap(_borrowRequestTable.get(_borrowerWallet));
                var _borrowerAsset = Option.unwrap(_activeBorrowersTable.get(_borrowerWallet));
                var _activeLendingId = Option.unwrap(_ActiveLendingTable.get(token_hash));
                var _userLending = Option.unwrap(_activeLendersTable.get(_lenderWallet));

                //Remove the loan request for the asset and from the user
                _assetDetailsTable.delete(_repayment_details.token_hash);
                _borrowRequestTable.put(_borrowerWallet, Array.filter<BorrowRequest>(borrowRequests, func(x) { x.token_details.token_hash != _repayment_details.token_hash and x.account_id == _borrowerWallet }));
                _activeBorrowersTable.put(_borrowerWallet, Array.filter<LentData>(_borrowerAsset, func(x) { x.nft.token_hash != token_hash and x.borrower_account_id == _borrowerWallet }));
                _activeLendersTable.put(_lenderWallet, Array.filter<LentData>(_userLending, func(x) { x.nft.token_hash != _repayment_details.token_hash and x.lender_account_id == _lenderWallet }));
                _ActiveLendingAssetsTable.delete(_activeLendingId);
                _ActiveLendingTable.delete(token_hash);

                // Store that assets got repaid, so that lender can withdraw
                var lenderWallet = _repayment_details.lenddata.lender_account_id;
                var repaidAssets = _lenderRepaymentTable.get(lenderWallet);
                switch (repaidAssets) {
                    case (?repaidAssets) {
                        _lenderRepaymentTable.put(lenderWallet, Array.append(repaidAssets, [token_hash]));
                    };
                    case (_) {
                        _lenderRepaymentTable.put(lenderWallet, Array.make(token_hash));
                    };
                };

            };
            case (_) {
                isAssetOnLending := false;
            };
        };

        // We need to log the transaction details paid by Borrower
        var _userTransactions = _repaymentTransactionTable.get(_borrowerWallet);

        switch (_userTransactions) {
            case (?_userTransactions) {
                _repaymentTransactionTable.put(_borrowerWallet, Array.append(_userTransactions, [_repayment_details.transferRequest]));
            };
            case (_) {
                _repaymentTransactionTable.put(_borrowerWallet, Array.make(_repayment_details.transferRequest));
            };
        };

        return isAssetOnLending;
    };

    /*------------------------------------------------------------*/

    /*
 Borrow Request - Ask or Pause
 1.After supplying the assets to the Canister
 2.User can ask for Loan for the asset
 3.User is the Borrower now
 4.After the asking Loan for an asset, he can CANCEL the loan request by Pause
*/
    public func setAskRequest(_account_id : Text, _token_id : Text, _token_details : NFT_details) : async Bool {

        var _borrowRequest : Types.BorrowRequest = {
            token_id = _token_id;
            token_details = _token_details;
            account_id = _account_id;
        };
        // Check if there is already a request for Loan
        var borrowRequest = _assetDetailsTable.get(_token_id);

        switch (borrowRequest) {
            case (?borrowRequest) {
                return false;
            };
            case (_) {};
        };

        //Get all the Loan request for the user
        var _userBorrowRequests = _borrowRequestTable.get(_account_id);
        switch (_userBorrowRequests) {
            case (?_userBorrowRequests) {
                _assetDetailsTable.put(_token_id, _borrowRequest); // Global borrow Requests from all users.
                _borrowRequestTable.put(_account_id, Array.append(_userBorrowRequests, [_borrowRequest]));
            };
            case (_) {
                _assetDetailsTable.put(_token_id, _borrowRequest);
                _borrowRequestTable.put(_account_id, Array.make(_borrowRequest));
            };
        };
        return true;
    };
    public query func getAskRequest(_account_id : Text) : async [BorrowRequest] {

        var borrowRequests = _borrowRequestTable.get(_account_id);

        switch (borrowRequests) {
            case (?borrowRequests) {
                return borrowRequests;
            };
            case (_) {
                return [];
            };
        };
    };

    public query func getHistory() : async [(Text, [HistoryData])] {
        Iter.toArray(_tokenHistoryTable.entries());
    };

    public query func getTokenHistory(tokenHash : Text) : async [HistoryData] {

        var tokenHistory = _tokenHistoryTable.get(tokenHash);

        switch (tokenHistory) {
            case (?tokenHistory) {
                return tokenHistory;
            };
            case (_) {
                return [];
            };
        };
    };

    public query func getAllAskRequests() : async [(Text, BorrowRequest)] {

        _assetDetails := Iter.toArray(_assetDetailsTable.entries());

        return _assetDetails;
    };

    /*------------------------------------------------------------*/
    public func setPauseRequest(_account_id : Text, _token_id : Text) : async Nat {

        var borrowRequest = Option.unwrap(_assetDetailsTable.get(_token_id));
        var borrowRequests = Option.unwrap(_borrowRequestTable.get(_account_id));

        switch (borrowRequest) {
            case (borrowRequest) {
                //Remove token from current owner
                _assetDetailsTable.delete(_token_id);
                _borrowRequestTable.put(_account_id, Array.filter<BorrowRequest>(borrowRequests, func(x) { x.token_id != _token_id and x.account_id == _account_id }));

                return 200;
            };
            case (_) {
                return 404;
            };
        };
    };
    /*------------------------------------------------------------*/
    public func addWalletAssets(owner : Text, nft : NFT_details) : async Bool {

        var walletAssets = _walletAssetsTable.get(owner);

        switch (walletAssets) {
            case (?walletAssets) {
                _walletAssetsTable.put(owner, Array.append(walletAssets, [nft]));
                _nftCount += 1;

            };
            case (_) {
                _walletAssetsTable.put(owner, Array.make(nft));
                _nftCount += 1;
            };
        };
        return true;
    };
    public query func getWalletAssets(wallet : Text) : async ?[NFT_details] {

        var userAssets = _walletAssetsTable.get(wallet);
        return userAssets;
    };
    /**************************************************************/
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };
    public query func availableCycles() : async Nat {
        return Cycles.balance();
    };
    public func wallet_receive() : async { accepted : Nat64 } {
        let available = Cycles.available();
        let accepted = Cycles.accept(Nat.min(available, limit));
        { accepted = Nat64.fromNat(accepted) };
    };
    /**************************************************************/
};
