import { createSlice } from "@reduxjs/toolkit";
import { STOIC_WALLET_KEY } from "../../utils/common";

const state = {
  plug: {
    key: {},
    principalId: null,
    accountId: null
  },
  stoic: {
    address: null,
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
      state.stoic = {
        address: null
      }
      if (action.payload && !state.active.includes("plug"))
        state.active.push("plug");
    },

    setPlugAccountId: (state, action) => {
      state.plug.accountId = action.payload;
    },

    setStoicAddress: (state, action) => {
      state.stoic.address = action.payload;
      state.plug = {
        key: {},
        principalId: null,
      };
      if (action.payload && !state.active.includes(STOIC_WALLET_KEY))
        state.active.push(STOIC_WALLET_KEY);
    },

    clearWalletState: (state) => {
      state.plug = {
        key: {},
        principalId: null,
      };
      state.stoic = {
        address: null
      }
      state.active = [];
    },
  },
});

export const {
  setPlugKey,
  setStoicAddress,
  setPlugAccountId,
  clearWalletState,
  setPlugPrincipalId,
} = walletSlice.actions;
export default walletSlice.reducer;
