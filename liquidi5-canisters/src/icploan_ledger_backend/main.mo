import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Prim "mo:⛔";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Utils "./Utils";

//import the custom types we have in Types.mo
import Types "Types";
import Time "mo:base/Time";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

actor class ICPLendingProtocol() = this {

  //Boxy 6696 and ICKitties 2421 stored here

  type BorrowRequest = Types.BorrowRequest;
  type LendData = Types.LendData;
  type RepaymentData = Types.RepaymentData;
  type NFT_details = Types.NFT_Information;
  type TransferredRequest = Types.TransferredRequest;
  type TransferredLendAmount = Types.TransferredLendAmount;

  let limit = 50_000_000_000_000;
  func isEqP(x: Principal, y: Principal): Bool { x == y };
  func isEq(x: Nat, y: Nat): Bool { x == y };
  
  private stable var _nftCount : Nat = 0;

  private stable var hashMapSize : Nat = 0; 

  private stable var _activeLendingCount : Nat = 0;

  private stable var _ActiveLendID  : [(Text, Nat)] = []; 
  private var _ActiveLendingTable  = HashMap.HashMap<Text, Nat>(hashMapSize, Text.equal, Text.hash);

  //Assets with Active Lending
  private stable var _ActiveLending  : [(Nat, Text)] = []; 
  private var _ActiveLendingAssetsTable  = HashMap.HashMap<Nat, Text>(hashMapSize, isEq,  Nat32.fromNat);

  //Currently Lendings that are in Active status ActiveLendTable 
  private stable var _activeLendData  :  [(Text, [LendData])] = [];
  private var _activeLendTable  = HashMap.HashMap<Text, [LendData]>(hashMapSize,  Text.equal, Text.hash);

  // Borrower and Asset Relations
  private stable var _ActiveBorrowerAssetDetails  : [(Text, [LendData])] = []; 
  private var _ActiveBorrowerAssetTable  = HashMap.HashMap<Text, [LendData]>(hashMapSize, Text.equal, Text.hash);

  //Repayment Details
  private stable var _repaymentData  :  [(Text, [RepaymentData])] = [];
  private var _RepaymentTable  = HashMap.HashMap<Text, [RepaymentData]>(hashMapSize,  Text.equal, Text.hash);

  // Whether Repayment is done for the Lendings - Account ID and Token Hash
  private stable var _repaymentDetails  :  [(Text, [Text])] = [];
  private var _lenderRepaymentTable  = HashMap.HashMap<Text, [Text]>(hashMapSize,  Text.equal, Text.hash);

/******************************************************************/

  private stable var _walletAssets  : [(Text, [NFT_details])] = []; 
  private var _walletAssetsTable  = HashMap.HashMap<Text, [NFT_details]>(hashMapSize, Text.equal,  Text.hash);
  
  // Borrow Request -- Account ID & Token Details
  private stable var _borrowRequest  :  [(Text, [BorrowRequest])] = [];
  private var _borrowRequestTable  = HashMap.HashMap<Text, [BorrowRequest]>(hashMapSize,  Text.equal, Text.hash);

  // Asset Details and Asset ID
  private stable var _assetDetails  :  [(Text, BorrowRequest)] = [];
  private var _assetDetailsTable  = HashMap.HashMap<Text, BorrowRequest>(hashMapSize,  Text.equal, Text.hash);

  // After the NFT storage store the Transactions
  private stable var _transactions  :  [(Text, [TransferredRequest])] = [];
  private var _transactionsTable  = HashMap.HashMap<Text, [TransferredRequest]>(hashMapSize,  Text.equal, Text.hash);


  // After the NFT storage store the Transactions   Account ID / Transactions
  private stable var _repaymentTransactions  :  [(Text, [TransferredLendAmount])] = [];
  private var _repaymentTransactionTable  = HashMap.HashMap<Text, [TransferredLendAmount]>(hashMapSize,  Text.equal, Text.hash);


/**************************************************************************/

  public type BorrowerAccountId = Text;


  public type AccountIdentifier__1 = Text;
  public type TokenIdentifier = Text;
  public type User = {
    #principal : Principal;
    #address : AccountIdentifier__1;
  };
  public type Memo = Blob;
  public type SubAccount = Blob;
  public type Balance = Nat;

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
      #CannotNotify : AccountIdentifier__1;
      #InsufficientBalance;
      #InvalidToken : TokenIdentifier;
      #Rejected;
      #Unauthorized : AccountIdentifier__1;
      #Other : Text;
    };
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


