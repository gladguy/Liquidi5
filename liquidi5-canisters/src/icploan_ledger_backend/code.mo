import HashMap "mo:base/HashMap";

actor LoanManager {
    private var _loanOffersTable = HashMap.HashMap<Nat, [CollectionOffers]>(hashMapSize, isEq, Nat32.fromNat);
    private stable var _loanOffersData: [(Nat, [CollectionOffers])] = [];

    public type CollectionOffers = {
        offerID: Nat;
        loanAmount: Float;
        yieldRate: Float;
        terms: Nat;
        yieldAccrued: Float;
        loanToValue: Float;
        floorValue: Float;
        platformFee: Float;
        collectionID: Nat;
        ckTransactionID: Text;
        loanTime: Int;
        lender: Principal;
    };

    public type UpdateOfferParams = {
        offerID: Nat;
        collectionID: Nat;
        loanAmount: ?Float;
        yieldRate: ?Float;
        terms: ?Nat;
        yieldAccrued: ?Float;
        loanToValue: ?Float;
        floorValue: ?Float;
        platformFee: ?Float;
        offerID : Nat;
        loanAmount : Float;
        yieldRate  : Float;
        terms : Nat;
        yieldAccured : Float;
        loanToValue : Float;
        floorValue : Float;
        platformFee : Float;
        collectionID : Nat;
        ckTransactionID : Text;
        loanTime : Int;
        lender : Principal;
    };

    public func updateOffer(params: UpdateOfferParams): async Bool {


        let collectionOffersOpt = _loanOffersTable.get(params.collectionID);
        switch (collectionOffersOpt) {
            case (null) {
                // If collectionID does not exist, return false
                return false;
            };
            case (?offers) {
          
                // Filter out the offer with the given offerID using Array.filter
                let filteredOffers = Array.filter(offers, func (offer: CollectionOffers): Bool {
                    return offer.offerID != params.offerID;
                });
                if (Array.size(filteredOffers) == Array.size(offers)) {
                    // If no offer was removed (means offerID was not found), return false
                    return false;
                } else {
                    // Update the HashMap with the filtered offers
                    _loanOffersTable.put(params.collectionID, filteredOffers);
                    return true;
                };

            };
        };

        var _loanOffer : CollectionOffers = 
        {
            offerID = params.offerID;
            loanAmount = loanOffer.loanAmount;
            yieldRate  = loanOffer.yieldRate;
            terms = loanOffer.terms;
            yieldAccured = loanOffer.yieldAccured;
            loanToValue = loanOffer.loanToValue;
            floorValue = loanOffer.floorValue;
            platformFee = loanOffer.platformFee;
            ckTransactionID  = loanOffer.ckTransactionID;
            collectionID = loanOffer.collectionID;
            loanTime = offer.loanTime;
            lender = loanOffer.lender;     
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
        _offerID := _offerID + 1;
}
