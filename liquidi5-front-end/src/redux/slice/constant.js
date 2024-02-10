import { createSlice } from "@reduxjs/toolkit";

const state = {
  isLoading: false,
  loaderTip: "Loading...",
  collection: ["", "", "", "", "", "", "", "", "", "", "", ""],
  btcvalue: null,
  ethvalue: null,
  icpvalue: null,
  airPoints: null,
  collectionName: null,
  airDropData: {
    icpWallet:null,
    ordinalAddress:null,
    referral:null,
    timeStamp:null
  },
  isLendHeader: false,
  agent: undefined,
  headIcpAgent: undefined,
  icpAgent: undefined,
  ckBtcAgent: null,
  ckEthAgent: null,
  ckBtcActorAgent: null,
  ckEthActorAgent: null,
  withdrawAgent: null,
  affiliateCanister: null,
  LendRequests: null,
  allAssets: []
};

const constantSlice = createSlice({
  name: "constant",
  initialState: state,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setLoaderTip: (state, action) => {
      state.loaderTip = action.payload;
    },

    setCollection: (state, action) => {
      state.collection = action.payload;
    },

    setBtcValue: (state, action) => {
      state.btcvalue = action.payload;
    },

    setEthValue: (state, action) => {
      state.ethvalue = action.payload;
    },

    setIcpValue: (state, action) => {
      state.icpvalue = action.payload;
    },

    setAirDropDataAddress: (state, action) => {
      state.airDropData.ordinalAddress = action.payload.ordinalAddress;
    },
    setAirDropDataReferral:(state,action)=>{
      state.airDropData.referral=action.payload.referral;
    },
    setAirDropDataTimeStamp:(state,action)=>{
      state.airDropData.timeStamp=action.payload.timestamp;
    },
    setAirDropDataIcpWallet:(state,action)=>{
      state.airDropData.icpWallet=action.payload.icpWallet
    },

    setAirPoints: (state, action) => {
      state.airPoints = action.payload;
    },

    setCollectionName: (state, action) => {
      state.collectionName = action.payload;
    },

    setLendHeader: (state, action) => {
      state.isLendHeader = action.payload;
    },

    setAgent: (state, action) => {
      state.agent = action.payload;
    },

    setHeadIcpAgent: (state, action) => {
      state.headIcpAgent = action.payload;
    },

    setIcpAgent: (state, action) => {
      state.icpAgent = action.payload;
    },

    setwithdrawAgent: (state, action) => {
      state.withdrawAgent = action.payload;
    },

    setCkBtcAgent: (state, action) => {
      state.ckBtcAgent = action.payload;
    },

    setCkEthAgent: (state, action) => {
      state.ckEthAgent = action.payload;
    },

    setCkBtcActorAgent: (state, action) => {
      state.ckBtcActorAgent = action.payload;
    },

    setCkEthActorAgent: (state, action) => {
      state.ckEthActorAgent = action.payload;
    },

    setAffiliateCanister: (state, action) => {
      state.affiliateCanister = action.payload;
    },

    setLendRequests: (state, action) => {
      state.LendRequests = action.payload;
    },

    setAllAssets: (state, action) => {
      state.allAssets = action.payload;
    },
  },
});

export const {
  setLoading,
  setLoaderTip,
  setCollection,
  setBtcValue,
  setIcpValue,
  setAirDropDataAddress,
  setAirDropDataReferral,
  setAirDropDataTimeStamp,
  setAirDropDataIcpWallet,
  setAirPoints,
  setCollectionName,
  setLendHeader,
  setAgent,
  setLendRequests,
  setCkBtcAgent,
  setEthValue,
  setCkEthAgent,
  setCkBtcActorAgent,
  setCkEthActorAgent,
  setwithdrawAgent,
  setAllAssets,
  setHeadIcpAgent,
  setIcpAgent,
  setAffiliateCanister
} = constantSlice.actions;
export default constantSlice.reducer;
