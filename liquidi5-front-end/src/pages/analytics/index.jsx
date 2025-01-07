import { Principal } from "@dfinity/principal";
import {
  Col,
  DatePicker,
  Flex,
  Row,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Link from "antd/es/typography/Link";
import _ from "lodash";
import { useEffect, useState } from "react";
import NO_IMG from "../../assets/no-image.png";
import { BiWallet } from "react-icons/bi";
import { HiBeaker } from "react-icons/hi2";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { TbInfoSquareRounded } from "react-icons/tb";
import { Bars, ThreeDots } from "react-loading-icons";
import { Link as Redirect } from "react-router-dom";
import { ICP_IdlFactory } from "../../ICP_canister";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import { ckBtcIdlFactory } from "../../ckBTC_canister";
import CustomButton from "../../component/Button";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { nftCommonIdlFactory } from "../../nft_canister";
import {
  agentCreator,
  ckBtcCanisterId,
  DateTimeConverter,
  getTimeAgo,
  icpAccountId,
  icpCanisterId,
  tokenIdentifier,
} from "../../utils/common";

const ActiveLoans = (props) => {
  const { Text, Title } = Typography;
  const themes = props.theme;
  const { reduxState } = props.redux;
  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;

  const icpValue = constantState.icpvalue;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const approvedCanisters = constantState.approvedCanisters || null;
  const { active } = walletState;
  const { RangePicker } = DatePicker;

  const [canisterAssets, setCanisterAssets] = useState({});
  const [collectionTxHistory, setCollectionTxHistory] = useState({
    collectionName: "",
    initData: null,
    tokenId: "",
    data: null,
    id: 0,
  });
  const [canisterBalance, setCanisterBalance] = useState(null);
  const [txHistory, setTxHistory] = useState(null);
  const [isTxModal, setIsTxModal] = useState(false);
  const [canisterVolume, setCanisterVolume] = useState(0);
  const [collateralCount, setCollateralCount] = useState(0);
  const [collectionName, setCollectionName] = useState("");

  const AssetRedirectRender = ({ tokenId, text }) => (
    <Redirect
      target="_blank"
      to={`https://dashboard.internetcomputer.org/bitcoin/transaction/${tokenId}`}
    >
      {text ? (
        <Text className={`font-small letter-spacing-small link pointer`}>
          {text}
        </Text>
      ) : (
        <LiaExternalLinkAltSolid
          className={`${themes ? "gradient-text-one" : ""} pointer`}
          style={{ marginTop: "-4px" }}
          size={20}
        />
      )}
    </Redirect>
  );

  const txHistoryColums = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const [tokenId, array] = obj;
        const tx = array[array.length - 1];
        const canisterId = Principal.from(tx.lendData.nft.canister).toText();
        const id = Number(tx.lendData.nft.token_number);
        const collection_name = tx.lendData.nft.collection_name;

        return (
          <Flex align="center" vertical gap={5}>
            <img
              className="border-radius-5"
              onError={(e) => (e.target.src = NO_IMG)}
              alt={`analytics_collection`}
              src={`https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenId}`}
              height={70}
              width={70}
            />
            <Text
              onClick={() => {
                if (array.length) {
                  setCollectionTxHistory({
                    collectionName: collection_name,
                    initData: array.reverse(),
                    data: array.reverse(),
                    tokenId,
                    id,
                  });
                } else {
                  Notify(
                    "info",
                    "No loan transactions available at this time!"
                  );
                }
                toggleTxModal();
              }}
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small link pointer`}
            >
              {collection_name}
            </Text>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              #{id}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Amount",
      title: "Loan Amount",
      align: "center",
      dataIndex: "amount",
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const loan_amount = Number(tx.lendData.loan_amount);
        return (
          <Flex align="center" justify="center" gap={5}>
            <img
              className="round"
              src={ckBtc}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={20}
            />
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {Number(loan_amount) / BTC_ZERO}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "RepaymentAmount",
      title: "Repayment Amount",
      align: "center",
      dataIndex: "repayment_amount",
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const repayment_amount = Number(tx.lendData.repayment_amount);
        return (
          <Flex align="center" justify="center" gap={5}>
            <img
              className="round"
              src={ckBtc}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={20}
            />
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {Number(repayment_amount) / BTC_ZERO}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Date/time",
      title: "Activated on",
      align: "center",
      dataIndex: "loanDateTime",
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const startedTimestamp = Number(tx.lendData.timestamp) / 1000000;

        const time = DateTimeConverter(startedTimestamp);
        const daysCalc = getTimeAgo(startedTimestamp);
        return (
          <Flex align="center" vertical gap={5} justify="center">
            <Tooltip
              title={
                <>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[0]}
                  </Text>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[1]}
                  </Text>
                </>
              }
            >
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {daysCalc}
              </Text>
            </Tooltip>
          </Flex>
        );
      },
    },
    {
      key: "Date/time",
      title: "Closed At",
      align: "center",
      dataIndex: "repayDateTime",
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const endedTimestamp = Number(tx.timestamp) / 1000000;

        const time = DateTimeConverter(endedTimestamp);
        const daysCalc = getTimeAgo(endedTimestamp);
        return (
          <Flex align="center" vertical gap={5} justify="center">
            <Tooltip
              title={
                <>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[0]}
                  </Text>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[1]}
                  </Text>
                </>
              }
            >
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {daysCalc}
              </Text>
            </Tooltip>
          </Flex>
        );
      },
    },
    {
      key: "TransactionId",
      title: "Transaction",
      align: "center",
      dataIndex: "transaction_id",
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const txId = Number(tx.paid_transaction_id);
        return (
          <Flex align="center" vertical gap={5}>
            {txId ? (
              <AssetRedirectRender tokenId={txId} text={txId} />
            ) : (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                -
              </Text>
            )}
          </Flex>
        );
      },
    },
    {
      key: "Loan Status",
      title: "Loan Status",
      align: "center",
      dataIndex: "loan_status",
      filters: [
        {
          text: "Foreclosed",
          value: "Foreclosed",
        },
        {
          text: "Repaid",
          value: "Repaid",
        },
      ],
      onFilter: (value, record) => {
        const [, array] = record;
        const tx = array[array.length - 1];
        return value.toUpperCase() === tx.details.toUpperCase();
      },
      render: (_, obj) => {
        const [, array] = obj;
        const tx = array[array.length - 1];
        const status = tx.details;
        return (
          <Tag
            color={status === "Foreclosed" ? "error" : "green"}
            className={`font-size-16 letter-spacing-small text-upper`}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  const modalTxHistoryColums = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const canisterId = Principal.from(obj.lendData.nft.canister).toText();
        const tokenId = obj.lendData.nft.token_hash;
        return (
          <Flex align="center" vertical gap={5}>
            <img
              className="border-radius-5"
              alt={`lend_image`}
              onError={(e) => (e.target.src = NO_IMG)}
              src={`https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenId}`}
              height={70}
              width={70}
            />
          </Flex>
        );
      },
    },
    {
      key: "Amount",
      title: "Loan Amount",
      align: "center",
      dataIndex: "amount",
      render: (_, obj) => {
        const loan_amount = Number(obj.lendData.loan_amount);
        return (
          <Flex align="center" justify="center" gap={5}>
            <img
              className="round"
              src={ckBtc}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={20}
            />
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {Number(loan_amount) / BTC_ZERO}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "RepaymentAmount",
      title: "Repayment Amount",
      align: "center",
      dataIndex: "repayment_amount",
      render: (_, obj) => {
        const repayment_amount = Number(obj.lendData.repayment_amount);
        return (
          <Flex align="center" justify="center" gap={5}>
            <img
              className="round"
              src={ckBtc}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={20}
            />
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {Number(repayment_amount) / BTC_ZERO}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Date/time",
      title: "Activated At",
      align: "center",
      dataIndex: "loanDateTime",
      render: (_, obj) => {
        const startedTimestamp = Number(obj.lendData.timestamp) / 1000000;

        const time = DateTimeConverter(startedTimestamp);
        const daysCalc = getTimeAgo(startedTimestamp);
        return (
          <Flex align="center" vertical gap={5} justify="center">
            <Tooltip
              title={
                <>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[0]}
                  </Text>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[1]}
                  </Text>
                </>
              }
            >
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {daysCalc}
              </Text>
            </Tooltip>
          </Flex>
        );
      },
    },
    {
      key: "Date/time",
      title: "Closed At",
      align: "center",
      dataIndex: "repayDateTime",
      render: (_, obj) => {
        const endedTimestamp = Number(obj.timestamp) / 1000000;
        const time = DateTimeConverter(endedTimestamp);
        const daysCalc = getTimeAgo(endedTimestamp);
        return (
          <Flex align="center" vertical gap={5} justify="center">
            <Tooltip
              title={
                <>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[0]}
                  </Text>
                  <Text
                    className={`${
                      themes ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {time[1]}
                  </Text>
                </>
              }
            >
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {daysCalc}
              </Text>
            </Tooltip>
          </Flex>
        );
      },
    },
    {
      key: "TransactionId",
      title: "Transaction",
      align: "center",
      dataIndex: "transaction_id",
      render: (_, obj) => {
        const txId = Number(obj.paid_transaction_id);
        return (
          <Flex align="center" vertical gap={5}>
            {txId ? (
              <AssetRedirectRender tokenId={txId} text={txId} />
            ) : (
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                -
              </Text>
            )}
          </Flex>
        );
      },
    },
    {
      key: "Loan Status",
      title: "Loan Status",
      align: "center",
      dataIndex: "loan_status",
      filters: [
        {
          text: "Foreclosed",
          value: "Foreclosed",
        },
        {
          text: "Repaid",
          value: "Loan Repaid",
        },
      ],
      onFilter: (value, record) => {
        return value.toUpperCase() === record.details.toUpperCase();
      },
      render: (_, obj) => {
        const status = obj.details;
        return (
          <Tag
            color={status === "Foreclosed" ? "error" : "green"}
            className={`font-size-16 letter-spacing-small text-upper`}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  const fetchCanisterAssets = async () => {
    try {
      const tokens = approvedCanisters.map(async (canister) => {
        const { canisterID, collectionName, collectionURI, contentType } =
          canister;
        const canisterId = Principal.from(canisterID).toText();

        const API = agentCreator(nftCommonIdlFactory, canisterId);

        return new Promise(async (res) => {
          try {
            const result = await API.tokens(icpAccountId);
            const floorPrice = await API.stats();

            res({
              array: result.ok ? result.ok : result.err.Other,
              collectionURI,
              collectionName,
              canisterId,
              contentType,
              floorPrice,
            });
          } catch (error) {
            console.log(error);
          }
        });
      });

      const promise = await Promise.all(tokens);

      const tokenGenerations = promise.map((data) => {
        const { array, canisterId, collectionName, floorPrice } = data;
        let Ids = [];
        if (!array.includes("No tokens")) {
          Ids = Object?.values(array);
        }

        const collection = approvedCanisters.find(
          (predict) => predict.collectionName === collectionName
        );
        const tokenIds = Ids.map((id) => {
          const tokenId = tokenIdentifier(canisterId, id);
          return {
            ...collection,
            collectionName,
            canisterId,
            tokenId,
            id,
            floorPrice,
          };
        });
        return tokenIds;
      });

      const flattenedArray = [].concat(...tokenGenerations);
      const grouped = _.groupBy(flattenedArray, "collectionName");

      const data = Object.values(grouped).map((col) => {
        let volume = 0;
        const floor = Number(Number(col[0].floorPrice[3]) / BTC_ZERO);
        volume = floor * col.length;
        return { volume, collateral: col.length };
      });

      let volume = 0,
        collateral = 0;
      data.forEach((data) => {
        volume = data.volume + volume;
        collateral = collateral + data.collateral;
      });
      setCanisterVolume(volume);
      setCollateralCount(collateral);

      if (flattenedArray.length) {
        setCanisterAssets(grouped);
      } else {
        setCanisterAssets({});
      }
    } catch (error) {
      console.log("error Fetch User Assets", error);
    }
  };
  console.log(Object.entries(canisterAssets).length);

  const fetchCanisterBalance = async () => {
    const API = agentCreator(ckBtcIdlFactory, ckBtcCanisterId);
    const balance = await API.icrc1_balance_of({
      owner: Principal.fromText(icpCanisterId),
      subaccount: [],
    });

    setCanisterBalance(Number(balance) / BTC_ZERO);
  };

  const fetchTxHistory = async () => {
    try {
      const API = agentCreator(ICP_IdlFactory, icpCanisterId);
      const txs = await API.getHistory();
      setTxHistory(txs);
    } catch (error) {
      console.log("Fetching tx history error", error);
    }
  };

  const toggleTxModal = () => {
    setIsTxModal(!isTxModal);
    if (collectionTxHistory.data) {
      setCollectionTxHistory({
        collectionName: "",
        initData: null,
        tokenId: "",
        data: null,
        id: 0,
      });
    }
  };

  const handleDateChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      const filtered = collectionTxHistory.initData.filter((item) => {
        const itemDate = Math.round(Number(item.timestamp) / 1000000);
        return itemDate >= start.$d.getTime() && itemDate <= end.$d.getTime();
      });
      setCollectionTxHistory({ ...collectionTxHistory, data: filtered });
    } else {
      setCollectionTxHistory({
        ...collectionTxHistory,
        data: collectionTxHistory.initData,
      });
    }
  };

  useEffect(() => {
    (async () => {
      if (approvedCanisters?.length) {
        fetchCanisterAssets();
      }
      fetchCanisterBalance();
      fetchTxHistory();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedCanisters, active]);

  return (
    <>
      <Row>
        <Title
          level={2}
          className={themes ? "gradient-text-one" : "light-color-gradient"}
        >
          Analytics
        </Title>
      </Row>

      <Row>
        <Flex
          align="start"
          gap={5}
          className={`${
            themes ? "" : "card-border-light"
          } border pointer border-radius-8`}
        >
          <TbInfoSquareRounded
            size={22}
            color={themes ? "#adadad" : "#333333"}
          />
          <Text
            className={`${
              themes ? "text-color-two" : "light-color-primary"
            } font-small letter-spacing-small`}
          >
            Our platform enables you to unlock the value of your NFT assets by
            using them as collateral for loans. Below, you'll find a list of the
            NFTs currently held as collateral, highlighting their distinctive
            features and market value..{" "}
            <Link className="font-size-16 pointer">
              <a
                href="https://liquidify-us.gitbook.io/liquidify.us/analytics"
                target="_blank"
                rel="noreferrer"
              >
                Learn more.
              </a>
            </Link>
          </Text>
        </Flex>
      </Row>

      <Row justify={"start"} gutter={12} className="mt-15">
        <Col md={4}>
          <Flex
            gap={15}
            vertical
            className={`cards-css pointer ${
              themes
                ? "card-border-dark border-color-dark card-box-shadow-dark"
                : "card-border-light card-box-shadow-light"
            }`}
            justify="space-between"
          >
            <Flex justify="space-between" align="center">
              <Text
                className={`${
                  themes ? "gradient-text-one" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Canister Balance
              </Text>
              <BiWallet
                size={25}
                className={themes ? "icon-dark" : "icon-light"}
              />
            </Flex>

            <Flex align="center" gap={3}>
              <img
                className="round"
                src={ckBtc}
                alt="noimage"
                style={{ justifyContent: "center" }}
                width={20}
              />
              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-small letter-spacing-small`}
              >
                {canisterBalance}
              </Text>
            </Flex>
          </Flex>
        </Col>

        <Col md={4}>
          <Flex
            gap={15}
            vertical
            className={`cards-css pointer ${
              themes
                ? "card-border-dark border-color-dark card-box-shadow-dark"
                : "card-border-light card-box-shadow-light"
            }`}
            justify="space-between"
          >
            <Flex justify="space-between" align="center">
              <Text
                className={`${
                  themes ? "gradient-text-one" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Canister Volume
              </Text>
              <HiBeaker
                size={25}
                className={themes ? "icon-dark" : "icon-light"}
              />
            </Flex>

            <Flex justify="space-between" align="center" gap={3}>
              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-small letter-spacing-small`}
              >
                ∞ {canisterVolume.toFixed(3)}
              </Text>
              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-small letter-spacing-small`}
              >
                $ {(canisterVolume * icpValue).toFixed(3)}
              </Text>
            </Flex>
          </Flex>
        </Col>

        <Col md={4}>
          <Flex
            gap={15}
            vertical
            className={`cards-css pointer ${
              themes
                ? "card-border-dark border-color-dark card-box-shadow-dark"
                : "card-border-light card-box-shadow-light"
            }`}
            justify="space-between"
          >
            <Flex justify="space-between" align="center">
              <Text
                className={`${
                  themes ? "gradient-text-one" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Collateral Count
              </Text>
              <MdOutlineConfirmationNumber
                size={25}
                className={themes ? "icon-dark" : "icon-light"}
              />
            </Flex>

            <Flex align="center">
              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-small letter-spacing-small`}
              >
                #{collateralCount}
              </Text>
            </Flex>
          </Flex>
        </Col>
      </Row>

      <Row justify={"center"} className="mt-50">
        <Col md={24}>
          <Tabs
            items={[
              {
                key: "1",
                label: (
                  <Row align={"middle"}>
                    <Text
                      className={`font-weight-600 letter-spacing-medium ${
                        themes ? "text-color-one" : "light-color-primary"
                      } font-large`}
                    >
                      Collaterals
                    </Text>
                  </Row>
                ),
                children: (
                  <>
                    {/* Collaterals */}
                    <Row
                      justify={"space-between"}
                      className="mt-5"
                      align={"middle"}
                    >
                      {collectionName ? (
                        <CustomButton
                          className={`button-css ${
                            themes ? "dashboardButtons-grey" : ""
                          }`}
                          onClick={() => setCollectionName("")}
                          title={
                            <Flex align="center" justify="center" gap={10}>
                              <span
                                className={`${
                                  !themes && "light-color-primary"
                                } text-color-one font-weight-600 pointer iconalignment font-size-16`}
                              >
                                Back
                              </span>
                            </Flex>
                          }
                        />
                      ) : (
                        ""
                      )}
                    </Row>

                    {collectionName ? (
                      <Row
                        className="mt-15 m-bottom"
                        justify={canisterAssets === null ? "center" : "start"}
                        gutter={[32, 32]}
                      >
                        {canisterAssets === null ? (
                          <ThreeDots
                            stroke="#6a85f1"
                            alignmentBaseline="central"
                          />
                        ) : (
                          <>
                            {canisterAssets[collectionName].map((asset) => {
                              const {
                                id,
                                canisterId,
                                collectionName,
                                tokenId,
                              } = asset;
                              return (
                                <Col
                                  key={`${id}-${canisterId}`}
                                  md={3}
                                  className="zoom"
                                >
                                  <Row
                                    gutter={[12, 12]}
                                    justify={"space-between"}
                                    className={`cards-css pointer ${
                                      themes
                                        ? "card-border-dark cardStyle-dark border-color-dark"
                                        : "card-border-light cardStyle-light"
                                    }`}
                                  >
                                    <Col md={24}>
                                      <Flex vertical gap={2}>
                                        <img
                                          className="border-radius-5"
                                          src={`https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenId}`}
                                          alt="asset_cards"
                                          width={140}
                                          height={140}
                                        />

                                        <Text
                                          className={`${
                                            themes
                                              ? "text-color-two"
                                              : "light-color-primary"
                                          } font-small letter-spacing-small d-flex-all-center`}
                                        >
                                          {collectionName ===
                                          "Rune Specific Internet Canisters"
                                            ? "RSIC"
                                            : collectionName}
                                        </Text>

                                        <Text
                                          className={`${
                                            themes
                                              ? "text-color-two border-color-dark"
                                              : "light-color-primary"
                                          } font-small letter-spacing-small card-box box-padding-one border-radius-5 d-flex-all-center`}
                                        >
                                          #{id}
                                        </Text>
                                      </Flex>
                                    </Col>
                                  </Row>
                                </Col>
                              );
                            })}
                          </>
                        )}
                      </Row>
                    ) : (
                      <Row
                        className={
                          !Object.keys(canisterAssets).length
                            ? "mt-90"
                            : "mt-15"
                        }
                        justify={
                          !Object.keys(canisterAssets).length ||
                          !Object.entries(canisterAssets).length
                            ? "center"
                            : "start"
                        }
                        gutter={[32, 32]}
                      >
                        {Object.entries(canisterAssets).length ? (
                          <>
                            {Object.entries(canisterAssets).map((asset) => {
                              const [collectionName, assets] = asset;
                              const [_one] = assets;

                              const floorPrice = Number(
                                Number(_one.floorPrice[3]) / BTC_ZERO
                              );

                              return (
                                <>
                                  <Col
                                    md={5}
                                    onClick={() =>
                                      setCollectionName(collectionName)
                                    }
                                  >
                                    <Row
                                      className={`cards-css pointer ${
                                        themes
                                          ? "card-border-dark cardStyle-dark  border-color-dark"
                                          : "card-border-light cardStyle-light"
                                      }`}
                                    >
                                      <Col md={24}>
                                        <Flex justify="space-between">
                                          <img
                                            className="border-radius-5"
                                            src={_one.thumbnailURI}
                                            alt="asset_cards"
                                            width={145}
                                            height={145}
                                          />
                                          <Flex
                                            vertical
                                            justify="center"
                                            gap={2}
                                          >
                                            <Flex
                                              style={{
                                                alignItems: "baseline",
                                              }}
                                              justify="center"
                                              gap={3}
                                              className={`${
                                                themes
                                                  ? "text-color-two border-color-dark"
                                                  : "light-color-primary"
                                              } font-small mt-5 letter-spacing-small card-box box-padding-one border-radius-5 d-flex-all-center`}
                                            >
                                              ∞
                                              <Text
                                                className={`${
                                                  themes
                                                    ? "text-color-two"
                                                    : "light-color-primary"
                                                } font-small letter-spacing-small d-flex-all-center`}
                                              >
                                                {floorPrice}
                                              </Text>
                                            </Flex>

                                            <Text
                                              className={`${
                                                themes
                                                  ? "text-color-two border-color-dark"
                                                  : "light-color-primary"
                                              } font-small mt-5 letter-spacing-small card-box box-padding-one border-radius-5 d-flex-all-center`}
                                            >
                                              Count - #{assets?.length}
                                            </Text>
                                          </Flex>
                                        </Flex>
                                        <Text
                                          className={`${
                                            themes
                                              ? "text-color-two border-color-dark"
                                              : "light-color-primary"
                                          } font-small letter-spacing-small mt-15 card-box box-padding-one  border-radius-5 d-flex-all-center`}
                                        >
                                          {collectionName ===
                                          "Rune Specific Internet Canisters"
                                            ? "RSIC"
                                            : collectionName}
                                        </Text>{" "}
                                      </Col>
                                    </Row>
                                  </Col>
                                </>
                              );
                            })}
                          </>
                        ) : (
                          <Row justify={"center"}>
                            <Text
                              className={`${
                                themes
                                  ? "text-color-two border-color-dark"
                                  : "light-color-primary"
                              } font-medium letter-spacing-small d-flex-all-center`}
                            >
                              No Collaterals Found
                            </Text>
                          </Row>
                        )}{" "}
                      </Row>
                    )}
                  </>
                ),
              },
              {
                key: "2",
                label: (
                  <Row align={"middle"}>
                    <Text
                      className={`font-weight-600 letter-spacing-medium ${
                        themes ? "text-color-one" : "light-color-primary"
                      } font-large`}
                    >
                      {" "}
                      History
                    </Text>
                  </Row>
                ),
                children: (
                  <>
                    <TableComponent
                      rootClassName={themes && "table-theme"}
                      loading={{
                        spinning: txHistory === null,
                        indicator: <Bars />,
                      }}
                      rowKey={(e) => `${e?.tokenId}-${e?.canisterId}`}
                      tableColumns={txHistoryColums}
                      tableData={txHistory}
                      pagination={false}
                    />
                  </>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      <ModalDisplay
        footer={null}
        className={themes ? "" : "modal-themed"}
        title={
          <Flex align="center" gap={5}>
            <Text
              className={`${
                themes ? "light-color-gradient" : "light-color-primary"
              } font-size-20 letter-spacing-small`}
            >
              Loan History for{" "}
              {collectionTxHistory ? collectionTxHistory.collectionName : ""} #
              {collectionTxHistory ? Number(collectionTxHistory.id) : ""}
            </Text>
            <Redirect
              target="_blank"
              to={`https://t5t44-naaaa-aaaah-qcutq-cai.raw.ic0.app/asset/${
                collectionTxHistory ? collectionTxHistory.tokenId : ""
              }/summary`}
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
        open={isTxModal}
        onCancel={toggleTxModal}
        width={"85%"}
      >
        <Row className="mt-30">
          <Col md={5}>
            <RangePicker
              className={themes ? "picker-dark-themed" : ""}
              onChange={handleDateChange}
              size="large"
              dropdownClassName={themes ? "picker-layout-dark-themed" : ""}
            />
          </Col>
        </Row>
        <Row className="mt-30">
          <Col md={24}>
            <TableComponent
              rootClassName={themes && "table-theme"}
              loading={{
                spinning: collectionTxHistory.data === null,
                indicator: <Bars />,
              }}
              rowKey={(e) => `${e?.tokenId}-${e?.canisterId}`}
              tableColumns={modalTxHistoryColums}
              tableData={collectionTxHistory.data}
              pagination={false}
            />
          </Col>
        </Row>
      </ModalDisplay>
    </>
  );
};

export default propsContainer(ActiveLoans);
