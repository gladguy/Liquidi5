import { Principal } from "@dfinity/principal";
import {
  Col,
  Divider,
  Flex,
  Popconfirm,
  Row,
  Segmented,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Link from "antd/es/typography/Link";
import { useEffect, useState } from "react";
import { AiOutlineAppstore, AiOutlineBars } from "react-icons/ai";
import { FaCopy, FaHandHoldingUsd } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FiArrowDownLeft } from "react-icons/fi";
import { HiMiniReceiptPercent } from "react-icons/hi2";
import { IoTimer } from "react-icons/io5";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { LuRefreshCw } from "react-icons/lu";
import { MdArrowOutward, MdDeleteForever } from "react-icons/md";
import { TbInfoSquareRounded, TbMoneybag } from "react-icons/tb";
import { ThreeDots } from "react-loading-icons";
import Bars from "react-loading-icons/dist/esm/components/bars";
import { Link as Redirect } from "react-router-dom";
import { ICP_IdlFactory } from "../../ICP_canister";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import {
  setDashboardData,
  setLoading,
  setUserAssets,
  setUserOffers,
} from "../../redux/slice/constant";
import {
  DateTimeConverter,
  agentCreator,
  daysCalculator,
  getRemainingTime,
  getTimeAgo,
  icpAgentCreator,
  icpCanisterId,
  sliceAddress,
} from "../../utils/common";

