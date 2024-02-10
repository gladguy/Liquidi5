import { Col, Flex, Row, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { PiCopyBold } from "react-icons/pi";
import TailSpin from "react-loading-icons/dist/esm/components/tail-spin";
import icp from "../../assets/icp_logo.png";
import liquidify from "../../assets/liquidify_logo.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import Notify from "../../component/notification";
import {
  clearWalletState,
  setPlugKey,
  setPlugPrincipalId,
} from "../../redux/slice/wallet";
import { propsContainer } from "../props-container";
import { sliceAddress } from "../../utils/common";

const Mainheader = (props) => {
  const { Text } = Typography;
  const { dispatch, reduxState } = props.redux;
  const walletState = reduxState.wallet;
  const plugAddress = walletState.plug.principalId;
  const constantState = reduxState.constant;
  const IcpValue = constantState.icpvalue;
  const [copy, setCopy] = useState("Copy");

  const connectWallet = async () => {
    // PLUG
    if (window?.ic?.plug) {
      try {
        const ckBTC = process.env.REACT_APP_BTC_CANISTER_ID;
        const icp = process.env.REACT_APP_ICP_CANISTER_ID;
        // Whitelist
        const whitelist = [ckBTC, icp];
        // Host
        const host = "https://mainnet.dfinity.network";
        // Callback to print sessionData
        const onConnectionUpdate = () => {
          console.log(window.ic.plug.sessionManager.sessionData);
        };
        const publicKey = await window.ic.plug.requestConnect({
          whitelist,
          host,
          onConnectionUpdate,
          timeout: 50000,
        });
        const pId = await window.ic.plug.principalId;
        dispatch(setPlugKey(publicKey));
        dispatch(setPlugPrincipalId(pId));
      } catch (error) {
        errorMessageNotify(error.message);
      }
    } else {
      errorMessageNotify("No plug wallet installed!");
    }
  };

  const errorMessageNotify = (message) => {
    Notify("error", message);
  };

  const addressRendererWithCopy = (address) => {
    return (
      <Tooltip
        arrow
        title={copy}
        trigger={"hover"}
        color="purple"
        placement="right"
      >
        <PiCopyBold
          className="pointer"
          onClick={() => {
            navigator.clipboard.writeText(address);
            setCopy("Copied");
            setTimeout(() => {
              setCopy("Copy");
            }, 2000);
          }}
          size={20}
        />
      </Tooltip>
    );
  };

  return (
    <>
      <Row
        className="mt-15"
        justify={{
          xs: "space-between",
          lg: "space-between",
          xl: "space-between",
        }}
        align={"middle"}
      >
        <Col>
          <img
            src={liquidify}
            alt="logo"
            className="pointer"
            style={{ borderRadius: "5px" }}
            width="120dvw"
          />
        </Col>
        <Col>
          <Flex gap={5} justify="center" align="center">
            {IcpValue ? (
              <>
                <Text className="gradient-text-one font-small font-weight-700 letter-spacing-small">
                  ICP
                </Text>
                <img
                  className="round"
                  src={icp}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width="35dvw"
                />{" "}
                <Text className="gradient-text-one font-small font-weight-700 letter-spacing-small">
                  {Number(IcpValue)}
                </Text>
              </>
            ) : (
              <Loading
                spin={!IcpValue}
                indicator={
                  <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                }
              ></Loading>
            )}
          </Flex>
        </Col>
        {plugAddress && (
          <Col>
            <>
              <Text className="text-color-one font-weight-600 pointer iconalignment font-size-20">
                {sliceAddress(plugAddress, 5)}
                {addressRendererWithCopy(plugAddress)}
              </Text>
            </>
          </Col>
        )}
        <Col>
          <Flex gap={10} justify="end" align={"center"}>
            {plugAddress ? (
              <Col>
                <CustomButton
                  className="button-css lend-button"
                  title={"Sign out"}
                  onClick={() => {
                    dispatch(clearWalletState());
                  }}
                />
              </Col>
            ) : (
              <Col>
                <Row justify={"end"}>
                  <CustomButton
                    className="button-css  lend-button"
                    title={"Connect"}
                    onClick={() => {
                      connectWallet();
                    }}
                  />
                </Row>
              </Col>
            )}
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(Mainheader);
