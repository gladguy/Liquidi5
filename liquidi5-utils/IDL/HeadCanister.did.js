const headIdlFactory = ({ IDL }) => {
    const TokenIndex = IDL.Nat32;
    const AccountIdentifier__1 = IDL.Text;
    const TokenIdentifier = IDL.Text;

    const CommonError = IDL.Variant({
        InvalidToken: TokenIdentifier,
        Other: IDL.Text,
    });

    const Result_1 = IDL.Variant({
        ok: IDL.Vec(TokenIndex),
        err: CommonError,
    });

    return IDL.Service({
        tokens: IDL.Func([AccountIdentifier__1], [Result_1], ["query"]),
        stats: IDL.Func(
            [],
            [IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat, IDL.Nat, IDL.Nat],
            ["query"]
        ),
    });
};

module.exports = { headIdlFactory };