const Portfolio = (props) => {
  /* global BigInt */
  const { Text, Title } = Typography;
  const themes = props.theme;
  const fetchUserOffers = props.fetchUserOffers;
  const fetchUserAssets = props.fetchUserAssets;
  const { isPlugConnected, ckBtcAgent } = props.wallet;
  const { reduxState, dispatch } = props.redux;

  const active = reduxState.wallet.active;
  const plugAddress = reduxState.wallet.plug.principalId;
  const acId = reduxState.wallet.plug.accountId;
  const userAssets = reduxState.constant.userAssets;
  const icpvalue = reduxState.constant.icpvalue;
  const userOffers = reduxState.constant.userOffers;
  const dashboardData = reduxState.constant.dashboardData;
  const approvedCollectionObj = reduxState.constant.approvedCanistersObjects;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const [detailedViewCheckBox, setDetailedViewCheckBox] = useState(false);
  const [displayType, setDisplayType] = useState("cards");
  const [ckBtcTransactions, setCkBtcTransactions] = useState(null);
  const [userCkBtcBalance, setUserCkBtcBalance] = useState(null);

  const [page, setPage] = useState("Assets");
  const [lendingData, setLendingData] = useState(null);
  const [borrowingData, setBorrowingData] = useState(null);

  const TooltipRender = ({ text }) => (
    <Tooltip trigger={"click"} title="Copied">
      <FaCopy
        size={15}
        className="pointer"
        onClick={() => {
          navigator.clipboard.writeText(text);
        }}
      />
    </Tooltip>
  );

  const AssetRedirectRender = ({ tokenId, text }) => (
    <Redirect
      target="_blank"
      to={
        text
          ? `https://dashboard.internetcomputer.org/bitcoin/transaction/${tokenId}`
          : `https://t5t44-naaaa-aaaah-qcutq-cai.raw.ic0.app/asset/${tokenId}/summary`
      }
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

  const deleteUserOffer = async (offer) => {
    try {
      const API = await icpAgentCreator(ICP_IdlFactory, icpCanisterId);
      const props = {
        collectionID: Number(offer?.collectionID),
        lenderPrincipal: offer.lender,
        lenderAccountID: offer.lender_account_id,
        offerID: Number(offer?.offerID),
      };
      const result = await API.deleteOffer(props);
      if (result) {
        Notify("success", "Offer deleted successfully!");
      }
      fetchUserOffers();
    } catch (error) {
      console.log("Offer deletion error", error);
    }
  };

  const portfolioCards = [
    {
      title: "Active Lendings",
      icon: FaHandHoldingUsd,
      value: Number(dashboardData.activeLendings),
    },
    {
      title: "Active Borrowings",
      icon: FiArrowDownLeft,
      value: Number(dashboardData.activeBorrows),
    },
    {
      title: "Completed Loans",
      icon: TbMoneybag,
      value: Number(dashboardData.completedLoans),
    },
    {
      title: "Lendings Value",
      icon: FaMoneyBillTrendUp,
      value: 0.00757896,
      // value: Number(dashboardData.lendingValue),
    },
    {
      title: "Borrowings Value",
      icon: FaMoneyBillTrendUp,
      value: 0.00757896,
      // value: Number(dashboardData.borrowValue),
    },
    {
      title: "Profit Earned",
      icon: HiMiniReceiptPercent,
      value: Number(dashboardData.profitEarned),
    },
  ];

  const approvedAssetsColumns = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => (
        <Flex align="center" vertical>
          <img
            className="border-radius-5"
            alt={`lend_image`}
            src={`https://${obj.canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${obj.tokenId}`}
            height={70}
            width={70}
          />
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj.collectionName}
          </Text>
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            #{obj.id}
          </Text>
        </Flex>
      ),
    },
    {
      key: "Floor",
      title: "Floor",
      align: "center",
      dataIndex: "floor",
      render: (_, obj) => {
        const floorPrice = Number(obj.floorPrice[3]) / BTC_ZERO;

        return (
          <Flex align="center" vertical gap={5}>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ∞ {floorPrice}{" "}
            </Text>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              $ {(floorPrice * icpvalue).toFixed(2)}{" "}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "CanisterId",
      title: "Canister",
      align: "center",
      dataIndex: "canisterId",
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {sliceAddress(obj.canisterId)}{" "}
            <TooltipRender text={obj.canisterId} />
          </Text>
        );
      },
    },
    {
      key: "action",
      title: " ",
      align: "center",
      dataIndex: "borrow",
      render: (_, obj) => (
        <Flex vertical justify="center">
          <Text
            className={`${
              themes ? "gradient-text-one" : "light-color-primary"
            } font-small letter-spacing-small`}
          >
            View
          </Text>
          <AssetRedirectRender tokenId={obj.tokenId} />
        </Flex>
      ),
    },
  ];

  const userOfferColumns = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const collection = approvedCollectionObj[Number(obj.collectionID)];

        return (
          <Flex align="center" vertical gap={5}>
            <img
              className="border-radius-5"
              alt={`lend_image`}
              src={collection.thumbnailURI}
              height={70}
              width={70}
            />
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {collection.collectionName}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Offer",
      title: "Offer",
      align: "center",
      dataIndex: "Offer",
      render: (_, obj) => {
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
              {obj?.loanAmount ? Number(obj.loanAmount) / BTC_ZERO : 0}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Interest",
      title: "Interest",
      align: "center",
      dataIndex: "interest",
      render: (_, obj) => (
        <Flex vertical align="center">
          <Flex align="center" gap={5}>
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
              {Number(obj.yieldAccured) / BTC_ZERO}
            </Text>
          </Flex>

          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {Number(obj.yieldRate) / BTC_ZERO}%
          </Text>
        </Flex>
      ),
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => (
        <Text
          className={`${
            themes ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          {Number(obj.terms)} Days
        </Text>
      ),
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "ltv",
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj?.loanToValue ? obj.loanToValue : 0}%
          </Text>
        );
      },
    },
    {
      key: "Floor",
      title: "Floor",
      align: "center",
      dataIndex: "floor",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            ∞ {obj.floorValue}{" "}
          </Text>
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small `}
          >
            $ {(obj.floorValue * icpvalue).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "created at",
      title: "Created at",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => {
        const timestamp = Number(obj.loanTime) / 1000000;
        const time = DateTimeConverter(timestamp);
        const daysCalc = getTimeAgo(timestamp);
        return (
          <Flex align="center" vertical gap={5}>
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
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ({daysCalc})
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Transaction",
      title: "Transaction",
      align: "center",
      dataIndex: "ckTransactionID",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <AssetRedirectRender
            tokenId={obj.ckTransactionID}
            text={obj.ckTransactionID}
          />
        </Flex>
      ),
    },
    {
      key: "action",
      title: " ",
      align: "center",
      dataIndex: "delete",
      render: (_, obj) => {
        return (
          <Flex justify="center" gap={25}>
            <Popconfirm
              title={"Are you sure want to delete the offer?"}
              onConfirm={() => deleteUserOffer(obj)}
            >
              <MdDeleteForever
                className="pointer"
                color={"#e54b64"}
                size={25}
              />
            </Popconfirm>
          </Flex>
        );
      },
    },
  ];

  const loanTableColumns = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const { nft } = obj;
        const canisterId = Principal.from(nft.canister).toText();

        return (
          <Flex align="center" vertical gap={5}>
            {nft.mime_type === "text/html" ? (
              <iframe
                title="cards"
                src={`https://${canisterId}.raw.icp0.io/?tokenid=${nft.token_hash}`}
                alt="noimg"
                width={140}
                height={140}
              />
            ) : (
              <img
                alt="asset_img"
                width={140}
                height={140}
                src={`https://${canisterId}.raw.icp0.io/?tokenid=${nft.token_hash}`}
              />
            )}
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {nft.collectionName}
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
              {Number(obj.loan_amount) / BTC_ZERO}
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
              {Number(obj.repayment_amount) / BTC_ZERO}
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
        const timestamp = Number(obj.timestamp) / 1000000;
        const time = DateTimeConverter(timestamp);
        const daysCalc = getTimeAgo(timestamp);
        return (
          <Flex align="center" vertical gap={5} justify="center">
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
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ({daysCalc})
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Date/time",
      title: "Due on",
      align: "center",
      dataIndex: "repayDateTime",
      render: (_, obj) => {
        const timestamp = Number(obj.timestamp) / 1000000;
        const time = daysCalculator(timestamp);
        const remainingDays = getRemainingTime(time.timestamp);
        return (
          <Flex align="center" vertical gap={5}>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {time.date_time[0]}
            </Text>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              {time.date_time[1]}
            </Text>
            <Flex gap={5} align="center">
              <IoTimer
                size={25}
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              />{" "}
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {remainingDays}
              </Text>
            </Flex>
          </Flex>
        );
      },
    },
    {
      key: "TransactionId",
      title: "Transaction",
      align: "center",
      dataIndex: "transaction_id",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <AssetRedirectRender
            tokenId={obj.transaction_id}
            text={obj.transaction_id}
          />
        </Flex>
      ),
    },
  ];

  const txTableColumns = [
    {
      key: "Serial No",
      title: "#",
      align: "center",
      dataIndex: "Serial No",
      render: (_, obj, index) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {index + 1}
          </Text>
        );
      },
    },
    {
      key: "isWithdraw",
      title: " ",
      align: "center",
      dataIndex: "isWithdraw",
      render: (_, obj) => {
        return (
          <Text className="text-color-one font-small letter-spacing-small ">
            {obj.isWithdraw ? (
              <MdArrowOutward size={30} color="red" />
            ) : (
              <FiArrowDownLeft size={30} color="green" />
            )}
          </Text>
        );
      },
    },
    {
      key: "From",
      title: "From",
      align: "center",
      dataIndex: "from",
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            <Tooltip title={obj.from.owner.__principal__}>
              {" "}
              {sliceAddress(obj.from.owner.__principal__)}
            </Tooltip>
          </Text>
        );
      },
    },
    {
      key: "To",
      title: "To",
      align: "center",
      dataIndex: "to",
      render: (_, obj) => (
        <Text
          className={`${
            themes ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          <Tooltip title={obj.to.owner.__principal__}>
            {" "}
            {sliceAddress(obj.to.owner.__principal__)}
          </Tooltip>
        </Text>
      ),
    },
    {
      key: "Amount",
      title: "Amount",
      align: "center",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj.amount}
          </Text>
        );
      },
    },
    {
      key: "Type",
      title: "Type",
      align: "center",
      dataIndex: "kind",
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj.kind}
          </Text>
        );
      },
    },
    {
      key: "Withdraw",
      title: "Action",
      align: "center",
      dataIndex: "isWithdraw",
      filters: [
        {
          text: <Text className="text-color-one">Withdraw</Text>,
          value: "true",
        },
        {
          text: <Text className="text-color-one">Deposit</Text>,
          value: "false",
        },
      ],
      onFilter: (value, obj) => obj.isWithdraw.toString().includes(value),
      render: (_, obj) => {
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj.isWithdraw ? (
              <Tag color="red">
                <Text
                  className={`${
                    themes ? "text-color-one" : "light-color-primary"
                  } font-size-16 letter-spacing-small`}
                >
                  Withdraw
                </Text>
              </Tag>
            ) : (
              <Tag color="green-inverse">
                <Text
                  className={`${
                    themes ? "text-color-one" : "light-color-primary"
                  } font-size-16 letter-spacing-small`}
                >
                  Deposit
                </Text>
              </Tag>
            )}
          </Text>
        );
      },
    },
    {
      key: "Time stamp",
      title: "Date / Time",
      align: "center",
      dataIndex: "timestamp",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.timestamp - b.timestamp,
      render: (_, obj) => {
        const nanosecondsTimestamp = BigInt(obj.timestamp);
        const millisecondsTimestamp = Number(
          nanosecondsTimestamp / BigInt(1000000)
        );
        const date = new Date(millisecondsTimestamp);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {strTime}
          </Text>
        );
      },
    },
  ];

  const fetchBtcTransactions = async () => {
    try {
      const API = agentCreator(ICP_IdlFactory, icpCanisterId);
      const btcTransactions = await API.getckBTCTransactions(plugAddress);

      if (btcTransactions.length) {
        const trans_ = btcTransactions[0].map((trans) => {
          const data = JSON.parse(trans);
          return {
            ...data,
            isWithdraw:
              data.from.owner.__principal__ ===
              process.env.REACT_APP_ICP_CANISTER_ID,
          };
        });
        setCkBtcTransactions(trans_);
      } else {
        setCkBtcTransactions([]);
      }
    } catch (error) {
      console.log("Fetch BTC transaction error", error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const API = agentCreator(ICP_IdlFactory, icpCanisterId);
      const balance = await API.getckBTCBalance(
        Principal.fromText(plugAddress)
      );
      if (balance) {
        setUserCkBtcBalance(Number(balance) / BTC_ZERO);
      } else {
        setUserCkBtcBalance(0);
      }
    } catch (error) {
      console.log("error balance fetching", error);
    }
  };

  const fetchLendList = async () => {
    const API = agentCreator(ICP_IdlFactory, icpCanisterId);
    const lendData = await API.getUserLent(acId);
    if (lendData.length) {
      setLendingData(lendData);
      let lendValue = 0;
      lendData.forEach((data) => {
        lendValue = lendValue + Number(data.loan_amount);
      });
      dispatch(
        setDashboardData({
          ...dashboardData,
          activeLendings: lendData.length,
          lendingValue: lendValue,
        })
      );
    } else {
      setLendingData([]);
    }
  };

  const fetchBorrowList = async () => {
    const API = agentCreator(ICP_IdlFactory, icpCanisterId);
    const borrowData = await API.getUserBorrows(acId);

    if (borrowData.length) {
      setBorrowingData(borrowData);
      let borrowValue = 0;
      borrowData.forEach((data) => {
        borrowValue = borrowValue + Number(data.loan_amount);
      });
      dispatch(
        setDashboardData({
          ...dashboardData,
          activeBorrows: borrowData.length,
          borrowValue: borrowValue,
        })
      );
    } else {
      setBorrowingData([]);
    }
  };

  const paymentChecker = async (txId) => {
    const result = await ckBtcAgent.get_transactions({
      start: txId,
      length: 1,
    });
    const data = result?.transactions;
    if (data?.length) {
      return data;
    } else {
      paymentChecker(txId);
    }
  };

  const handleRepaySettle = async (obj) => {
    const { nft } = obj;
    try {
      dispatch(setLoading(true));
      const transferArgs = {
        to: {
          owner: Principal.fromText(icpCanisterId),
          subaccount: [],
        },
        fee: [],
        memo: [],
        created_at_time: [],
        from_subaccount: [],
        amount: obj.repayment_amount,
      };
      const payResult = await ckBtcAgent.icrc1_transfer(transferArgs);
      console.log(payResult);
      if (payResult?.Ok) {
        Notify("Loan amount repaid !");
        console.log("Loan amount repaid !");
        const txData = await paymentChecker(payResult?.Ok);
        console.log(txData);
        if (txData?.length) {
          console.log(txData[0].transfer);
          const [data] = txData[0].transfer;
          const props = {
            transaction_id: payResult?.Ok,
            lendData: {
              nft: {
                mime_type: nft.mime_type,
                collection_name: nft.collection_name,
                canister: nft.canister,
                owner_principal: nft.owner_principal,
                token_hash: nft.token_hash,
                owner_account_id: nft.owner_account_id,
                token_number: nft.token_number,
              },
              transaction_id: obj.transaction_id,
              loan_amount: obj.loan_amount,
              lender_account_id: obj.lender_account_id,
              borrower_account_id: obj.borrower_account_id,
              timestamp: obj.timestamp,
              repayment_amount: obj.repayment_amount,
              offerID: Number(obj.offerID),
            },
            paid_amount: data.amount,
            borrower: Principal.fromText(plugAddress),
            paid_to: data.to.owner,
            transfer_time: txData[0].timestamp,
            paid_from: data.from.owner,
          };
          const API = await icpAgentCreator(ICP_IdlFactory, icpCanisterId);
          console.log(props);
          await API.settleLoan(props);
          fetchUserOffers();
          fetchBorrowList();
          fetchLendList();
          Notify("Repayment successful!");
        }
      } else {
        Notify("error", "Payment transfer error!");
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("repay error", error);
    }
  };

  const handleForeclose = async (obj) => {
    const { nft } = obj;
    try {
      dispatch(setLoading(true));
      const API = await icpAgentCreator(ICP_IdlFactory, icpCanisterId);
      const props = {
        lendData: {
          nft: {
            mime_type: nft.mime_type,
            collection_name: nft.collection_name,
            canister: nft.canister,
            owner_principal: nft.owner_principal,
            token_hash: nft.token_hash,
            owner_account_id: nft.owner_account_id,
            token_number: nft.token_number,
          },
          transaction_id: obj.transaction_id,
          loan_amount: obj.loan_amount,
          lender_account_id: obj.lender_account_id,
          borrower_account_id: obj.borrower_account_id,
          timestamp: obj.timestamp,
          repayment_amount: obj.repayment_amount,
          offerID: obj.offerID,
        },
        lender: Principal.fromText(plugAddress),
      };

      const result = await API.foreclosure(props);
      if (result?.ok) {
        Notify("success", "Foreclosing successful, NFT is Yours!");
        fetchLendList();
      }

      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("foreclose error", error);
    }
  };

  useEffect(() => {
    if (active.length) {
      fetchBtcTransactions();
      fetchUserBalance();
      fetchBorrowList();
      fetchLendList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <Row>
        <Title
          level={2}
          className={themes ? "gradient-text-one" : "light-color-gradient"}
        >
          Portfolio
        </Title>
      </Row>

      <Row>
        <Flex align="start" gap={5}>
          <TbInfoSquareRounded
            size={22}
            color={themes ? "#adadad" : "#333333"}
          />
          <Text
            className={`${
              themes ? "text-color-two" : "light-color-primary"
            } font-small letter-spacing-small`}
          >
            Manage your offers, lending, and borrowing positions.{" "}
            <Link className="font-size-16 pointer">
              <a
                href="https://liquidify-us.gitbook.io/liquidify.us/details/portfolio"
                target="_blank"
                rel="noreferrer"
              >
                Learn more.
              </a>
            </Link>
          </Text>
        </Flex>
      </Row>

      {active.length && Object.keys(dashboardData).length ? (
        <Row justify={"space-between"} gutter={12} className="mt-15">
          {portfolioCards.map((card, index) => {
            const { icon: Icon, title, value } = card;
            return (
              <Col md={4} key={`${title}-${index}`}>
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
                      {title}
                    </Text>
                    <Icon
                      size={25}
                      className={themes ? "icon-dark" : "icon-light"}
                    />
                  </Flex>

                  {title.includes("Value") ? (
                    <Flex justify="space-between" align="center">
                      <Text
                        className={`${
                          themes ? "text-color-two" : "light-color-primary"
                        } font-small letter-spacing-small`}
                      >
                        ₿ {(value / BTC_ZERO).toFixed(4)}
                      </Text>
                      <Text
                        className={`${
                          themes ? "text-color-two" : "light-color-primary"
                        } font-small letter-spacing-small`}
                      >
                        $ {((value / BTC_ZERO) * icpvalue).toFixed(6)}
                      </Text>
                    </Flex>
                  ) : (
                    <Text
                      className={`${
                        themes ? "text-color-two" : "light-color-primary"
                      } font-small letter-spacing-small`}
                    >
                      {title.includes("Value") ? "∞" : ""} {value}
                    </Text>
                  )}
                </Flex>
              </Col>
            );
          })}
        </Row>
      ) : (
        ""
      )}

      {/* Divider */}
      <Row className="mt-15">
        <Divider />
      </Row>

      {/* Segmented */}
      <Row
        justify={"center"}
        className={`${
          themes ? "dark-themed-segmented" : "light-themed-segmented"
        } mt-5`}
      >
        <Col>
          <Segmented
            options={[
              "Assets",
              "Offers",
              "Lendings",
              "Borrowings",
              "Transactions",
            ]}
            onChange={(value) => {
              setPage(value);
            }}
            defaultValue={page}
          />
        </Col>
      </Row>

      {/* Detailed View */}
      {page === "Assets" && active.length ? (
        <Row
          justify={"space-between"}
          className={`${
            themes ? "dark-themed-segmented" : "light-themed-segmented"
          } mt-30`}
        >
          <Flex align="center" gap={10}>
            <div className="checkbox-wrapper">
              <input
                id="_checkbox-26"
                type="checkbox"
                checked={detailedViewCheckBox}
                onChange={() => {}}
                onClick={(e) => setDetailedViewCheckBox(e.target.checked)}
              />
              <label htmlFor="_checkbox-26">
                <div className="tick_mark"></div>
              </label>
            </div>
            <Text
              className={`${
                themes ? "gradient-text-one" : "light-color-primary"
              } font-medium letter-spacing-small mt-5 pointer`}
              onClick={(e) => setDetailedViewCheckBox(!detailedViewCheckBox)}
            >
              Detailed View
            </Text>
          </Flex>

          <Col>
            <Segmented
              options={[
                { label: <AiOutlineAppstore />, value: "cards" },
                { label: <AiOutlineBars />, value: "table" },
              ]}
              onChange={(value) => {
                setDisplayType(value);
              }}
              defaultValue={displayType}
            />
          </Col>

          <Col md={3}>
            <Row justify={"end"} align={"middle"}>
              <Col
                className="border-grey"
                onClick={() => {
                  dispatch(setUserAssets(null));
                  fetchUserAssets();
                }}
              >
                <LuRefreshCw
                  className={`pointer ${themes ? "icon-dark" : "icon-light"} ${
                    userAssets === null ? "spin" : ""
                  }`}
                  size={25}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        ""
      )}
      {/* Segmented Content */}
      {page === "Assets" && active.length ? (
        <Row
          className="m-bottom mt-30"
          justify={
            userAssets === null || userAssets?.length === 0 ? "center" : "start"
          }
          gutter={[32, 32]}
        >
          {userAssets === null ? (
            <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
          ) : (
            <>
              {displayType === "cards" ? (
                <>
                  {userAssets.length === 0 ? (
                    <Text
                      className={`${
                        themes ? "gradient-text-one" : "light-color-primary"
                      } font-medium letter-spacing-small`}
                    >
                      No assets found!
                    </Text>
                  ) : (
                    userAssets.map((asset) => {
                      const {
                        id,
                        canisterId,
                        collectionName,
                        floorPrice,
                        tokenId,
                      } = asset;
                      return (
                        <Col
                          key={`${id}-${canisterId}`}
                          md={detailedViewCheckBox ? 6 : 3}
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
                            <Col md={detailedViewCheckBox ? 11 : 24}>
                              <Flex vertical justify="space-between" gap={16}>
                                <img
                                  className="border-radius-5"
                                  src={`https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenId}`}
                                  alt="asset_cards"
                                  width={145}
                                  height={145}
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

                            {detailedViewCheckBox ? (
                              <Col md={12}>
                                <Row gutter={[0, 12]} justify={"end"}>
                                  <Col md={24}>
                                    <Flex
                                      vertical
                                      align="center"
                                      className={`${
                                        themes ? "border-color-dark" : ""
                                      } card-box box-padding-one border-radius-5`}
                                    >
                                      <Text
                                        className={`${
                                          themes
                                            ? "gradient-text-one"
                                            : "light-color-primary"
                                        } font-medium letter-spacing-small`}
                                      >
                                        View
                                      </Text>

                                      <AssetRedirectRender tokenId={tokenId} />
                                    </Flex>
                                  </Col>

                                  <Col md={24}>
                                    <Flex
                                      vertical
                                      align="center"
                                      className={`${
                                        themes ? "border-color-dark" : ""
                                      } card-box box-padding-one border-radius-5`}
                                    >
                                      <Text
                                        className={`${
                                          themes
                                            ? "gradient-text-one"
                                            : "light-color-primary"
                                        } font-medium letter-spacing-small`}
                                      >
                                        Floor
                                      </Text>
                                      <Text
                                        className={`${
                                          themes
                                            ? "text-color-two"
                                            : "light-color-primary"
                                        } font-small letter-spacing-small`}
                                      >
                                        ∞ {Number(floorPrice[3]) / BTC_ZERO}
                                      </Text>
                                    </Flex>
                                  </Col>

                                  <Col md={24}>
                                    <Flex
                                      vertical
                                      align="center"
                                      className={`${
                                        themes ? "border-color-dark" : ""
                                      } card-box box-padding-one border-radius-5`}
                                    >
                                      <Text
                                        className={`${
                                          themes
                                            ? "gradient-text-one"
                                            : "light-color-primary"
                                        } font-medium letter-spacing-small`}
                                      >
                                        Canister
                                      </Text>
                                      <Text
                                        className={`${
                                          themes
                                            ? "text-color-two"
                                            : "light-color-primary"
                                        } font-small letter-spacing-small`}
                                      >
                                        {sliceAddress(canisterId, 3)}{" "}
                                        <TooltipRender text={canisterId} />
                                      </Text>
                                    </Flex>
                                  </Col>
                                </Row>
                              </Col>
                            ) : (
                              ""
                            )}
                          </Row>
                        </Col>
                      );
                    })
                  )}
                </>
              ) : (
                <Col md={24}>
                  <TableComponent
                    rootClassName={themes && "table-theme"}
                    loading={{
                      spinning: userAssets === null,
                      indicator: <Bars />,
                    }}
                    rowKey={(e) => `${e?.tokenId}-${e?.canisterId}`}
                    tableColumns={approvedAssetsColumns}
                    tableData={userAssets}
                    pagination={false}
                  />
                </Col>
              )}
            </>
          )}
        </Row>
      ) : page === "Offers" && active.length ? (
        // Offers page
        <>
          <Row justify={"end"}>
            <Col
              className="border-grey"
              onClick={() => {
                dispatch(setUserOffers(null));
                fetchUserOffers();
              }}
            >
              <LuRefreshCw
                className={`pointer ${themes ? "icon-dark" : "icon-light"} ${
                  userOffers === null ? "spin" : ""
                }`}
                size={25}
              />
            </Col>
          </Row>
          <Row justify={"center"} className="m-bottom mt-15">
            <Col md={24}>
              <TableComponent
                rootClassName={themes && "table-theme"}
                loading={{
                  spinning: userOffers === null,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.ckTransactionID}-${e?.loanAmount}`}
                tableColumns={userOfferColumns}
                tableData={userOffers}
                pagination={false}
              />
            </Col>
          </Row>
        </>
      ) : page === "Lendings" && active.length ? (
        // Lendings page
        <>
          <Row justify={"end"}>
            <Col
              className="border-grey"
              onClick={() => {
                setLendingData(null);
                fetchLendList();
              }}
            >
              <LuRefreshCw
                className={`pointer ${themes ? "icon-dark" : "icon-light"} ${
                  lendingData === null ? "spin" : ""
                }`}
                size={25}
              />
            </Col>
          </Row>
          <Row justify={"center"} className="m-bottom mt-15">
            <Col md={24}>
              <TableComponent
                rootClassName={themes && "table-theme"}
                loading={{
                  spinning: lendingData === null,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.transaction_id}-${e?.timestamp}`}
                tableColumns={[
                  ...loanTableColumns,
                  {
                    key: "action",
                    title: " ",
                    align: "center",
                    dataIndex: "borrow",
                    render: (_, obj) => {
                      const timestamp = Number(obj.timestamp) / 1000000;
                      const time = daysCalculator(timestamp);
                      const remainingDays = getRemainingTime(time.timestamp);
                      return (
                        <Flex justify="center" gap={25}>
                          <CustomButton
                            onClick={() => {
                              handleForeclose(obj);
                            }}
                            className={`button-css lend-button lend-button-shine`}
                            disabled={
                              !remainingDays.includes(
                                "The loan period has expired."
                              )
                            }
                            title={
                              <Flex align="center" justify="center" gap={10}>
                                <span
                                  className={`${
                                    !themes && "light-color-primary"
                                  } text-color-one font-weight-600 pointer iconalignment font-size-16`}
                                >
                                  Foreclose
                                </span>
                              </Flex>
                            }
                          />
                        </Flex>
                      );
                    },
                  },
                ]}
                tableData={lendingData}
                pagination={false}
              />
            </Col>
          </Row>
        </>
      ) : page === "Borrowings" && active.length ? (
        // Borrowings page
        <>
          <Row justify={"end"}>
            <Col
              className="border-grey"
              onClick={() => {
                setBorrowingData(null);
                setUserCkBtcBalance(null);
                fetchBorrowList();
                fetchUserBalance();
              }}
            >
              <LuRefreshCw
                className={`pointer ${themes ? "icon-dark" : "icon-light"} ${
                  borrowingData === null ? "spin" : ""
                }`}
                size={25}
              />
            </Col>
          </Row>
          <Row justify={"center"} className="m-bottom mt-15">
            <Col md={24}>
              <TableComponent
                rootClassName={themes && "table-theme"}
                loading={{
                  spinning: borrowingData === null,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.transaction_id}-${e?.timestamp}`}
                tableColumns={[
                  ...loanTableColumns,
                  {
                    key: "action",
                    title: " ",
                    align: "center",
                    dataIndex: "borrow",
                    render: (_, obj) => {
                      const timestamp = Number(obj.timestamp) / 1000000;
                      const time = daysCalculator(timestamp);
                      const remainingDays = getRemainingTime(time.timestamp);
                      return (
                        <Flex justify="center" gap={25}>
                          <CustomButton
                            onClick={() => {
                              handleRepaySettle(obj);
                            }}
                            disabled={remainingDays.includes(
                              "The loan period has expired."
                            )}
                            className={`button-css lend-button lend-button-shine`}
                            title={
                              <Flex align="center" justify="center" gap={10}>
                                <span
                                  className={`${
                                    !themes && "light-color-primary"
                                  } text-color-one font-weight-600 pointer iconalignment font-size-16`}
                                >
                                  Repay
                                </span>
                              </Flex>
                            }
                          />
                        </Flex>
                      );
                    },
                  },
                ]}
                tableData={borrowingData}
                pagination={false}
              />
            </Col>
          </Row>
        </>
      ) : page === "Transactions" && active.length ? (
        // Txs page
        <>
          <Row justify={"space-between"} align={"middle"}>
            <Col>
              <Flex align="center" gap={5}>
                <Text
                  className={`${
                    themes ? "text-color-two" : "light-color-primary"
                  } font-small letter-spacing-small`}
                >
                  Your balance in canister
                </Text>
                <Text
                  className={`${
                    themes ? "text-color-two" : "light-color-primary"
                  } font-small letter-spacing-small`}
                >
                  {userCkBtcBalance}
                </Text>
                <img
                  className="round"
                  src={ckBtc}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={20}
                />
              </Flex>
            </Col>

            <Col
              className="border-grey"
              onClick={() => {
                setCkBtcTransactions(null);
                fetchBtcTransactions();
              }}
            >
              <LuRefreshCw
                className={`pointer ${themes ? "icon-dark" : "icon-light"} ${
                  ckBtcTransactions === null ? "spin" : ""
                }`}
                size={25}
              />
            </Col>
          </Row>
          <Row justify={"center"} className="m-bottom mt-15">
            <Col md={24}>
              <TableComponent
                rootClassName={themes && "table-theme"}
                loading={{
                  spinning: ckBtcTransactions === null,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.timestamp}-${e?.amount}`}
                tableColumns={txTableColumns}
                tableData={ckBtcTransactions}
                pagination={false}
              />
            </Col>
          </Row>
        </>
      ) : (
        <Row justify={"center"} className="mt-70">
          <Text
            className={`${
              themes ? "gradient-text-one" : "light-color-primary"
            } font-medium letter-spacing-small`}
          >
            {`${
              !isPlugConnected && active.length ? "Reconnect" : "Connect"
            } Your Wallet!`}
          </Text>
        </Row>
      )}
    </>
  );
};

export default propsContainer(Portfolio);
