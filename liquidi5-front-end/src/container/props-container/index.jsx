import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ICP_IdlFactory } from "../../ICP_canister";
import { ckBtcIdlFactory } from "../../ckBTC_canister";
import Notify from "../../component/notification";
import {
  setApprovedCanisters,
  setApprovedCanistersObjects,
  setCkBtcAgent,
  setCkBtcValue,
  setIcpAgent,
  setIcpValue,
} from "../../redux/slice/constant";
import {
  API_METHODS,
  agentCreator,
  apiUrl,
  icpCanisterId,
} from "../../utils/common";

export const propsContainer = (Component) => {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const reduxState = useSelector((state) => state);
    const [isPlugConnected, setIsPlugConnected] = useState(false);

    const icp_api_agent = reduxState.constant.icpAgent;
    const ckBtcAgent = reduxState.constant.ckBtcAgent;
    const principalId = reduxState.wallet.plug.principalId;

    const fetchIcpLiveValue = async () => {
      try {
        let icpValue;
        const icpData = await API_METHODS.get(
          `${process.env.REACT_APP_COINGECKO_API}?ids=${process.env.REACT_APP_TICKER}&vs_currencies=usd`
        );

        if (icpData.data["internet-computer"]?.usd) {
          icpValue = icpData.data["internet-computer"]?.usd;
          dispatch(setIcpValue(icpValue));
        } else {
          fetchIcpLiveValue();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch Aptos");
      }
    };

    const fetchApprovedCollections = async () => {
      try {
        const API = agentCreator(ICP_IdlFactory, icpCanisterId);
        const approvedCollections = await API.getApprovedCollections();

        const collections = approvedCollections.map((data) => data[1]);
        let obj = {};
        approvedCollections.forEach((col) => {
          obj = {
            ...obj,
            [Number(col[0])]: col[1],
          };
        });
        dispatch(setApprovedCanistersObjects(obj));
        dispatch(setApprovedCanisters(collections));
      } catch (error) {
        console.log("error Fetch User Assets", error);
      }
    };

    const verifyConnection = async () => {
      if (principalId) {
        const connected = await window?.ic?.plug.isConnected();
        if (!connected) {
          Notify(
            "warning",
            "Please reconnect your wallet as the connection has been aborted."
          );
          setIsPlugConnected(false);
          return false;
        } else {
          setIsPlugConnected(true);
          return true;
        }
      }
    };

    const btcPrice = async () => {
      const btcData = await API_METHODS.get(
        `${apiUrl.Asset_server_base_url}/api/v1/fetch/chain/price/${process.env.REACT_APP_CHAIN_TICKER}`
      );
      return btcData;
    };

    const fetchBTCLiveValue = async () => {
      try {
        const BtcData = await btcPrice();
        if (BtcData?.data.data[0]) {
          const BtcValue = BtcData.data.data[0].current_price;
          dispatch(setCkBtcValue(BtcValue));
        } else {
          // fetchBTCLiveValue();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch ckBtc");
      }
    };

    useEffect(() => {
      (async () => {
        await fetchApprovedCollections();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [icp_api_agent]);

    useEffect(() => {
      (async () => {
        try {
          if (window?.ic?.plug) {
            if (!ckBtcAgent && principalId && isPlugConnected) {
              // Btc canister for transactions
              const ckBtcAgent = await window.ic?.plug.createActor({
                canisterId: process.env.REACT_APP_BTC_CANISTER_ID,
                interfaceFactory: ckBtcIdlFactory,
              });

              dispatch(setCkBtcAgent(ckBtcAgent));
            }
          }
        } catch (error) {
          // Notify("error", error.message);
          console.log(error);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, principalId, isPlugConnected]);

    useEffect(() => {
      (async () => {
        try {
          if (window?.ic?.plug) {
            if (!icp_api_agent && principalId && isPlugConnected) {
              const agent = await window.ic?.plug.createActor({
                interfaceFactory: ICP_IdlFactory,
                canisterId: process.env.REACT_APP_ICP_CANISTER_ID,
              });
              dispatch(setIcpAgent(agent));
            }
          } else {
            Notify("warning", "Install the Plug Wallet!");
          }
        } catch (error) {
          // Notify("error", error.message);
          console.log(error);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isPlugConnected, principalId]);

    useEffect(() => {
      // fetching ICP Value
      fetchIcpLiveValue();
      // fetching CkBtc Value
      fetchBTCLiveValue();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchIcpLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchBTCLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        await verifyConnection();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, principalId]);

    return (
      <Component
        {...props}
        router={{ params, location, navigate }}
        redux={{ dispatch, reduxState }}
        wallet={{
          ckBtcAgent,
          isPlugConnected,
        }}
      />
    );
  }
  return ComponentWithRouterProp;
};
