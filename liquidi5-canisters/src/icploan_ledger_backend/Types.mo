import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Prim "mo:⛔";

module Types {

  public type Timestamp = Nat64;
  public type Float = Prim.Types.Float;
   
    public type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformRawResponseFunction;
    };

    public type HttpHeader = {
        name : Text;
        value : Text;
    };

    public type HttpMethod = {
        #get;
        #post;
        #head;
    };

    public type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    //2. HTTPS outcalls have an optional "transform" key. These two types help describe it.
    //"The transform function may, for example, transform the body in any way, add or remove headers, 
    //modify headers, etc. "
    //See: https://internetcomputer.org/docs/current/references/ic-interface-spec/#ic-http_request
    

    //2.1 This type describes a function called "TransformRawResponse" used in line 14 above
    //"If provided, the calling canister itself must export this function." 
    //In this minimal example for a `GET` request, we declare the type for completeness, but 
    //we do not use this function. We will pass "null" to the HTTP request.
    public type TransformRawResponseFunction = {
        function : shared query TransformArgs -> async HttpResponsePayload;
        context : Blob;
    };

    //2.2 These types describes the arguments the transform function needs
    public type TransformArgs = {
        response : HttpResponsePayload;
        context : Blob;
    };

    public type CanisterHttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    public type TransformContext = {
        function : shared query TransformArgs -> async HttpResponsePayload;
        context : Blob;
    };


    //3. Declaring the IC management canister which we use to make the HTTPS outcall
    public type IC = actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    };

    public type NFT_Information = {
        canister : Principal;
        collection_name: Text;
        token_hash : Text;
        token_number: Nat;
        owner_account_id : Text;
        owner_principal : Principal;
        mime_type : Text;
    };

    //Lending Data
    public type LentData = {
        nft : NFT_Information;
        transaction_id: Text;
        borrower_account_id: Text;     // Who ever borrowing ckBTC
        lender_account_id: Text;       // Who ever lending ckBTC
        loan_amount : Nat;
        repayment_amount: Nat;
        timestamp : Int;
        offerID : Nat;
    };



    //Loan Request
    public type BorrowRequest = {
        token_id : Text;
        token_details: NFT_Information;
        account_id : Text;
    };

    //Loan Request
    public type LoanRequest = {
        name: Text;
        inscriptionid: Nat32;
        loan_amount: Float;
        loan_duration: Nat;
        apr:Nat;
        lender_profit:Float;
        platform_fee:Float;
        repayment_amount:Float;
        owner: Principal;
        bitcoin_price: Float;
    };

    public type AccountIdentifier__1 = Text;
    public type TokenIdentifier = Text;
    public type Memo = Blob;
    public type SubAccount = Blob;
    public type Balance = Nat;

    public type User = {
        #principal : Principal;
        #address : AccountIdentifier__1;
    };
    public type TransferredRequest = {
        to : User;
        token : TokenIdentifier;
        notify : Bool;
        from : User;
        memo : Memo;
        subaccount : ?SubAccount;
        amount : Balance;
        timestamp: Time.Time;
    };
   
    public type Account = { owner : Principal; subaccount : ?Blob };

/*


*/
    public type TransferredLendAmount = {

        to : Account;
        fee : ?Nat;
        memo : ?Blob;
        from_subaccount : ?Blob;
        created_at_time : ?Nat64;
        amount : Nat;
        timestamp: Time.Time;
    };

    public type RepaymentData = {
        token_hash: Text;
        borrower_account_id : Text;                  // Borrower
        transferRequest : TransferredLendAmount;
        repayment_transaction_id: Text;
        repayment_amount: Nat;
        timestamp : Nat64;
        lenddata : LentData
    };    
        
    //Loan Complete Details
    public type LoanDetails = {
        name: Text;
        inscriptionid: Nat32;
        loan_amount: Float;
        loan_duration: Nat;
        apr:Nat;
        lender_profit:Float;
        platform_fee:Float;
        repayment_amount:Float;
        owner: Principal;
        date_of_created: Time.Time;
        bitcoin_price: Float;
    };    

    //Loan is approved and Lend by lender
    public type LendRecord = {
        id: Nat;
        loan_request:LoanRequest;
        lender: Principal;
        transaction_id: Text;
        loan_start: Time.Time;
        loan_maturity: Time.Time;
        bitcoin_price: Float;
    };


    public type LoanDates = {
        transaction_id: Text;
        loan_start: Time.Time;
        loan_maturity: Time.Time;
        bitcoin_price: Float;
    };


}
