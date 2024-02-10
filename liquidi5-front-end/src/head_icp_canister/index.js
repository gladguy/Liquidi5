export const headIcpApiFactory = ({ IDL }) => {
    return IDL.Service({
        user_tokens: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ["query"]),
    });
};