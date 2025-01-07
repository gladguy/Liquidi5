import { Principal } from "@dfinity/principal";
import {
  Badge,
  Col,
  Collapse,
  Divider,
  Dropdown,
  Flex,
  Input,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCaretDown, FaRegSmileWink } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { ImSad } from "react-icons/im";
import { LiaConnectdevelop } from "react-icons/lia";
import { MdContentCopy, MdLockClock } from "react-icons/md";
import { Bars } from "react-loading-icons";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { nftCommonIdlFactory } from "../../nft_canister";
import { setLoading } from "../../redux/slice/constant";
import {
  ApprovedCollections,
  Capitalaize,
  DateTimeConverter,
  agentCreator,
  constructUser,
  daysCalculator,
  decodeTokenId,
  getSubAccountArray,
  principalToAccountIdentifier,
  sliceAddress,
  tellMeCanisterName,
  tokenIdentifier,
} from "../../utils/common";

const Dashboard = (props) => {
  /* global BigInt */
  const { ckBtcAgent } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const walletState = reduxState.wallet;
  const icpvalue = reduxState.constant.icpvalue;
  const icp_agent = reduxState.constant.icpAgent;
  let plugAddress = walletState.plug.principalId;
  let userAccountId = walletState.plug.principalId;

  const { Title, Text } = Typography;

  // USE STATE
  const [lendData, setLendData] = useState([]);
  const [approvedAssets, setApprovedAssets] = useState(null);
  const [userActiveLendData, setUserActiveLendData] = useState(null);

  const [copy, setCopy] = useState("Copy");
  const [loadingState, setLoadingState] = useState({
    isApproveBtn: false,
    isSupplyBtn: false,
    isLendCkbtcBtn: false,
    isSupplyAsset: false,
    isBorrowData: false,
    isLendData: false,
    isWithdrawBtn: false,
    isRepayBtn: false,
    isAssetSupplies: false,
    isAssetWithdraw: false,
    isTokenData: false,
  });
  const [supplyItems, setSupplyItems] = useState(null);
  const [assetSupplies, setAssetSupplies] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSupplyTransferModal, setHandleSupplyTransferModal] =
    useState(false);
  const [lendTransferModal, setLendTransferModal] = useState(false);
  const [repayCanisterModal, setRepayCanisterModal] = useState(false);
  const [supplyTransferData, setSupplyTransferData] = useState({
    canisterId: "",
    tokenId: "",
    id: 0,
    floorPrice: 0,
  });
  const [lendTransferData, setLendTransferData] = useState({});
  const [repayCanisterData, setRepayCanisterData] = useState({
    tokenIndex: 0,
    repayment_amount: 0,
    due_at: 0,
    lendData: {},
    obj: {},
  });

  const [askIds, setAskIds] = useState([]);
  const [borrowedAssetIds, setBorrowedAssetIds] = useState(null);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ICP_CANISTER = process.env.REACT_APP_ICP_CANISTER_ID;

  // COMPONENTS & FUNCTIONS
  const handleOk = () => {
    setIsModalOpen(false);
    setHandleSupplyTransferModal(false);
    setLendTransferModal(false);
    setRepayCanisterModal(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHandleSupplyTransferModal(false);
    setLendTransferModal(false);
    setRepayCanisterModal(false);
  };

  const options = [
    {
      key: "1",
      label: (
        <CustomButton
          className={
            "dashboardButtons-white font-weight-600 letter-spacing-small"
          }
          title={"Details"}
          size="medium"
          onClick={() => setIsModalOpen(true)}
        />
      ),
    },
  ];

  const handleRepayToCanister = async () => {
    let repayResult;
    const transferArgs = {
      to: {
        owner: Principal.fromText(
          repayCanisterData.obj?.from?.principal?.__principal__
        ),
        subaccount: [],
      },
      fee: [],
      memo: [],
      created_at_time: [],
      from_subaccount: [],
      amount: Number(repayCanisterData.repayment_amount),
    };

    try {
      setLoadingState((prev) => ({ ...prev, isRepayBtn: true }));
      if (ckBtcAgent) {
        repayResult = await ckBtcAgent.icrc1_transfer(transferArgs);

        setLoadingState((prev) => ({ ...prev, isRepayBtn: false }));

        if (repayResult?.Ok) {
          setRepayCanisterModal(false);
          Notify("success", "Repayment successfull!");
          const nft = {
            ...repayCanisterData.lendData.nft,
          };
          const repaymentArgs = {
            transferRequest: {
              ...transferArgs,
              timestamp: Date.now(),
            },
            lenddata: {
              nft,
              transaction_id: repayCanisterData.lendData.transaction_id,
              loan_amount: repayCanisterData.lendData.loan_amount,
              lender_account_id: repayCanisterData.lendData.lender_account_id,
              borrower_account_id:
                repayCanisterData.lendData.borrower_account_id,
              timestamp: repayCanisterData.lendData.timestamp,
              repayment_amount: repayCanisterData.lendData.repayment_amount,
            },
            repayment_transaction_id: repayResult?.Ok.toString(),
            borrower_account_id: repayCanisterData.lendData.borrower_account_id,
            timestamp: Date.now(),
            repayment_amount: Number(repayCanisterData.repayment_amount),
            token_hash: repayCanisterData.obj.token,
          };
          try {
            dispatch(setLoading(true));
            await icp_agent.setRepayment(
              repayCanisterData.obj.token,
              repaymentArgs
            );
            getLendData();
            fetchUserSupplies();
            dispatch(setLoading(false));
          } catch (error) {
            console.log("Repayment error", error);
          }
        } else {
          const err = Object.keys(repayResult?.Err)[0];
          if (err?.includes("InsufficientFunds")) {
            Notify(
              "error",
              `${err} balance is ${
                Number(repayResult.Err.InsufficientFunds.balance) / BTC_ZERO
              }`
            );
          } else {
            Notify("error", "Something went wrong!");
          }
        }
      } else {
        Notify("error", "Agent creation error!");
      }
    } catch (error) {
      console.log("repayment error", error);
      setLoadingState((prev) => ({ ...prev, isRepayBtn: false }));
      dispatch(setLoading(false));
    }
  };

  // Approved Assets table, Asset Transfer to Supplies. location: (C2)
  const handleSupplyAssetTransfer = async () => {
    setLoadingState((prev) => ({ ...prev, isSupplyAsset: true }));
    const API = await window.ic?.plug.createActor({
      interfaceFactory: nftCommonIdlFactory,
      canisterId: supplyTransferData.canisterId,
    });

    const transferArgs = {
      to: constructUser(ICP_CANISTER),
      token: supplyTransferData.tokenId,
      notify: false,
      from: { principal: Principal.fromText(plugAddress) },
      memo: [],
      subaccount: [getSubAccountArray(0)],
      amount: 1,
    };

    try {
      const transferResult = await API.transfer(transferArgs);

      if (transferResult.ok) {
        Notify("success", "Transfer successful!");
        await icp_agent.setTransaction(userAccountId, {
          ...transferArgs,
          timestamp: Date.now(),
        });
        setHandleSupplyTransferModal(false);
      } else {
        Notify("error", "Transfer failed");
      }
      fetchUserSupplies();
      fetchUserAssets();

      setLoadingState((prev) => ({ ...prev, isSupplyAsset: false }));
    } catch (error) {
      console.log("Transfer asset to supply error", error);
      setLoadingState((prev) => ({ ...prev, isSupplyAsset: false }));
    }
  };

  // Lending asset locatiom (C4)
  const handleLendAssetTransfer = async () => {
    let result;
    const transferArgs = {
      to: {
        owner: lendTransferData.owner_principal,
        subaccount: [],
      },
      fee: [],
      memo: [],
      created_at_time: [],
      from_subaccount: [],
      amount: BigInt(lendTransferData.actual_amount),
      // amount: BigInt(2000),
    };

    try {
      if (plugAddress) {
        setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: true }));
        if (ckBtcAgent) {
          result = await ckBtcAgent.icrc1_transfer(transferArgs);
        } else {
          Notify("warning", "Reconnect the plug wallet to process!");
        }
        setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: false }));

        const nft = {
          token_id: lendTransferData.token_id,
          mime_type: "img/jpg",
          collection_name: lendTransferData.collection_name,
          canister: lendTransferData.token_details.canister,
          token_hash: lendTransferData.token_hash,
          owner_principal: lendTransferData.owner_principal,
          owner_account_id: lendTransferData.owner_account_id,
        };

        if (result?.Ok) {
          setLendTransferModal(false);
          Notify("success", "Lending successful!");
          dispatch(setLoading(true));
          await icp_agent.setActiveLending(userAccountId, {
            nft,
            transaction_id: result.Ok.toString(),
            borrower_account_id: lendTransferData.owner_account_id,
            lender_account_id: userAccountId,
            loan_amount: lendTransferData.actual_amount,
            repayment_amount: parseInt(lendTransferData.repayment_amount),
            timestamp: Date.now(),
          });
          dispatch(setLoading(false));

          getLendData();
        } else {
          const err = Object.keys(result?.Err)[0];
          if (err?.includes("InsufficientFunds")) {
            Notify(
              "error",
              `${err} balance is ${
                Number(result.Err.InsufficientFunds.balance) / BTC_ZERO
              }`
            );
          } else {
            Notify("error", "Something went wrong!");
          }
        }
      } else {
        Notify("error", "Connect wallets or some data missing!");
      }
    } catch (error) {
      setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: false }));
      dispatch(setLoading(false));
      console.log("Lend Asset Transfet Error", error);
    }
  };

  /***************************************************************************/

  const fetchUserSupplies = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: true }));
      const acId = principalToAccountIdentifier(plugAddress, 0);

      // Getting users supplies from ICP canister, which user send to custody address.
      const supplies = await axios.get(
        `http://localhost:4040/api/v1/fetchUserTokens/${acId}`
      );

      if (supplies.data.success) {
        const userData = supplies.data.data.map((tx) => {
          const { token } = tx;
          const decodedId = decodeTokenId(token);
          const url = `https://${decodedId.canister}.raw.icp0.io/?type=thumbnail&tokenid=${decodedId.token}`;
          return {
            ...tx,
            tokenMeta: decodedId,
            url,
          };
        });

        setAssetSupplies(userData);
      }

      const askRequests = await icp_agent.getAskRequest(userAccountId);

      const askIds = askRequests.map((asset) => asset.token_id);
      setAskIds(askIds);
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: false }));
    } catch (error) {
      console.log("error", error);
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: false }));
    }
  };

  const fetchUserAssets = async () => {
    try {
      const principalId = plugAddress;

      const accountId = principalToAccountIdentifier(principalId, 0);
      setLoadingState((prev) => ({ ...prev, isTokenData: true }));

      const tokens = ApprovedCollections.map(async (canister) => {
        const { canisterId, collectionName } = canister;

        const API = agentCreator(nftCommonIdlFactory, canisterId);

        return new Promise(async (res, rej) => {
          try {
            const result = await API.tokens(accountId);
            const floorPrice = await API.stats();
            res({
              array: result.ok ? result.ok : result.err.Other,
              collectionName,
              canisterId,
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
        const tokenIds = Ids.map((id) => {
          const tokenId = tokenIdentifier(canisterId, id);
          return {
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
      setApprovedAssets(flattenedArray);
      setLoadingState((prev) => ({ ...prev, isTokenData: false }));
    } catch (error) {
      console.log("error Fetch User Assets", error);
    }
  };

  useEffect(() => {
    (async () => {
      if (plugAddress && icp_agent) await fetchUserAssets();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugAddress, icp_agent]);

  // UseEFFECT DATA FETCHING ---------------------------------------------------

  const getLendData = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLendData: true }));

      // Fetching a particular users's lending
      const getUserLendReq = await icp_agent.getUserLending(userAccountId);
      let borrowIds = {};
      getUserLendReq.forEach((asset) => {
        borrowIds[asset.nft.token_id] = asset;
      });
      setUserActiveLendData(getUserLendReq);
      setBorrowedAssetIds(borrowIds);

      // Fetching successfully lended assets
      const getActiveLendReq = await icp_agent.getAllActiveLendings();

      const lendActiveIds = getActiveLendReq.map(
        (array) => decodeTokenId(array[1]).index
      );

      const getLoanReq = await icp_agent.getAllAskRequests();

      // Filtering assets which are already lended by any user and we hide the assets for user.
      const filteredData = getLoanReq.filter(
        (data) => !lendActiveIds.includes(Number(data[0]))
      );
      const loanData = filteredData.map((data) => {
        return {
          ...data[1],
          ...data[1].token_details,
        };
      });

      const finalResult = loanData.map(async (obj) => {
        return new Promise(async (res, rej) => {
          const url = `https://${Principal.from(
            obj.canister
          ).toString()}.raw.icp0.io/?type=thumbnail&tokenid=${obj.token_hash}`;

          const API = agentCreator(nftCommonIdlFactory, obj.canister);
          const floorPrice = await API.stats();

          try {
            res({
              ...obj,
              url,
              floorPrice,
            });
          } catch (error) {}
        });
      });

      const promises = await Promise.all(finalResult);
      if (promises.length) {
        setLendData(promises);
      } else {
        setLendData([]);
      }

      setLoadingState((prev) => ({ ...prev, isLendData: false }));
    } catch (error) {
      console.log("error", error);
      setLoadingState((prev) => ({ ...prev, isLendData: false }));
    }
  };

  // Fetching lend details
  useEffect(() => {
    (async () => {
      if (icp_agent && plugAddress) {
        // getting Lend Side Details
        await getLendData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icp_agent, plugAddress]);

  useEffect(() => {
    (async () => {
      if (plugAddress && icp_agent) {
        fetchUserSupplies();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugAddress, icp_agent]);

  useEffect(() => {
    if (activeWallet?.length === 0) {
      setLendData([]);
      setLendTransferData({
        floor: 0,
        assetId: "",
        halfFloor: 0,
        repayment_amount: 0,
        principal: undefined,
        inscriptionNumber: undefined,
        mimeType: undefined,
      });
      setRepayCanisterData({
        assetId: "",
        repayment_amount: 0,
        due_at: 0,
        lendData: {},
      });
      setAssetSupplies(null);
      setBorrowedAssetIds(null);
    }
  }, [activeWallet]);

  // Data & Table Colums
  // C1 --------------------

  const AssetSupplyTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.tokenMeta.index - b.tokenMeta.index,
      render: (_, obj) => {
        const { index } = obj.tokenMeta;
        const lendData = borrowedAssetIds[index];

        return (
          <>
            <Flex gap={5} vertical align="center">
              <Badge
                style={{
                  display: !Number(lendData?.nft?.token_id) && "none",
                }}
                count={
                  <MdLockClock
                    size={30}
                    style={{
                      color: "#f5222d",
                    }}
                  />
                }
              >
                <img
                  loading="lazy"
                  src={obj.url}
                  alt="noimage"
                  className="border-radius-30"
                  width={70}
                  height={70}
                />
              </Badge>
              {obj.tokenMeta.index}
            </Flex>
          </>
        );
      },
    },
    {
      key: "Time stamp",
      title: "Date / Time",
      align: "center",
      dataIndex: "timestamp",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.genesis_timestamp - b.genesis_timestamp,
      render: (_, obj) => {
        const timeStamp = DateTimeConverter(Number(obj.timestamp));
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "Action Buttons",
      title: " ",
      width: "25%",
      align: "center",
      render: (_, obj) => {
        const { index, token, canister } = obj.tokenMeta;
        const lendData = borrowedAssetIds[index];
        return (
          <>
            <Flex gap={10} justify="center">
              {Number(lendData?.nft?.token_id) !== index ? (
                <Popconfirm
                  className="z-index"
                  color="black"
                  placement="top"
                  style={{ color: "white" }}
                  title={
                    <span className="font-small heading-one text-color-two">
                      {`Do you want to ${
                        askIds.includes(index.toString())
                          ? "cancel"
                          : "initiate"
                      } the borrow request?`}
                    </span>
                  }
                  okText="Yes"
                  cancelText="No"
                  onConfirm={async () => {
                    try {
                      dispatch(setLoading(true));
                      if (askIds.includes(index.toString())) {
                        // setPause goes here
                        const pauseRequest = await icp_agent.setPauseRequest(
                          userAccountId,
                          index.toString()
                        );

                        if (pauseRequest) {
                          Notify("success", "Pause successful!");
                        }
                      } else {
                        const NFT_details = {
                          token_id: Number(index),
                          mime_type: "img/jpg",
                          collection_name: tellMeCanisterName(canister),
                          canister: Principal.fromText(canister),
                          owner_principal: Principal.fromText(plugAddress),
                          token_hash: token,
                          owner_account_id: userAccountId,
                        };

                        const setAskReq = await icp_agent.setAskRequest(
                          userAccountId,
                          index.toString(),
                          NFT_details
                        );

                        if (setAskReq) {
                          Notify("success", "Ask successful!");
                        } else {
                          Notify("warning", "Asset Id already exists");
                        }
                      }
                      fetchUserSupplies();
                      getLendData();

                      dispatch(setLoading(false));
                    } catch (error) {
                      dispatch(setLoading(false));
                      console.log("error set ask | pause request", error);
                    }
                  }}
                >
                  <CustomButton
                    block
                    className={
                      "dashboardButtons-grey font-weight-600 letter-spacing-small"
                    }
                    title={
                      askIds.includes(obj.tokenMeta.index.toString())
                        ? "Pause"
                        : "Ask"
                    }
                    size="medium"
                  />
                </Popconfirm>
              ) : (
                <CustomButton
                  className={"font-weight-600 letter-spacing-small"}
                  title={"Repay"}
                  block
                  size="medium"
                  onClick={() => {
                    setRepayCanisterModal(true);
                    setRepayCanisterData({
                      tokenIndex: index,
                      repayment_amount: lendData.repayment_amount,
                      due_at: daysCalculator(lendData.timestamp).date_time,
                      lendData,
                      obj,
                    });
                  }}
                />
              )}

              <Popconfirm
                className="z-index"
                color="black"
                placement="top"
                style={{ color: "white" }}
                title={
                  <span className="font-small heading-one text-color-two">
                    {`Are you sure want to withdraw the supply?`}
                  </span>
                }
                okText="Yes"
                cancelText="No"
                onConfirm={async () => {
                  try {
                    const TransferArgs = {
                      to: constructUser(plugAddress),
                      token: token,
                      notify: false,
                      from: {
                        address:
                          "c71642ec597853749485ae1a07e34eba58358973d532e2f1ad5adb91bcf12293",
                      },
                      memo: [],
                      subaccount: [getSubAccountArray(0)],
                      amount: 1,
                    };

                    const withdrawRequest = await icp_agent.withDrawAsset(
                      canister,
                      TransferArgs
                    );

                    if (withdrawRequest.ok) {
                      Notify("success", "Withdraw successful!");
                    } else {
                      Notify("error", "Withdraw failed!");
                    }
                    fetchUserSupplies();
                    fetchUserAssets();
                  } catch (error) {
                    console.log("error withdraw request", error);
                  }
                }}
              >
                <CustomButton
                  disabled={Number(
                    lendData?.nft?.token_id ? lendData?.nft?.token_id : 0
                  )}
                  block
                  className={"font-weight-600 letter-spacing-small"}
                  title="Withdraw"
                  size="medium"
                />
              </Popconfirm>
            </Flex>
          </>
        );
      },
    },
  ];

  // C2 --------------------

  const AssetsToSupplyTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.id - b.id,
      render: (_, obj) => {
        return (
          <>
            <Flex gap={5} vertical align="center">
              <img
                src={`https://${obj.canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${obj.tokenId}`}
                alt="noimage"
                className="border-radius-30"
                width={70}
                height={70}
              />
              {obj.id}
            </Flex>
          </>
        );
      },
    },
    {
      key: "Floor Price",
      title: "Floor price",
      align: "center",
      dataIndex: "value",
      sorter: (a, b) =>
        a.floorPrice[3] > b.floorPrice[3] ||
        -(a.floorPrice[3] < b.floorPrice[3]),
      render: (_, obj) => {
        return (
          <>
            {obj.floorPrice ? (
              <Flex vertical align="center">
                <span className="text-color-one font-small letter-spacing-small">
                  ₿ {Number(obj.floorPrice[3]) / BTC_ZERO}
                </span>
                <span className="text-color-two font-xsmall letter-spacing-small">
                  ${" "}
                  {((Number(obj.floorPrice[3]) / BTC_ZERO) * icpvalue).toFixed(
                    2
                  )}
                </span>
              </Flex>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "category_id",
      render: (id, obj) => {
        return <Text className="text-color-two font-small">5%</Text>;
      },
    },
    {
      key: "Can be collateral",
      title: "Can be collateral",
      align: "center",
      dataIndex: "link",
      render: (_, obj) => (
        <>
          <FcApproval color="orange" size={30} />
        </>
      ),
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => {
        return (
          <Flex gap={5}>
            <Dropdown.Button
              className="dbButtons-grey font-weight-600 letter-spacing-small"
              trigger={"click"}
              onClick={() => {
                setHandleSupplyTransferModal(true);
                setSupplyTransferData({
                  canisterId: obj.canisterId,
                  tokenId: obj.tokenId,
                  id: obj.id,
                  floorPrice: obj.floorPrice[3],
                });
              }}
              menu={{
                items: options,
                onClick: () => setSupplyItems(obj),
              }}
            >
              Supply
            </Dropdown.Button>
          </Flex>
        );
      },
    },
  ];
  // C3----------------------------------------------------------------

  const yourLendTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => {
        const { canister, token } = decodeTokenId(obj.nft.token_hash);
        return (
          <Flex align="center" gap={5} vertical>
            <img
              src={`https://${canister}.raw.icp0.io/?type=thumbnail&tokenid=${token}`}
              alt={`${Number(obj.nft.token_id)}-lend_image`}
              className="border-radius-30"
              width={70}
              height={70}
            />
            {Number(obj.nft.token_id)}
          </Flex>
        );
      },
    },
    {
      key: "Amount",
      title: "Amount",
      align: "center",
      dataIndex: "debt",
      render: (_, obj) => (
        <>
          {icpvalue !== null ? (
            <Flex align="center" vertical>
              <span className="text-color-one font-small letter-spacing-small">
                {Number(obj.loan_amount) / BTC_ZERO} ckBTC
              </span>
              <span className="text-color-two font-xsmall letter-spacing-small">
                ${(Number(obj.loan_amount) * 45000) / BTC_ZERO}
              </span>
            </Flex>
          ) : (
            <Loading
              spin={!icpvalue}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          )}
        </>
      ),
    },

    {
      key: "Date/Time",
      title: "Date / Time",
      align: "center",
      dataIndex: "date",
      render: (_, obj) => {
        const timeStamp = DateTimeConverter(Number(obj.timestamp));
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "repayment",
      title: "Due on",
      align: "center",
      dataIndex: "apy",
      render: (_, obj) => {
        const result = daysCalculator(obj.timestamp).date_time;
        const timeStamp = result.split(" ");
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]} {timeStamp[2]}
            </span>
          </Flex>
        );
      },
    },
  ];

  // C4----------------------------------------------------------------

  const assetsToLendTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <img
            src={obj.url}
            alt={`lend_image`}
            className="border-radius-30"
            width={70}
            height={70}
          />
          {Number(obj.token_id)}
        </Flex>
      ),
    },
    {
      key: "Debt",
      title: "Debt",
      align: "center",
      dataIndex: "debt",
      render: (_, obj) => (
        <Flex vertical>
          <span className="text-color-one font-small letter-spacing-small">
            {Number(obj.floorPrice[3]) / BTC_ZERO / 2} ICP
          </span>
          <span className="text-color-two font-xsmall letter-spacing-small">
            ${" "}
            {((Number(obj.floorPrice[3]) / BTC_ZERO) * icpvalue).toFixed(2) / 2}
          </span>
          <span className="text-color-two font-xsmall letter-spacing-small">
            50%
          </span>
        </Flex>
      ),
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => {
        const halfFloor = Number(obj.floorPrice[3]) / BTC_ZERO / 2;
        const actual_amount = parseInt(
          ((halfFloor * icpvalue) / 45000) * BTC_ZERO
        );
        const repayment_amount = parseInt(
          actual_amount + (actual_amount / 100) * 5
        );
        return (
          <Flex gap={10} justify="center">
            {askIds.includes(Number(obj.token_id)) ? (
              <>
                <CustomButton
                  className={
                    "dashboardButtons-grey font-weight-600 letter-spacing-small"
                  }
                  title="Lend"
                  size="middle"
                  onClick={() => {
                    setLendTransferModal(true);
                    setLendTransferData({
                      halfFloor,
                      actual_amount,
                      repayment_amount,
                      ...obj,
                    });
                  }}
                />
              </>
            ) : (
              "---"
            )}
          </Flex>
        );
      },
    },
  ];

  //   Collapse Items
  const YourSuppliesItems = [
    {
      key: "supply-1",
      label: (
        <>
          <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
            Your Asset Supplies
          </Text>
        </>
      ),
      children: (
        <>
          <TableComponent
            loading={{
              spinning: loadingState.isAssetSupplies,
              indicator: <Bars />,
            }}
            locale={{
              emptyText: (
                <Flex align="center" justify="center" gap={5}>
                  {!plugAddress ? (
                    <>
                      <FaRegSmileWink size={25} />
                      <span className="font-medium">Connect Plug Wallet !</span>
                    </>
                  ) : (
                    <>
                      <ImSad size={25} />
                      <span className="font-medium">
                        Seems you have no supplies!
                      </span>
                    </>
                  )}
                </Flex>
              ),
            }}
            pagination={false}
            rowKey={(e) => `asset-supplies-${e?.id}-${e?.timestamp}`}
            tableColumns={AssetSupplyTableColumns}
            tableData={plugAddress ? assetSupplies : []}
          />
        </>
      ),
    },
  ];

  const assetsToSupplyItems = [
    {
      key: "asset-to-supply-1",
      label: (
        <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
          Approved Assets
        </Text>
      ),
      children: (
        <>
          <TableComponent
            locale={{
              emptyText: (
                <Flex align="center" justify="center" gap={5}>
                  {!plugAddress ? (
                    <>
                      <FaRegSmileWink size={25} />
                      <span className="font-medium">Connect Plug Wallet !</span>
                    </>
                  ) : (
                    <>
                      <ImSad size={25} />
                      <span className="font-medium">
                        Seems you have no assets!
                      </span>
                    </>
                  )}
                </Flex>
              ),
            }}
            loading={{
              spinning: loadingState.isTokenData,
              indicator: <Bars />,
            }}
            pagination={{ pageSize: 4 }}
            rowKey={(e) => `${e?.id}-${e?.number}`}
            tableColumns={AssetsToSupplyTableColumns}
            tableData={approvedAssets ? approvedAssets : []}
          />
        </>
      ),
    },
  ];

  const yourLendsItems = [
    {
      key: "lend-1",
      label: (
        <>
          <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
            Your Lendings
          </Text>
        </>
      ),
      children: (
        <TableComponent
          locale={{
            emptyText: (
              <Flex align="center" justify="center" gap={5}>
                {!plugAddress ? (
                  <>
                    <FaRegSmileWink size={25} />
                    <span className="font-medium">Connect Plug Wallet !</span>
                  </>
                ) : (
                  <>
                    <ImSad size={25} />
                    <span className="font-medium">
                      Seems you have no active lendings!
                    </span>
                  </>
                )}
              </Flex>
            ),
          }}
          loading={{ spinning: loadingState.isLendData, indicator: <Bars /> }}
          tableColumns={yourLendTableColumns}
          tableData={userActiveLendData}
          pagination={false}
        />
      ),
    },
  ];

  const assetsToLendItems = [
    {
      key: "asset-to-lend-1",
      label: (
        <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
          Assets to Lend
        </Text>
      ),
      children: (
        <TableComponent
          locale={{
            emptyText: (
              <Flex align="center" justify="center" gap={5}>
                {!plugAddress ? (
                  <>
                    <FaRegSmileWink size={25} />
                    <span className="font-medium">Connect Plug Wallet !</span>
                  </>
                ) : (
                  <>
                    <ImSad size={25} />
                    <span className="font-medium">
                      Seems, no assets to lend!
                    </span>
                  </>
                )}
              </Flex>
            ),
          }}
          loading={{ spinning: loadingState.isLendData, indicator: <Bars /> }}
          rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
          tableColumns={assetsToLendTableColumns}
          tableData={lendData}
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <>
      {walletState.active?.length > 0 ? (
        <>
          <Row justify={"space-between"} align={"middle"}>
            <Col>
              <Title level={2} className="gradient-text-one">
                Dashboard
              </Title>
            </Col>
          </Row>
          <Row justify={"space-between"} className="mt-15" gutter={32}>
            <Col xl={12} sm={24}>
              <Row>
                <Col sm={24}>
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["supply-1", "supply-2"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#5aa39f"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={YourSuppliesItems}
                  />
                </Col>
              </Row>

              <Row className="mt-30 m-bottom">
                <Col sm={24}>
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={[
                      "asset-to-supply-1",
                      "asset-to-supply-2",
                    ]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#5aa39f"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={assetsToSupplyItems}
                  />
                </Col>
              </Row>
            </Col>

            <Col xl={12} sm={24}>
              <Row>
                <Col sm={24}>
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["lend-1"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#5aa39f"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={yourLendsItems}
                  />
                </Col>
              </Row>

              <Row className="mt-30 m-bottom">
                <Col sm={24}>
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["asset-to-lend-1"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#5aa39f"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={assetsToLendItems}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row justify={"center"} className="mt-150">
            <LiaConnectdevelop
              color="violet"
              style={{ borderRadius: "50%" }}
              className="egg"
              size={150}
            />
          </Row>
          <Row justify={"center"}>
            <Text className="text-color-one font-large font-weight-600">
              Connect your wallet!
            </Text>
          </Row>
          <Row justify={"center"}>
            <Text className="text-color-two font-small mt">
              Please connect the wallet to see your supplies, borrowings, and
              open positions.
            </Text>
          </Row>
        </>
      )}

      {/* Transfer asset to supply - Location: Approved Asset (C2)*/}
      <ModalDisplay
        title={
          <Row className="black-bg white-color font-large">Supply Asset</Row>
        }
        width={"25%"}
        open={handleSupplyTransferModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Flex vertical>
          <Text className="text-color-two font-small iconalignment">
            Amount <HiOutlineInformationCircle />
          </Text>
          <Input
            readOnly
            className="inputStyle"
            style={{ fontSize: "20px" }}
            value={1}
          />
        </Flex>

        <Row className="mt-15">
          <Text className="text-color-two font-small">
            Transaction overview
          </Text>
        </Row>

        <Flex vertical className="card-box">
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">
                Collateralization
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "green" }} className="font-small">
                Enabled
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Health factor</Text>
            </Col>
            <Col>
              <Flex vertical align="end">
                <Text style={{ color: "green" }} className="font-small">
                  7.79 - 8.24
                </Text>
              </Flex>
            </Col>
          </Row>
        </Flex>

        <Flex vertical className={"modalBoxGreenShadow mt"}>
          <Row justify={"space-between"}>
            <Col className={"iconalignment"}>
              <HiOutlineInformationCircle />
              <span>You are sending asset to supply!</span>
            </Col>
          </Row>
        </Flex>

        <>
          <CustomButton
            loading={loadingState.isSupplyAsset}
            className={
              "font-weight-600 mt width letter-spacing-small d-flex-all-center"
            }
            title={"Transfer"}
            onClick={handleSupplyAssetTransfer}
          />
        </>
      </ModalDisplay>

      {/* Lend token Transfer Modal */}
      <ModalDisplay
        title={
          <Row className="black-bg white-color font-large">Lend ckBTC</Row>
        }
        open={lendTransferModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
        width={"25%"}
      >
        <Flex vertical>
          <Text className="text-color-two font-small iconalignment">
            Amount <HiOutlineInformationCircle />
          </Text>
          <Input
            readOnly
            style={{ fontSize: "20px" }}
            value={lendTransferData.actual_amount / BTC_ZERO}
            suffix={
              <Flex vertical align="end">
                <span className="text-color-one font-small iconalignment font-weight-600">
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width="30dvw"
                  />
                </span>
              </Flex>
            }
          />
        </Flex>

        <Flex align="center" gap={5}>
          <span className="text-color-two">Value of</span>
          {lendTransferData.halfFloor !== null ? (
            <>
              <span className="text-color-one font-small letter-spacing-small">
                ${(lendTransferData.halfFloor * icpvalue).toFixed(2)}
              </span>
            </>
          ) : (
            <Loading
              spin={!lendTransferData.halfFloor}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          )}
        </Flex>

        <Row className="mt-15">
          <Text className="text-color-two font-small">
            Transaction overview
          </Text>
        </Row>

        <Flex vertical className="card-box">
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Due on</Text>
            </Col>
            <Col>
              <Text className="text-color-one font-small">
                7 days from lending
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">
                Collateralization
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "green" }} className="font-small">
                Enabled
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Health factor</Text>
            </Col>
            <Col>
              <Flex vertical align="end">
                <Text style={{ color: "green" }} className="font-small">
                  7.79 - 8.24
                </Text>
              </Flex>
            </Col>
          </Row>
        </Flex>

        <Flex vertical className={"modalBoxGreenShadow mt"}>
          <Row justify={"space-between"}>
            <Col className={"iconalignment"}>
              <HiOutlineInformationCircle />
              <span>
                You are lending an asset with repay duration of 7 days!
              </span>
            </Col>
          </Row>
        </Flex>

        <>
          <CustomButton
            loading={loadingState.isLendCkbtcBtn}
            className={
              "font-weight-600 mt width  letter-spacing-small d-flex-all-center"
            }
            title={
              <Flex align="center" justify="center" gap={5}>
                <span>Lend ckBTC</span>
                <img
                  src={Bitcoin}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width="25dvw"
                />
              </Flex>
            }
            onClick={handleLendAssetTransfer}
          />
        </>
      </ModalDisplay>

      {/* Repayment modal C1 */}
      <ModalDisplay
        title={
          <Row className="black-bg white-color font-large">Repay ckBTC</Row>
        }
        open={repayCanisterModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
        width={"25%"}
      >
        <Flex vertical>
          <Text className="text-color-two font-small iconalignment">
            Amount <HiOutlineInformationCircle />
          </Text>
          <Input
            readOnly
            style={{ fontSize: "20px" }}
            value={Number(repayCanisterData.repayment_amount) / BTC_ZERO}
            suffix={
              <Flex vertical align="end">
                <span className="text-color-one font-small iconalignment font-weight-600">
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width="30dvw"
                  />
                </span>
              </Flex>
            }
          />
        </Flex>

        <span className="text-color-two font-small letter-spacing-small">
          ${(Number(repayCanisterData.repayment_amount) / BTC_ZERO) * 45000}
        </span>

        <Row className="mt-15">
          <Text className="text-color-two font-small">
            Transaction overview
          </Text>
        </Row>

        <Flex vertical className="card-box">
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Due on</Text>
            </Col>
            <Col>
              <Text className="text-color-one font-small">
                {repayCanisterData.due_at}
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">
                Collateralization
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "green" }} className="font-small">
                Enabled
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Health factor</Text>
            </Col>
            <Col>
              <Flex vertical align="end">
                <Text style={{ color: "green" }} className="font-small">
                  7.79 - 8.24
                </Text>
              </Flex>
            </Col>
          </Row>
        </Flex>
        <Flex
          vertical
          className={`${
            Date.now() >
            daysCalculator(Number(repayCanisterData.lendData.timestamp))
              .timestamp
              ? "modalBoxRedShadow"
              : "modalBoxGreenShadow"
          } mt`}
        >
          <Row justify={"space-between"}>
            <Col className="iconalignment">
              <HiOutlineInformationCircle />
              <span>
                {Date.now() >
                daysCalculator(Number(repayCanisterData.lendData.timestamp))
                  .timestamp
                  ? "The due date exceeded, You should repay the amount. If not, the asset will be send to the borrower."
                  : "You are paying the amount before due date!"}
              </span>
            </Col>
          </Row>
        </Flex>

        <>
          <CustomButton
            loading={loadingState.isRepayBtn}
            className={
              "font-weight-600 m-25 width letter-spacing-small d-flex-all-center"
            }
            title={
              <Flex align="center" justify="center" gap={5}>
                <span>Repay ckBTC</span>
                <img
                  src={Bitcoin}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width="25dvw"
                />
              </Flex>
            }
            onClick={handleRepayToCanister}
          />
        </>
      </ModalDisplay>

      {/* Displaying asset details */}
      <ModalDisplay
        width={"45%"}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small">
            Details
          </Row>
        }
        footer={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row className="mt-20">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Asset Info
            </Text>
          </Col>
          <Col md={18}>
            <Row align={"middle"}>
              <Col md={12}>
                {supplyItems && (
                  <>
                    <Row>
                      <img
                        src={`https://${supplyItems.canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${supplyItems.tokenId}`}
                        alt={`${supplyItems?.id}-borrow_image`}
                        className="border-radius-30"
                        width={125}
                      />
                    </Row>
                    <Row>
                      <Text className="text-color-one ml font-weight-600 font-small">
                        {supplyItems.id}
                      </Text>
                    </Row>
                  </>
                )}
              </Col>

              <Col md={12}>
                <Row>
                  <Flex vertical>
                    <Text className="text-color-two font-small">Token Id</Text>

                    <Text className="text-color-one font-small font-weight-600 iconalignment">
                      {sliceAddress(supplyItems?.tokenId, 7)}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(supplyItems?.tokenId);
                            setCopy("Copied");
                            setTimeout(() => {
                              setCopy("Copy");
                            }, 2000);
                          }}
                          size={20}
                          color="#764ba2"
                        />
                      </Tooltip>
                    </Text>
                  </Flex>
                </Row>
                <Row>
                  <Flex vertical>
                    <Text className="text-color-two font-small">USD</Text>

                    <Text className="text-color-one font-small font-weight-600 iconalignment">
                      $
                      {(
                        (Number(supplyItems?.floorPrice[3]) / BTC_ZERO) *
                        icpvalue
                      ).toFixed(2)}
                    </Text>
                  </Flex>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />
        <Row className="mt-15">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Collection Info
            </Text>
          </Col>
          <Col md={18}>
            <Row justify={"center"}>
              <Text className="gradient-text-two font-xslarge font-weight-600 ">
                {Capitalaize(supplyItems?.collectionName)}
              </Text>
            </Row>

            <Row className="mt-30" justify={"space-between"}>
              <Flex vertical className="cardStyle">
                <Text className="text-color-two font-small">
                  Collection Name
                </Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyItems?.collectionName}
                </Text>
              </Flex>
              <Flex vertical className="cardStyle">
                <Text className="text-color-two font-small">Canister ID</Text>

                <Text className="text-color-one font-small font-weight-600">
                  <Tooltip
                    arrow
                    title={copy}
                    trigger={"hover"}
                    placement="top"
                    onClick={() => {
                      navigator.clipboard.writeText(supplyItems?.canisterId);
                      setCopy("Copied");
                      setTimeout(() => {
                        setCopy("Copy");
                      }, 2000);
                    }}
                    className="pointer"
                  >
                    {sliceAddress(supplyItems?.canisterId, 3)}
                  </Tooltip>
                </Text>
              </Flex>
              <Flex vertical className="cardStyle">
                <Text className="text-color-two font-small">Floor Price</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {Number(supplyItems?.floorPrice[3])}
                </Text>
              </Flex>
            </Row>
          </Col>
        </Row>
      </ModalDisplay>
    </>
  );
};
export default propsContainer(Dashboard);
