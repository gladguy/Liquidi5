import { Principal } from "@dfinity/principal";
import { Col, Collapse, Divider, Flex, Row, Typography } from "antd";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { TbInfoSquareRounded } from "react-icons/tb";
import { Link as Redirect } from "react-router-dom";
import { ICP_IdlFactory } from "../../ICP_canister";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import { nftCommonIdlFactory } from "../../nft_canister";
import {
  daysCalculator,
  getSubAccountArray,
  icpAgentCreator,
  icpCanisterId,
} from "../../utils/common";
import CustomButton from "../Button";
import { CardDisplay } from "../card";
import ModalDisplay from "../modal";
import Notify from "../notification";

const BorrowModal = ({
  theme,
  active,
  modalState,
  ckBtcValue,
  walletState,
  fetchAllOffers,
  fetchUserOffers,
  borrowModalData,
  isPlugConnected,
  toggleBorrowModal,
  collapseActiveKey,
  setBorrowModalData,
  setCollapseActiveKey,
}) => {
  const { Text } = Typography;
  const { plug, stoic } = walletState;
  const plugAddress = plug.principalId;
  const acId = plug.accountId;
  const stoicAddress = stoic.address;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const [btnLoading, setBtnLoading] = useState(false);

  const address = plugAddress ? plugAddress : stoicAddress;

  const handleBorrowOffer = async () => {
    if (!borrowModalData.collateral) {
      Notify("warning", "Please choose a collateral to proceed!");
    } else {
      try {
        const API = await icpAgentCreator(ICP_IdlFactory, icpCanisterId);
        const props = {
          collectionID: Number(borrowModalData?.collectionID),
          borrowerPrincipal: Principal.fromText(address),
          borrowerAccountID: acId,
          offerID: Number(borrowModalData?.offerID),
          token_hash: borrowModalData.collateral.tokenId,
          token_number: borrowModalData.collateral.id,
          canisterID: Principal.fromText(borrowModalData.collateral.canisterId),
        };
        setBtnLoading(true);
        await API.addCollateralTransfer(props);

        // Transfer collateral
        const transferArgs = {
          to: {
            principal: Principal.fromText("ibuvb-6aaaa-aaaam-ab6ea-cai"),
          },
          token: borrowModalData.collateral.tokenId,
          notify: false,
          from: { principal: Principal.fromText(plugAddress) },
          memo: [],
          subaccount: [getSubAccountArray(0)],
          amount: 1,
        };

        const transferAPI = await icpAgentCreator(
          nftCommonIdlFactory,
          borrowModalData.collateral.canisterId
        );

        // Intimate succession
        const transferResult = await transferAPI.transfer(transferArgs);

        if (transferResult.ok) {
          Notify("success", "Collateral transferred!");
        }

        const result = await API.transferComplete(props);
        Notify("success", result);
        toggleBorrowModal();
        fetchUserOffers();
        fetchAllOffers();
        setBtnLoading(false);

        // Notify("info", "We'r on it!");
      } catch (error) {
        setBtnLoading(false);
        console.log("error borrow modal", error);
      }
    }
  };

  return (
    <ModalDisplay
      footer={null}
      className={theme ? "" : "modal-themed"}
      title={
        <Flex align="center" gap={5} justify="start">
          <Text
            className={`${
              theme ? "light-color-gradient" : "light-color-primary"
            } font-size-20 letter-spacing-small`}
          >
            {borrowModalData.collectionName}
          </Text>
          <Redirect
            target="_blank"
            to={`https://t5t44-naaaa-aaaah-qcutq-cai.raw.ic0.app/collection/${borrowModalData.canisterId}/summary`}
          >
            <LiaExternalLinkAltSolid
              color="grey"
              className="pointer"
              style={{ marginTop: "-4px" }}
              size={20}
            />
          </Redirect>
        </Flex>
      }
      open={modalState}
      onCancel={toggleBorrowModal}
      width={"35%"}
    >
      {/* Borrow Image Display */}
      <Row justify={"space-between"} className="mt-30">
        <Col md={3}>
          <img
            className="border-radius-5"
            alt={`Borrow_image`}
            src={borrowModalData.thumbnailURI}
            width={63}
          />
        </Col>

        <Col md={6}>
          <Flex
            vertical
            justify="center"
            align="center"
            gap={5}
            className={`${
              theme ? "border-color-dark" : "light-bg-primary"
            } card-box box-padding-one pointer border-radius-8`}
          >
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-small letter-spacing-small`}
            >
              Offer
            </Text>
            <Text
              className={`${
                theme ? "text-color-two" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ₿ {Number(borrowModalData.loanAmount) / BTC_ZERO}
            </Text>
          </Flex>
        </Col>

        <Col md={6}>
          <Flex
            vertical
            justify="center"
            align="center"
            gap={5}
            className={`${
              theme ? "border-color-dark" : "light-bg-primary"
            } card-box box-padding-one pointer border-radius-8`}
          >
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-small letter-spacing-small`}
            >
              Term
            </Text>
            <Text
              className={`${
                theme ? "text-color-two" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {Number(borrowModalData.terms)} Days
            </Text>
          </Flex>
        </Col>

        <Col md={6}>
          <Flex
            vertical
            justify="center"
            align="center"
            gap={5}
            className={`${
              theme ? "border-color-dark" : "light-bg-primary"
            } card-box box-padding-one pointer border-radius-8`}
          >
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-small letter-spacing-small`}
            >
              LTV
            </Text>
            <Text
              className={`${
                theme ? "text-color-two" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {borrowModalData.loanToValue}%
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Borrow Divider */}
      <Row className={theme ? "themed-divider" : ""}>
        <Divider />
      </Row>

      {/* Borrow Alerts */}
      {/* {ckBtcBalance < Number(borrowModalData.loanAmount) && (
        <Row>
          <Col
            md={24}
            className={`${!theme && "redBoxLightTheme"} modalBoxRedShadow`}
          >
            <Flex align="center" gap={10}>
              <FaWallet size={20} color={theme ? "#d7d73c" : "#e54b64"} />
              <span className={`font-small letter-spacing-small`}>
                Insufficient ckBTC !
              </span>
            </Flex>
          </Col>
        </Row>
      )} */}

      <Flex
        align={"center"}
        gap={5}
        // className={`${
        //   ckBtcBalance < Number(borrowModalData.loanAmount) ? "mt-15" : ""
        // }`}
      >
        <Text
          className={`${
            theme ? "gradient-text-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          Select Collateral{" "}
        </Text>
        <FaCaretDown color={theme ? "#adadad" : "#333333"} />
      </Flex>

      {/* Borrow collateral display */}
      <Row
        className={`${
          theme ? "card-border-dark" : "card-border-light scroll-themed"
        } mt-15 card-box border-radius-${
          borrowModalData?.assets?.length > 3 ? "5" : "8"
        } padding-15`}
        gutter={[0, 20]}
        style={{
          maxHeight: "250px",
          overflowY: borrowModalData?.assets?.length >= 3 && "scroll",
          columnGap: "50px",
        }}
      >
        {borrowModalData?.assets?.length ? (
          <>
            {borrowModalData.assets?.map((asset) => {
              const { canisterId, tokenId, id } = asset;
              return (
                <Col
                  md={6}
                  className="p-relative"
                  key={`${canisterId}-${tokenId}`}
                >
                  <div
                    onClick={() =>
                      setBorrowModalData((ext) => ({
                        ...ext,
                        collateral: asset,
                      }))
                    }
                    className={`selection-css pointer ${
                      id === borrowModalData.collateral?.id
                        ? theme
                          ? "selected-dark card-selected"
                          : "selected-light card-selected light-color-primary"
                        : theme
                        ? "card-unselected unselected-dark"
                        : "card-unselected light-color-primary"
                    }`}
                  >
                    {id === borrowModalData.collateral?.id
                      ? "Selected"
                      : "Select"}
                  </div>

                  <CardDisplay
                    onClick={() =>
                      setBorrowModalData((ext) => ({
                        ...ext,
                        collateral: asset,
                      }))
                    }
                    className={`${
                      theme ? "themed-card-dark" : "themed-card-light"
                    } ${
                      id === borrowModalData.collateral?.id
                        ? theme
                          ? "card-box-shadow-dark"
                          : "card-box-shadow-light"
                        : ""
                    } pointer`}
                    cover={
                      borrowModalData.contentType === "text/html" ? (
                        <iframe
                          title="cards"
                          src={`https://${canisterId}.raw.icp0.io/?tokenid=${tokenId}`}
                          alt="noimg"
                          width={140}
                          height={140}
                        />
                      ) : (
                        <img
                          alt="asset_img"
                          src={`https://${canisterId}.raw.icp0.io/?tokenid=${tokenId}`}
                        />
                      )
                    }
                  >
                    <Flex justify="center">
                      <Text
                        className={`${
                          theme ? "gradient-text-one" : "light-color-primary"
                        } font-small letter-spacing-small`}
                      >
                        #{id}{" "}
                      </Text>
                    </Flex>
                  </CardDisplay>
                </Col>
              );
            })}
          </>
        ) : (
          <Text
            className={`${
              theme ? "text-color-two" : "light-color-primary"
            } font-small letter-spacing-small`}
          >
            You don't have any collateral for this collection!.
          </Text>
        )}
      </Row>

      {borrowModalData.amount > borrowModalData.floorPrice && (
        <Row className="mt-15">
          <Col
            md={24}
            className={`${!theme && "redBoxLightTheme"} modalBoxRedShadow`}
          >
            <Flex align="center" gap={10}>
              <GoAlertFill size={20} color={theme ? "#d7d73c" : "#e54b64"} />
              <span className={`font-small letter-spacing-small`}>
                The amount surpasses the floor price !
              </span>
            </Flex>
          </Col>
        </Row>
      )}

      {/* Borrow Summary */}
      <Row className="mt-30">
        <Col md={24} className={theme ? "" : "themed-collapse"}>
          <Collapse
            size="small"
            defaultActiveKey={["2"]}
            activeKey={collapseActiveKey}
            onChange={() => {
              if (collapseActiveKey[0] === "2") {
                setCollapseActiveKey(["1"]);
              } else {
                setCollapseActiveKey(["2"]);
              }
            }}
            items={[
              {
                key: "1",
                label: (
                  <Text
                    className={`${
                      theme ? "gradient-text-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    Borrow Summary
                  </Text>
                ),
                children: (
                  <>
                    <Row justify={"space-between"}>
                      <Col>
                        <Text
                          className={`${
                            theme ? "gradient-text-one" : "light-color-primary"
                          } font-size-16 letter-spacing-small`}
                        >
                          Loan amount
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`${
                              theme
                                ? "border-color-dark text-color-two"
                                : "light-color-primary"
                            } card-box padding-small-box font-xsmall`}
                          >
                            ${" "}
                            {(
                              (Number(borrowModalData.loanAmount) / BTC_ZERO) *
                              ckBtcValue
                            ).toFixed(2)}
                          </Text>

                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            ~ {Number(borrowModalData.loanAmount) / BTC_ZERO}
                          </Text>
                          <img
                            className="round"
                            src={ckBtc}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width={25}
                          />
                        </Flex>
                      </Col>
                    </Row>

                    <Row justify={"space-between"} className="mt-5">
                      <Col>
                        <Text
                          className={`${
                            theme ? "gradient-text-one" : "light-color-primary"
                          } font-size-16 letter-spacing-small`}
                        >
                          Interest
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`${
                              theme
                                ? "border-color-dark text-color-two"
                                : "light-color-primary"
                            } card-box padding-small-box font-xsmall`}
                          >
                            ${" "}
                            {(
                              (Number(borrowModalData.yieldAccured) /
                                BTC_ZERO) *
                              ckBtcValue
                            ).toFixed(2)}
                          </Text>

                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            ~ {Number(borrowModalData.yieldAccured) / BTC_ZERO}
                          </Text>
                          <img
                            className="round"
                            src={ckBtc}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width={25}
                          />
                        </Flex>
                      </Col>
                    </Row>

                    <Row justify={"space-between"} className="mt-5">
                      <Col>
                        <Text
                          className={`${
                            theme ? "gradient-text-one" : "light-color-primary"
                          } font-size-16 letter-spacing-small`}
                        >
                          Due by
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            {
                              daysCalculator(
                                Date.now(),
                                Number(borrowModalData.terms)
                              ).dateTimeString
                            }
                          </Text>
                        </Flex>
                      </Col>
                    </Row>

                    <Row className="mt-5">
                      <Col>
                        <span
                          className={`${
                            theme
                              ? "border-color-dark text-color-two"
                              : "light-color-primary"
                          } font-xsmall`}
                        >
                          <TbInfoSquareRounded
                            size={12}
                            color={theme ? "#adadad" : "#333333"}
                          />{" "}
                          {`If you fail to repay the full repayment amount
                          ₿ ${
                            Number(borrowModalData.loanAmount) / BTC_ZERO
                          } to the lender within ${Number(
                            borrowModalData.terms
                          )} days, your loan will
                          expire and default. The lender will be able to obtain
                          the collateral. Manage your loans in the portfolio
                          page.`}
                        </span>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      {/* Borrow button */}
      <Row
        justify={active.length && isPlugConnected ? "end" : "center"}
        className={`${active.length && isPlugConnected ? "" : "border"} mt-30`}
      >
        <Col md={24}>
          {isPlugConnected && active.length ? (
            <CustomButton
              block
              title={"Borrow"}
              loading={btnLoading}
              onClick={handleBorrowOffer}
              className="button-css lend-button"
            />
          ) : (
            <Flex justify="center">
              <Text
                className={`${
                  theme ? "text-color-two" : "light-color-primary"
                } font-small letter-spacing-small`}
              >
                {active.length && !isPlugConnected
                  ? "Reconnect wallet to continue"
                  : "Connect wallet to continue"}
              </Text>
            </Flex>
          )}
        </Col>
      </Row>
    </ModalDisplay>
  );
};

export default BorrowModal;
