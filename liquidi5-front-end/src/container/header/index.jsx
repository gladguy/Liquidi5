import { Principal } from "@dfinity/principal";
import { Col, Dropdown, Flex, Row, Tooltip, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { PiCopyBold } from "react-icons/pi";
import { SpinningCircles } from "react-loading-icons";
import TailSpin from "react-loading-icons/dist/esm/components/tail-spin";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import icp from "../../assets/icp_logo.png";
import liquidify_light from "../../assets/liquidify_logo_light.png";
import plugWalletImage from "../../assets/wallet_logo/plug_logo.png";
import stoicWalletImage from "../../assets/wallet_logo/stoicwallet_logo.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import Notify from "../../component/notification";
import { ICP_IdlFactory } from "../../ICP_canister";
import {
  setBtcBalance,
  setLoading,
  setUserPoints,
} from "../../redux/slice/constant";
import {
  clearWalletState,
  setPlugAccountId,
  setPlugKey,
  setPlugPrincipalId,
  setStoicAddress,
} from "../../redux/slice/wallet";
import {
  PLUG_WALLET_KEY,
  STOIC_WALLET_KEY,
  agentCreator,
  sliceAddress,
} from "../../utils/common";
import { StoicIdentity } from "../../utils/stoicwallet";
import { propsContainer } from "../props-container";

const Mainheader = (props) => {
  const { Text } = Typography;
  const { dispatch, reduxState } = props.redux;
  const { location, navigate } = props.router;
  const { ckBtcAgent } = props.wallet;

  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;
  const themes = props.theme;
  const toggler = props.toggler;

  const IcpValue = constantState.icpvalue;

  const ckBtcValue = constantState.ckBtcValue;

  const userPoints = constantState.userPoints;
  const { active } = walletState;
  const plugAddress = walletState.plug.principalId;
  const accountId = walletState.plug.accountId;
  const stoicAddress = walletState.stoic.address;

  const [ckBtcbalance, setCkBtcBalance] = useState({
    raw: 0,
    usd: 0,
  });

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ICP_canisterId = process.env.REACT_APP_ICP_CANISTER_ID;

  const connectWallet = async (wallet) => {
    // PLUG
    if (wallet === PLUG_WALLET_KEY) {
      if (window?.ic?.plug) {
        try {
          const ckBTC = process.env.REACT_APP_BTC_CANISTER_ID;
          const icp = process.env.REACT_APP_ICP_CANISTER_ID;
          // Whitelist
          const whitelist = [ckBTC, icp];
          // Host
          const host = process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST;
          // Callback to print sessionData
          const onConnectionUpdate = async () => {
            const pId = await window.ic.plug.principalId;
            const aId = await window.ic.plug.accountId;
            dispatch(setPlugKey(publicKey));
            dispatch(setPlugAccountId(aId));
            dispatch(setPlugPrincipalId(pId));
            Notify("success", "Account changed!");
          };
          dispatch(setLoading(true));
          const publicKey = await window.ic.plug.requestConnect({
            whitelist,
            host,
            onConnectionUpdate,
            timeout: 50000,
          });
          const pId = await window.ic.plug.principalId;

          const aId = await window.ic.plug.accountId;
          dispatch(setLoading(false));
          dispatch(setPlugKey(publicKey));
          dispatch(setPlugAccountId(aId));
          dispatch(setPlugPrincipalId(pId));
          Notify("success", "Plug Wallet connected!");
        } catch (error) {
          dispatch(setLoading(false));
          // errorMessageNotify(error.message);
        }
      } else {
        errorMessageNotify("No plug wallet installed!");
      }
    } else {
      let identity = null;

      try {
        dispatch(setLoading(true));
        identity = await StoicIdentity.connect();
        let pId = identity.getPrincipal();
        pId = pId.toText();
        dispatch(setStoicAddress(pId));
        dispatch(setLoading(false));
        Notify("success", "Stoic Wallet connected!");
      } catch (error) {
        dispatch(setLoading(false));
        console.log("Exception in StoicIdentity.connect", error);
      }
    }
  };

  const errorMessageNotify = (message) => {
    Notify("error", message);
  };

  const addressRendererWithCopy = (address) => {
    return (
      <Tooltip
        arrow
        title={"Copied"}
        trigger={"click"}
        color="purple"
        placement="top"
      >
        <PiCopyBold
          className="pointer"
          onClick={() => {
            navigator.clipboard.writeText(address);
          }}
          size={20}
        />
      </Tooltip>
    );
  };

  // Fetching BTC balance
  const fetchBtcAssetBalance = async () => {
    let ckBtcBalance = await ckBtcAgent.icrc1_balance_of({
      owner: Principal.fromText(plugAddress),
      subaccount: [],
    });

    if (Number(ckBtcBalance) < 99) {
      ckBtcBalance = 0;
    }

    setCkBtcBalance({
      usd: (Number(ckBtcBalance) / BTC_ZERO) * ckBtcValue,
      raw: Number(ckBtcBalance) / BTC_ZERO,
    });
    dispatch(setBtcBalance(Number(ckBtcBalance)));
  };

  const fetchUserPoints = async () => {
    const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
    const points = await API.getPoints(Principal.fromText(plugAddress));
    dispatch(setUserPoints(Number(points[0] ? points[0] : "0")));
  };

  const walletItems = [
    {
      label: (
        <Flex
          justify="center"
          gap={10}
          onClick={() => {
            connectWallet(PLUG_WALLET_KEY);
          }}
        >
          <img alt="plug" src={plugWalletImage} width={30} />
          <Text
            className={`${
              themes ? "gradient-text-one" : "light-color-primary"
            } font-small font-weight-700 letter-spacing-small`}
          >
            Plug
          </Text>
        </Flex>
      ),
      key: "0",
    },
    {
      label: (
        <Flex
          justify="center"
          gap={10}
          onClick={() => {
            connectWallet(STOIC_WALLET_KEY);
          }}
        >
          <img alt="plug" src={stoicWalletImage} width={30} />
          <Text
            className={`${
              themes ? "gradient-text-one" : "light-color-primary"
            } font-small font-weight-700 letter-spacing-small`}
          >
            Stoic
          </Text>
        </Flex>
      ),
      key: "1",
    },
  ];

  const userItems = [
    {
      label: (
        <Flex
          justify="center"
          vertical
          gap={10}
          style={{
            width: "100%",
          }}
          align="center"
        >
          <Flex gap={25} align="center">
            <img
              alt="plug"
              className={`avatar ${
                themes ? "box-shadow-black" : "box-shadow-white"
              }`}
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                plugAddress ? plugAddress : stoicAddress
              }`}
              width={50}
            />
            <Text
              className={`${
                themes ? "" : "light-color-primary"
                // themes ? "light-color-primary" : "light-color-primary"
              } text-color-one font-weight-600 pointer iconalignment font-size-20`}
            >
              {sliceAddress(plugAddress ? plugAddress : stoicAddress, 5)}
              {addressRendererWithCopy(
                plugAddress ? plugAddress : stoicAddress
              )}
            </Text>
          </Flex>
        </Flex>
      ),
      key: "0",
    },
    {
      label: (
        <Flex gap={5} justify={!accountId && "center"} align="center">
          <>
            <Text
              className={`${
                themes ? "gradient-text-one" : "light-color-primary"
              } font-small font-weight-700 letter-spacing-small`}
            >
              Account Id -
            </Text>
            {accountId ? (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-small font-weight-700 letter-spacing-small`}
              >
                {sliceAddress(accountId, 3)}
                {addressRendererWithCopy(accountId)}{" "}
              </Text>
            ) : (
              <Loading
                spin={!accountId}
                indicator={
                  <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                }
              />
            )}
          </>
        </Flex>
      ),
      key: "1",
    },
    {
      label: (
        <Flex gap={5} justify={!ckBtcbalance.raw && "center"} align="center">
          <>
            <Text
              className={`${
                themes ? "gradient-text-one" : "light-color-primary"
              } font-small font-weight-700 letter-spacing-small`}
            >
              Balance -
            </Text>
            {ckBtcbalance.raw && plugAddress ? (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-small font-weight-700 letter-spacing-small`}
              >
                {Number(ckBtcbalance.raw)}
              </Text>
            ) : (
              <Loading
                spin={!ckBtcbalance.raw}
                indicator={
                  <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                }
              />
            )}
            <img
              className="round"
              src={ckBtc}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={25}
            />
          </>
        </Flex>
      ),
      key: "2",
    },
    {
      label: (
        <Flex gap={5} justify={!ckBtcbalance.usd && "center"} align="center">
          <>
            <Text
              className={`${
                themes ? "gradient-text-one" : "light-color-primary"
              } font-small font-weight-700 letter-spacing-small`}
            >
              USD -
            </Text>
            {ckBtcbalance.usd ? (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-small font-weight-700 letter-spacing-small`}
              >
                $ {ckBtcbalance.usd.toFixed(6)}
              </Text>
            ) : (
              <Loading
                spin={!ckBtcbalance.usd}
                indicator={
                  <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                }
              />
            )}
          </>
        </Flex>
      ),
      key: "3",
    },
    {
      label: (
        <Flex gap={5} justify={!ckBtcbalance.usd && "center"} align="center">
          <>
            <Text
              className={`${
                themes ? "gradient-text-one" : "light-color-primary"
              } font-small font-weight-700 letter-spacing-small`}
            >
              Points -
            </Text>
            {userPoints !== null ? (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-small font-weight-700 letter-spacing-small`}
              >
                {userPoints / 1000}K
              </Text>
            ) : (
              <Loading
                spin={userPoints === null}
                indicator={
                  <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                }
              />
            )}
          </>
        </Flex>
      ),
      key: "4",
    },
    {
      type: "divider",
      key: "5",
    },
    {
      label: (
        <Flex
          style={{
            width: "100%",
          }}
        >
          <CustomButton
            block
            className="button-css lend-button lend-button-shine"
            title={`Switch to ${plugAddress ? "Stoic" : "Plug"} wallet`}
            onClick={() =>
              connectWallet(plugAddress ? STOIC_WALLET_KEY : PLUG_WALLET_KEY)
            }
          />
        </Flex>
      ),
      key: "6",
    },
    {
      label: (
        <Flex
          style={{
            width: "100%",
          }}
        >
          <CustomButton
            block
            className={`button-css ${themes ? "dashboardButtons-grey" : ""}`}
            title={
              <Flex align="center" justify="center" gap={10}>
                <AiOutlineDisconnect
                  size={20}
                  color={themes ? "white" : "#333333"}
                />
                <span
                  className={`${
                    !themes && "light-color-primary"
                  } text-color-one font-weight-600 pointer iconalignment font-size-16`}
                >
                  Disconnect
                </span>
              </Flex>
            }
            onClick={() => {
              dispatch(clearWalletState());
            }}
          />
        </Flex>
      ),
      key: "7",
    },
  ];

  const navigations = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Borrow",
      path: "/borrow",
    },
    {
      name: "Lend",
      path: "/lend",
    },
    {
      name: "Portfolio",
      path: "/portfolio",
    },
    {
      name: "Analytics",
      path: "/analytics",
    },
  ];

  // Fetching ckBtc asset balance
  useEffect(() => {
    if (plugAddress && ckBtcAgent) {
      fetchBtcAssetBalance();
      fetchUserPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckBtcAgent, plugAddress]);

  // // Fetching ckBtc asset balance interval of 10 sec
  // useEffect(() => {
  //   (() => {
  //     setInterval(async () => {
  //       if (plugAddress && ckBtcAgent) {
  //         fetchBtcAssetBalance();
  //       }
  //     }, [60000]);

  //     return () => clearInterval();
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [ckBtcAgent, plugAddress]);

  return (
    <>
      <Row className="mt-15" justify={"space-between"} align={"middle"}>
        <Col>
          <img
            src={liquidify_light}
            alt="logo"
            className="pointer"
            style={{ borderRadius: "5px" }}
            width={100}
          />
        </Col>

        <Col>
          <Flex gap={50}>
            {navigations.map(({ name, path }) => {
              return (
                <Text
                  key={`${name}-${path}`}
                  onClick={() => {
                    navigate(path);
                    window.scrollTo(0, 0);
                  }}
                  className={`${
                    location.pathname === path
                      ? themes
                        ? "active-page font-weight-900"
                        : "active-page-light font-weight-900"
                      : ""
                  } ${themes ? "gradient-text-one" : "light-color-primary"} ${
                    themes ? "nav-page" : "nav-page-light"
                  } pointer font-medium letter-spacing-small`}
                >
                  {name}
                </Text>
              );
            })}
          </Flex>
        </Col>

        {/* ICP value */}
        <Col>
          <Flex gap={5} justify="center" align="center">
            {IcpValue ? (
              <>
                <img
                  className="round"
                  src={icp}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={25}
                />{" "}
                <Text
                  className={`${
                    themes ? "gradient-text-one" : "light-color-primary"
                  } font-small font-weight-700 letter-spacing-small`}
                >
                  {Number(IcpValue)}
                </Text>
              </>
            ) : (
              <Loading
                spin={!IcpValue}
                indicator={
                  <SpinningCircles
                    stroke={themes ? "#6a85f1" : "#000000"}
                    alignmentBaseline="central"
                  />
                }
              ></Loading>
            )}
          </Flex>
        </Col>

        {/* ckBTC value */}
        <Col>
          <Flex gap={5} justify="center" align="center">
            {ckBtcValue ? (
              <>
                <img
                  className="round"
                  src={ckBtc}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={25}
                />{" "}
                <Text
                  className={`${
                    themes ? "gradient-text-one" : "light-color-primary"
                  } font-small font-weight-700 letter-spacing-small`}
                >
                  ${Number(ckBtcValue).toLocaleString()}
                </Text>
              </>
            ) : (
              <Loading
                spin={!ckBtcValue}
                indicator={
                  <SpinningCircles
                    stroke={themes ? "#6a85f1" : "#000000"}
                    alignmentBaseline="central"
                  />
                }
              ></Loading>
            )}
          </Flex>
        </Col>

        <Col>
          <Flex gap={25} justify="end" align={"center"}>
            <Col className="pointer">
              {themes ? (
                <div
                  className="sun theme-icon"
                  onClick={() => {
                    toggler(false);
                    localStorage.setItem("theme", JSON.stringify(false));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="#ffd43b">
                      <circle r="5" cy="12" cx="12"></circle>
                      <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                    </g>
                  </svg>
                </div>
              ) : (
                <div
                  className={`moon theme-icon`}
                  style={{
                    backgroundColor: !themes ? "#333333" : "",
                  }}
                  onClick={() => {
                    toggler(true);
                    localStorage.setItem("theme", JSON.stringify(true));
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={"#ffffff"}
                    viewBox="0 0 384 512"
                  >
                    <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                  </svg>
                </div>
              )}
            </Col>
            <Col className="dropdown-css">
              <Dropdown
                destroyPopupOnHide
                overlayStyle={{
                  background: themes ? "#332b3e" : "whitesmoke",
                  borderRadius: "8px",
                }}
                menu={{
                  items: active.length ? userItems : walletItems,
                }}
                trigger={["click"]}
              >
                {active.length ? (
                  <MdAccountCircle
                    color={themes ? "white" : "#333333"}
                    size={45}
                    className="pointer"
                  />
                ) : (
                  <CustomButton
                    className="button-css lend-button lend-button-shine"
                    title={plugAddress ? "Sign out" : "Connect"}
                  />
                )}
              </Dropdown>
            </Col>
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(Mainheader);
