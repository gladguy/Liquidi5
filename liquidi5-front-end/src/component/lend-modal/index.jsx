import {
  Col,
  Collapse,
  Divider,
  Flex,
  Input,
  Row,
  Slider,
  Typography,
} from "antd";
import { Link as Redirect } from "react-router-dom";
import ModalDisplay from "../modal";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { FaWallet } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import { PiPlusSquareThin } from "react-icons/pi";
import { TbInfoSquareRounded } from "react-icons/tb";
import CustomButton from "../Button";
import Loading from "../loading-wrapper/secondary-loader";
import { TailSpin } from "react-loading-icons";
import { Principal } from "@dfinity/principal";
import { useState } from "react";
import { agentCreator } from "../../utils/common";
import { ICP_IdlFactory } from "../../ICP_canister";
import Notify from "../notification";
import { useSelector } from "react-redux";

const LendModal = ({
  theme,
  active,
  amountRef,
  ckBtcAgent,
  modalState,
  ckBtcValue,
  isLendEdit,
  ckBtcBalance,
  calcLendData,
  lendModalData,
  fetchAllOffers,
  fetchUserOffers,
  isPlugConnected,
  toggleLendModal,
  setLendModalData,
  collapseActiveKey,
  setCollapseActiveKey,
}) => {
  /* global BigInt */

  const { Text } = Typography;
  const ICP_canisterId = process.env.REACT_APP_ICP_CANISTER_ID;

  const walletState = useSelector((state) => state.wallet);
  const plugAddress = walletState.plug.principalId;
  const acId = walletState.plug.accountId;
  const stoicAddress = walletState.stoic.address;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const [isOfferBtnLoading, setIsOfferBtnLoading] = useState(false);

  const handleCreateOffer = async () => {
    try {
      setIsOfferBtnLoading(true);
      if (lendModalData.amount && lendModalData.sliderLTV) {
        const transferArgs = {
          to: {
            owner: Principal.fromText(ICP_canisterId),
            subaccount: [],
          },
          fee: [],
          memo: [],
          created_at_time: [],
          from_subaccount: [],
          amount: BigInt(Math.round(Number(lendModalData.amount) * BTC_ZERO)),
        };

        const payResult = await ckBtcAgent.icrc1_transfer(transferArgs);
        const amountFloat = Number(lendModalData.amount);
        const platformFeeFloat = parseFloat(lendModalData.platformFee);
        const interestFloat = parseFloat(lendModalData.interest);
        const repayment_amount = Number(
          amountFloat + platformFeeFloat + interestFloat
        );
        const fiatValue = Math.round(Number(lendModalData.amount) * ckBtcValue);

        if (payResult?.Ok) {
          const offerProps = {
            loanToValue: parseFloat(lendModalData.sliderLTV.toFixed(2)),
            terms: lendModalData.term,
            loanAmount: Math.round(amountFloat * BTC_ZERO),
            collectionID: Number(lendModalData.collectionID),
            platformFee: Math.round(platformFeeFloat * BTC_ZERO),
            lender_account_id: acId,
            loanFiatValue: fiatValue < 1 ? 1 : fiatValue,
            ckTransactionID: payResult.Ok.toString(),
            loanTime: Date.now(),
            yieldRate: Math.round(lendModalData.yield * BTC_ZERO),
            repayment_amount: Math.round(repayment_amount * BTC_ZERO),
            yieldAccured: Math.round(interestFloat * BTC_ZERO),
            lender: Principal.fromText(
              plugAddress ? plugAddress : stoicAddress
            ),
            floorValue: lendModalData.floorPrice,
            offerID: 0,
            offerStatus: true,
          };
          const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
          const newOfferResult = await API.addloanOffer(
            offerProps,
            Number(lendModalData.collectionID)
          );
          if (newOfferResult) {
            Notify("success", "Offer created successfully!");
            toggleLendModal();
            fetchAllOffers();
            fetchUserOffers();
          }
        } else {
          Notify("warning", "Amount required!");
        }
        setIsOfferBtnLoading(false);
      }
    } catch (error) {
      setIsOfferBtnLoading(false);
      console.log("create offer error", error);
    }
  };

  const handleEditLend = async () => {
    Notify("info", "We'r on it!");
  };

  return (
    <ModalDisplay
      destroyOnClose={true}
      footer={null}
      className={theme ? "" : "modal-themed"}
      title={
        <Flex align="center" gap={5} justify="start">
          <Text
            className={`${
              theme ? "light-color-gradient" : "light-color-primary"
            } font-size-20 letter-spacing-small`}
          >
            {lendModalData.collectionName}
          </Text>
          <Redirect
            target="_blank"
            to={`https://t5t44-naaaa-aaaah-qcutq-cai.raw.ic0.app/collection/${lendModalData.canister}/summary`}
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
      onCancel={toggleLendModal}
      width={"33%"}
    >
      {/* Lend Image Display */}
      <Row justify={"space-between"} className="mt-30">
        <Col md={3}>
          <img
            className="border-radius-5"
            alt={`lend_image`}
            src={lendModalData.collectionURI}
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
              Floor
            </Text>
            <Text
              className={`${
                theme ? "text-color-two" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ∞ {lendModalData.floorPrice}
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
              {lendModalData.term} Days
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
              APY
            </Text>
            <Text
              className={`${
                theme ? "text-color-two" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {lendModalData.APY}%
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Lend Divider */}
      <Row className={theme ? "themed-divider" : ""}>
        <Divider />
      </Row>

      {/* Lend Alerts */}
      {active.length && ckBtcBalance < lendModalData.amount ? (
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
      ) : (
        ""
      )}

      {lendModalData.amount > lendModalData.exceedRange && (
        <Row className="mt-15">
          <Col
            md={24}
            className={`${!theme && "redBoxLightTheme"} modalBoxRedShadow`}
          >
            <Flex align="center" gap={10}>
              <GoAlertFill size={20} color={theme ? "#d7d73c" : "#e54b64"} />
              <span className={`font-small letter-spacing-small`}>
                Close to floor price !
              </span>
            </Flex>
          </Col>
        </Row>
      )}

      {/* Lend Inputs */}
      <Row
        justify={"space-between"}
        className={
          lendModalData.amount > lendModalData.exceedRange ||
          (active.length && ckBtcBalance < lendModalData.amount)
            ? "mt-15"
            : ""
        }
      >
        <Col md={11}>
          <Flex
            vertical
            align="start"
            className={`${theme ? "" : "input-themed"} amount-input`}
          >
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              Amount
            </Text>
            <Input
              value={lendModalData.amount}
              onChange={(e) => {
                const input = e.target.value;
                const inputNumber = Number(e.target.value);

                if (isNaN(input)) {
                  return;
                }
                if (inputNumber > lendModalData.maxQuoted) {
                  return;
                }

                const { interest, platformFee } = calcLendData(inputNumber);

                const LTV = Math.round(
                  ((inputNumber * ckBtcValue) / lendModalData.nftUSD) * 100
                );

                setLendModalData((ext) => ({
                  ...ext,
                  platformFee,
                  amount: input,
                  sliderLTV: LTV,
                  interest: interest ? interest : "0.00",
                }));
              }}
              ref={amountRef}
              prefix={
                <img
                  className="round"
                  src={ckBtc}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={25}
                />
              }
              placeholder={`Max ${lendModalData.maxQuoted}`}
              size="large"
              suffix={
                <Text className={`light-color-primary font-xsmall`}>
                  $ {(lendModalData.amount * ckBtcValue).toFixed(2)}
                </Text>
              }
            />
          </Flex>
        </Col>

        <Col md={11}>
          <Flex
            vertical
            align="start"
            className={`${theme ? "" : "input-themed"}`}
          >
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              Interest
            </Text>
            <Input
              value={lendModalData.interest}
              size="large"
              readOnly
              prefix={
                <img
                  className="round"
                  src={ckBtc}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={25}
                />
              }
              suffix={
                <Text className={`light-color-primary font-xsmall`}>
                  $ {(lendModalData.interest * ckBtcValue).toFixed(2)}
                </Text>
              }
            />
          </Flex>
        </Col>
      </Row>

      {/* Lend Balance Display */}
      <Row justify={"space-between"} className="mt-3" align={"middle"}>
        <Col className="pointer">
          {active.length && (
            <Flex justify="center" gap={10} align="center">
              <Text
                className={`${
                  theme ? "gradient-text-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                Balance =
              </Text>

              {ckBtcBalance ? (
                <Text
                  className={`${
                    theme ? "text-color-one" : "light-color-primary"
                  } font-size-16 letter-spacing-small`}
                >
                  {ckBtcBalance}
                </Text>
              ) : (
                <Loading
                  spin={!ckBtcBalance}
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
                width={20}
              />
            </Flex>
          )}
        </Col>

        <Col className="pointer">
          <Flex justify="center" gap={5} align="center">
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {lendModalData.interestPerDay}%
            </Text>

            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              / day
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Lend Slider */}
      <Row justify={"space-between"} className="mt-15" align={"middle"}>
        <Col
          md={5}
          className={`${
            theme ? "border-color-dark" : ""
          } card-box box-padding-one pointer border-radius-8`}
        >
          <Flex justify="center" gap={5} align="center">
            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              LTV -
            </Text>

            <Text
              className={`${
                theme ? "gradient-text-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {lendModalData.sliderLTV}
            </Text>
          </Flex>
        </Col>
        <Col md={16}>
          <Slider
            min={1}
            className={theme ? "slider-themed" : ""}
            max={100}
            onChange={(LTV) => {
              const amount = (
                (LTV / 100) *
                Number(lendModalData.nftUSD) *
                lendModalData.oneckBtc
              ).toFixed(6);

              const { interest, platformFee } = calcLendData(amount);

              setLendModalData({
                ...lendModalData,
                amount: Number(amount),
                sliderLTV: LTV,
                platformFee,
                interest,
              });
            }}
            value={lendModalData.sliderLTV}
          />
        </Col>
        <Col md={2}>
          <PiPlusSquareThin
            className="pointer ant-popconfirm-message-icon"
            size={30}
            color="grey"
            onClick={() => {
              const LTV = lendModalData.sliderLTV + 1;
              if (LTV <= 100) {
                const amount = (
                  (LTV / 100) *
                  Number(lendModalData.nftUSD) *
                  lendModalData.oneckBtc
                ).toFixed(6);

                const interest = (
                  Number(amount) * lendModalData.interestTerm
                ).toFixed(6);

                const platformFee = ((interest * 15) / 100).toFixed(6);

                setLendModalData({
                  ...lendModalData,
                  sliderLTV: LTV,
                  platformFee,
                  amount: Number(amount),
                  interest,
                });
              }
            }}
          />
        </Col>
      </Row>

      {/* Lend Offer Summary */}
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
                    Offer Summary
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
                            } card-box padding-small-box padding-small-box font-xsmall`}
                          >
                            $ {(lendModalData.amount * ckBtcValue).toFixed(2)}
                          </Text>

                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            ~ {lendModalData.amount}
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
                            $ {(lendModalData.interest * ckBtcValue).toFixed(2)}
                          </Text>

                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            ~ {lendModalData.interest}
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
                          Platform fee
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
                            {(lendModalData.platformFee * ckBtcValue).toFixed(
                              2
                            )}
                          </Text>

                          <Text
                            className={`${
                              theme
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-size-16 letter-spacing-small`}
                          >
                            ~ {lendModalData.platformFee}
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
                          {`Once a borrower accepts the offer and the loan is
                        started, they will have ${lendModalData.term} days to repay the loan. If
                        the loan is not repaid you will receive the
                        collateral. Manage the loans in the portfolio page`}
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

      {/* Lend button */}
      <Row
        justify={active.length && isPlugConnected ? "end" : "center"}
        className={`${active.length && isPlugConnected ? "" : "border"} mt-30`}
      >
        <Col md={24}>
          {isPlugConnected && active.length ? (
            <CustomButton
              block
              loading={isOfferBtnLoading}
              className="button-css lend-button"
              title={isLendEdit ? "Edit offer" : "Create offer"}
              onClick={isLendEdit ? handleEditLend : handleCreateOffer}
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

export default LendModal;
