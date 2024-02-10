import { Actor, HttpAgent } from "@dfinity/agent";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ICP_IdlFactory } from "../../ICP_canister";
import { ckBtcIdlFactory } from "../../ckBTC_canister";
import Notify from "../../component/notification";
import { headIcpApiFactory } from "../../head_icp_canister";
import {
  setCkBtcAgent,
  setHeadIcpAgent,
  setIcpAgent,
  setIcpValue,
} from "../../redux/slice/constant";
import { setPlugPrincipalId } from "../../redux/slice/wallet";
import { API_METHODS, apiUrl } from "../../utils/common";

export const propsContainer = (Component) => {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const dispatch = useDispatch();

    const reduxState = useSelector((state) => state);
    const api_agent = reduxState.constant.agent;
    const head_Icp_api_agent = reduxState.constant.headIcpAgent;
    const icp_api_agent = reduxState.constant.icpAgent;
    const ckBtcAgent = reduxState.constant.ckBtcAgent;
    const ckBtcActorAgent = reduxState.constant.ckBtcActorAgent;
    const ckEthAgent = reduxState.constant.ckEthAgent;
    const ckEthActorAgent = reduxState.constant.ckEthActorAgent;
    const withdrawAgent = reduxState.constant.withdrawAgent;
    const principalId = reduxState.wallet.plug.principalId;

    const icpPrice = async () => {
      const BtcData = await API_METHODS.get(
        `${apiUrl.Asset_server_base_url}/api/v1/fetch/IcpPrice`
      );
      return BtcData;
    };

    const fetchIcpLiveValue = async () => {
      try {
        const IcpData = await icpPrice();
        if (IcpData.data.data[0]?.length) {
          const btcValue = IcpData.data.data[0].flat();
          dispatch(setIcpValue(btcValue[1]));
        } else {
          await fetchIcpLiveValue();
        }
      } catch (error) {
        // console.log("props container", error);
        Notify("error", "Failed to fetch ckBtc");
      }
    };

    useEffect(() => {
      (async () => {
        try {
          if (window?.ic?.plug) {
            if (!ckBtcAgent && principalId) {
              // Btc canister for transactions
              const ckBtcAgent = await window.ic?.plug.createActor({
                canisterId: process.env.REACT_APP_BTC_CANISTER_ID,
                interfaceFactory: ckBtcIdlFactory,
              });

              dispatch(setCkBtcAgent(ckBtcAgent));
            }
          }
        } catch (error) {
          Notify("error", error.message);
          // console.log(error);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, principalId]);

    useEffect(() => {
      (async () => {
        try {
          if (!head_Icp_api_agent) {
            const lendingAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });
            const agent = Actor.createActor(headIcpApiFactory, {
              agent: lendingAgent,
              canisterId: process.env.REACT_APP_HEAD_ICP_CANISTER_ID,
            });
            dispatch(setHeadIcpAgent(agent));
          }
        } catch (error) {
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (async () => {
        try {
          if (window?.ic?.plug) {
            if (!icp_api_agent && principalId) {
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
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, principalId]);

    useEffect(() => {
      // fetching ICP Value
      fetchIcpLiveValue();
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
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        if (window.ic.plug.principalId !== principalId) {
          window.ic.plug.principalId &&
            principalId &&
            dispatch(setPlugPrincipalId(window.ic.plug.principalId));
        }
      })();
    }, [dispatch, principalId]);

    return (
      <Component
        {...props}
        router={{ params }}
        redux={{ dispatch, reduxState }}
        wallet={{
          api_agent,
          ckBtcAgent,
          ckEthAgent,
          withdrawAgent,
          ckBtcActorAgent,
          ckEthActorAgent,
        }}
      />
    );
  }
  return ComponentWithRouterProp;
};