system func preupgrade() {
    
    _walletAssets := Iter.toArray(_walletAssetsTable.entries());
    _borrowRequest := Iter.toArray(_borrowRequestTable.entries());
    _assetDetails := Iter.toArray(_assetDetailsTable.entries()); 

    _activeLendData := Iter.toArray(_activeLendTable.entries());
    _ActiveLending := Iter.toArray(_ActiveLendingAssetsTable.entries());
    _ActiveLendID := Iter.toArray(_ActiveLendingTable.entries());     
    _ActiveBorrowerAssetDetails := Iter.toArray(_ActiveBorrowerAssetTable.entries());                       

    _repaymentData := Iter.toArray(_RepaymentTable.entries());  
    _repaymentDetails := Iter.toArray(_lenderRepaymentTable.entries()); 

    _transactions :=  Iter.toArray(_transactionsTable.entries()); 
    _repaymentTransactions :=  Iter.toArray(_repaymentTransactionTable.entries());     

};

system func postupgrade() {

    
    _borrowRequestTable := HashMap.fromIter<Text, [BorrowRequest]>(_borrowRequest.vals(),hashMapSize,  Text.equal, Text.hash);
    _assetDetailsTable  := HashMap.fromIter<Text, BorrowRequest>(_assetDetails.vals(),hashMapSize,   Text.equal, Text.hash);

    _walletAssetsTable := HashMap.fromIter<Text, [NFT_details]>(_walletAssets.vals(),hashMapSize, Text.equal,  Text.hash);

    _activeLendTable := HashMap.fromIter<Text, [LendData]>(_activeLendData.vals(),hashMapSize,  Text.equal, Text.hash);
    _ActiveLendingAssetsTable := HashMap.fromIter<Nat, Text>(_ActiveLending.vals(),hashMapSize,  isEq,  Nat32.fromNat);
    _ActiveLendingTable := HashMap.fromIter<Text, Nat>(_ActiveLendID.vals(),hashMapSize, Text.equal, Text.hash);
    _ActiveBorrowerAssetTable := HashMap.fromIter<Text, [LendData]>(_ActiveBorrowerAssetDetails.vals(),hashMapSize, Text.equal, Text.hash);    
   
    _RepaymentTable := HashMap.fromIter<Text, [RepaymentData]>(_repaymentData.vals(),hashMapSize, Text.equal, Text.hash);   
    _lenderRepaymentTable := HashMap.fromIter<Text, [Text]>(_repaymentDetails.vals(),hashMapSize, Text.equal, Text.hash);               
    
    _transactionsTable := HashMap.fromIter<Text, [TransferredRequest]>(_transactions.vals(),hashMapSize, Text.equal, Text.hash);               
    _repaymentTransactionTable := HashMap.fromIter<Text, [TransferredLendAmount]>(_repaymentTransactions.vals(),hashMapSize, Text.equal, Text.hash);    

};
public shared(msg) func getCallerPrincipal() : async Principal  {
    msg.caller;
};
/*------------------------------------------------------------*/
// Called after Lending
public shared(msg) func setTransaction(owner_account_id : Text,transferRequest: TransferredRequest) : async Bool {

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
 
public shared(msg) func resetData() : async Bool {
	
    _ActiveLendID := [];
    _ActiveLending := [];
    _activeLendData  := [];
    _assetDetails := [];
    _borrowRequest := [];

    _ActiveLendingTable := HashMap.fromIter<Text, Nat>(_ActiveLendID.vals(),hashMapSize, Text.equal, Text.hash);
    _ActiveLendingAssetsTable := HashMap.fromIter<Nat, Text>(_ActiveLending.vals(),hashMapSize,  isEq,  Nat32.fromNat);
	   
    _activeLendTable := HashMap.fromIter<Text, [LendData]>(_activeLendData.vals(),hashMapSize,  Text.equal, Text.hash);
    
    _assetDetailsTable  := HashMap.fromIter<Text, BorrowRequest>(_assetDetails.vals(),hashMapSize,   Text.equal, Text.hash);
    
    _borrowRequestTable := HashMap.fromIter<Text, [BorrowRequest]>(_borrowRequest.vals(),hashMapSize,  Text.equal, Text.hash);
  
    return true;
};
/*------------------------------------------------------------*/
public shared(msg) func getTransactions(owner_account_id : Text) : async [TransferredRequest] {
 
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
public shared(msg) func withDrawAsset(assetCanister: Text,transferRequest: TransferRequest) : async TransferResponse {

    toniqLabNFTCanister_ := ?actor(assetCanister);
    let res = await Option.unwrap(toniqLabNFTCanister_).transfer(transferRequest);
    return res;
};

public shared(msg) func checkWithdraw(assetCanister: Text) : async Principal {

    testCanister := ?actor(assetCanister);
    let res = await Option.unwrap(testCanister).transfer(assetCanister);
    return res;
};
/*------------------------------------------------------------*/
public query func getAllActiveLendings() : async  [(Nat, Text)] {
    Iter.toArray(_ActiveLendingAssetsTable.entries());
};

public shared(msg) func getAllTransactions() : async [(Text, [TransferRequest])] {

    Iter.toArray(_transactionsTable.entries());

};
/*------------------------------------------------------------*/



public query func getUserLending(_account_id : Text) : async [LendData]  {

    var _userLending = _activeLendTable.get(_account_id);
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
public shared(msg) func setActiveLending(_account_id : Text , _lendData: LendData) : async Bool  {

    
    // Check if the asset is already on lending
    var isOnLending = _ActiveLendingTable.get(_lendData.nft.token_hash);

    // If the asset is already on lending, return false
    switch (isOnLending) {
        case (?isOnLending) {
            return false; 
        };
        case (_) {
        };
    };    
    
    // Retrieve user's active lending data
    var _userLending = _activeLendTable.get(_account_id);
    
    // If the user has active lending data
    switch (_userLending) {
        case (?_userLending) {
            // Add the asset to active lending assets
            _ActiveLendingAssetsTable.put(_activeLendingCount,_lendData.nft.token_hash);
            
            // Update active lending table with asset and count
            _ActiveLendingTable.put(_lendData.nft.token_hash, _activeLendingCount);
            
            // Add lending data to user's active lending table
            _activeLendTable.put(_account_id, Array.append(_userLending, [_lendData]));
            
            // Increment active lending count
            _activeLendingCount := _activeLendingCount + 1;
        };
        case (_) {
            // If user does not have active lending data
            // Add the asset to active lending assets
            _ActiveLendingAssetsTable.put(_activeLendingCount,_lendData.nft.token_hash);
            
            // Update active lending table with asset and count
            _ActiveLendingTable.put(_lendData.nft.token_hash,_activeLendingCount);   
                            
            // Add lending data to user's active lending table
            _activeLendTable.put(_account_id, Array.make(_lendData));
            
            // Increment active lending count
            _activeLendingCount := _activeLendingCount + 1;
        };
    };

    // Retrieve borrower's wallet and asset
    var _borrowerWallet = _lendData.borrower_account_id;
    var _borrowerAsset = _ActiveBorrowerAssetTable.get(_borrowerWallet);
    
    // If borrower already has assets
    switch (_borrowerAsset) {
        case (?_borrowerAsset) {
            // Add the lending data to borrower's assets
            _ActiveBorrowerAssetTable.put(_borrowerWallet, Array.append(_borrowerAsset, [_lendData]));
        };
        case (_) {
            // If borrower does not have assets
            // Add the lending data to borrower's assets
            _ActiveBorrowerAssetTable.put(_borrowerWallet, Array.make(_lendData));
        };
    };
    // Return true to indicate successful lending activation
    
    return true;
};
/*------------------------------------------------------------*/
/*
_assetDetailsTable
_borrowRequestTable


_ActiveLendingTable
_activeLendTable*
_ActiveLendingAssetsTable

_ActiveBorrowerAssetTable
*/
public shared(msg) func setRepaymentTransferData( data: TransferredLendAmount) : async TransferredLendAmount  {
    return data;
};
public shared(msg) func setRepaymentLendData( data: LendData) : async LendData  {
    return data;
};
public shared(msg) func setRepaymentCheck( data: Text) : async Text  {
    return data;
};

public shared(msg) func setRepayment(token_hash : Text , _repayment_details: RepaymentData) : async Bool  {


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
                var _borrowerAsset = Option.unwrap(_ActiveBorrowerAssetTable.get(_borrowerWallet));
                var _activeLendingId = Option.unwrap(_ActiveLendingTable.get(token_hash));
                var _userLending = Option.unwrap(_activeLendTable.get(_lenderWallet));


                //Remove the loan request for the asset and from the user
                _assetDetailsTable.delete(_repayment_details.token_hash);
                _borrowRequestTable.put(_borrowerWallet, Array.filter<BorrowRequest>(borrowRequests, func(x) {x.token_details.token_hash != _repayment_details.token_hash and x.account_id == _borrowerWallet}));
                _ActiveBorrowerAssetTable.put(_borrowerWallet, Array.filter<LendData>(_borrowerAsset, func(x) {x.nft.token_hash != token_hash and x.borrower_account_id == _borrowerWallet}));
                _activeLendTable.put(_lenderWallet, Array.filter<LendData>(_userLending, func(x) {x.nft.token_hash != _repayment_details.token_hash and x.lender_account_id == _lenderWallet}));
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
public shared(msg) func setAskRequest(_account_id : Text , _token_id : Text, _token_details : NFT_details) : async Bool  {

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
        case (_) {
        };
    };    
    
    //Get all the Loan request for the user
    var _userBorrowRequests = _borrowRequestTable.get(_account_id);
    switch (_userBorrowRequests) {
        case (?_userBorrowRequests) {
            _assetDetailsTable.put(_token_id,_borrowRequest); // Global borrow Requests from all users.
            _borrowRequestTable.put(_account_id, Array.append(_userBorrowRequests, [_borrowRequest]));
        };
        case (_) {
            _assetDetailsTable.put(_token_id,_borrowRequest);        
            _borrowRequestTable.put(_account_id, Array.make(_borrowRequest));
        };
    };
    return true;
};
public query func getAskRequest(_account_id : Text) : async [BorrowRequest]  {

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
public query func getAllAskRequests() : async  [(Text, BorrowRequest)] {

    _assetDetails := Iter.toArray(_assetDetailsTable.entries());

    return _assetDetails;
};

/*------------------------------------------------------------*/
public shared(msg) func setPauseRequest(_account_id : Text , _token_id : Text) : async Nat  {


    var borrowRequest = Option.unwrap(_assetDetailsTable.get(_token_id));
    var borrowRequests = Option.unwrap(_borrowRequestTable.get(_account_id));

     switch (borrowRequest) {
        case (borrowRequest) {
            //Remove token from current owner 
            _assetDetailsTable.delete(_token_id);
            _borrowRequestTable.put(_account_id, Array.filter<BorrowRequest>(borrowRequests, func(x) {x.token_id != _token_id and x.account_id == _account_id}));

            return 200; 
        };
        case (_) {
            return 404;
        };
    };
};
/*------------------------------------------------------------*/
public shared(msg) func addWalletAssets(owner : Text, nft : NFT_details) : async Bool  {

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
  public func wallet_receive() : async { accepted: Nat64 } 
  {
      let available = Cycles.available();
      let accepted = Cycles.accept(Nat.min(available, limit));
      { accepted = Nat64.fromNat(accepted) };
  };  
  /**************************************************************/
};
