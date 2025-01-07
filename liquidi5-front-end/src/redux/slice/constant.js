import { createSlice } from "@reduxjs/toolkit";

const state = {
  isLoading: false,
  icpvalue: null,
  icpAgent: undefined,
  ckBtcAgent: null,
  withdrawAgent: null,
  btcBalance: null,
  ckBtcValue: null,
  // Collections and Offers
  approvedCanisters: ["", "", "", "", "", "", "", "", ""],
  approvedCanistersObjects: {},
  dashboardData: {},
  allOffers: {},
  maxOffers: {},
  offers: null,
  userOffers: null,
  userAssets: null,
  userPoints: null
};

const constantSlice = createSlice({
  name: "constant",
  initialState: state,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setIcpValue: (state, action) => {
      state.icpvalue = action.payload;
    },

    setIcpAgent: (state, action) => {
      state.icpAgent = action.payload;
    },

    setCkBtcAgent: (state, action) => {
      state.ckBtcAgent = action.payload;
    },

    setBtcBalance: (state, action) => {
      state.btcBalance = action.payload;
    },

    setCkBtcValue: (state, action) => {
      state.ckBtcValue = action.payload;
    },

    setApprovedCanisters: (state, action) => {
      state.approvedCanisters = action.payload;
    },

    setApprovedCanistersObjects: (state, action) => {
      state.approvedCanistersObjects = action.payload;
    },

    setAllOffers: (state, action) => {
      state.allOffers = action.payload;
    },

    setMaxOffers: (state, action) => {
      state.maxOffers = action.payload;
    },

    setOffers: (state, action) => {
      state.offers = action.payload;
    },

    setUserOffers: (state, action) => {
      state.userOffers = action.payload;
    },

    setUserAssets: (state, action) => {
      state.userAssets = action.payload;
    },

    setUserPoints: (state, action) => {
      state.userPoints = action.payload;
    },

    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
  },
});

export const {
  setOffers,
  setLoading,
  setIcpValue,
  setIcpAgent,
  setAllOffers,
  setMaxOffers,
  setCkBtcAgent,
  setBtcBalance,
  setCkBtcValue,
  setUserOffers,
  setUserPoints,
  setUserAssets,
  setDashboardData,
  setApprovedCanisters,
  setApprovedCanistersObjects
} = constantSlice.actions;
export default constantSlice.reducer;
