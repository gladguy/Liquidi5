import { createSlice } from "@reduxjs/toolkit";

const state = {
  plug: {
    key: {},
    principalId: null,
  },
  active: [],
};

const walletSlice = createSlice({
  name: "wallet",
  initialState: state,
  reducers: {

    setPlugKey: (state, action) => {
      state.plug.key = action.payload;
    },

    setPlugPrincipalId: (state, action) => {
      state.plug.principalId = action.payload;
      if (action.payload && !state.active.includes("plug"))
        state.active.push("plug");
    },

    clearWalletState: (state, action) => {
      state.plug = {
        key: {},
        principalId: null,
      }
      state.active = [];
    },
  },
});

export const {
  clearWalletState,
  setPlugKey,
  setPlugPrincipalId,
} = walletSlice.actions;
export default walletSlice.reducer;
