import { Principal } from "@dfinity/principal";
import { Col, Flex, Row, Typography } from "antd";
import Link from "antd/es/typography/Link";
import React, { useEffect, useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { TbInfoSquareRounded } from "react-icons/tb";
import Bars from "react-loading-icons/dist/esm/components/bars";
import { ICP_IdlFactory } from "../../ICP_canister";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import NO_IMG from "../../assets/no-image.png";
import CustomButton from "../../component/Button";
import BorrowModal from "../../component/borrow-modal";
import Notify from "../../component/notification";
import OffersModal from "../../component/offers-modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { nftCommonIdlFactory } from "../../nft_canister";
import { setOffers } from "../../redux/slice/constant";
import { agentCreator, calculateAPY } from "../../utils/common";

const Borrow = (props) => {
  const { Text, Title } = Typography;
  const themes = props.theme;
  const { reduxState, dispatch } = props.redux;
  const { isPlugConnected } = props.wallet;
  const ICP_canisterId = process.env.REACT_APP_ICP_CANISTER_ID;
  const fetchOffers = props.fetchOffers;
  const fetchAllOffers = props.fetchAllOffers;
  const fetchUserOffers = props.fetchUserOffers;
  const userOffers = reduxState.constant.userOffers;
  // const allOffers = reduxState.constant.allOffers;
  const userAssets = reduxState.constant.userAssets;

  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;

  const icpValue = constantState.icpvalue;
  const approvedCanisters = constantState.approvedCanisters || null;
  const { active } = walletState;
  const btcBalance = constantState.btcBalance;
  const ckBtcValue = constantState.ckBtcValue;
  const maxOffers = constantState.maxOffers;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ckBtcBalance = btcBalance / BTC_ZERO;

  const [offerModalData, setOfferModalData] = useState({});
  const [isBorrowModal, setIsBorrowModal] = useState(false);
  const [isOffersModal, setIsOffersModal] = useState(false);
  const [borrowModalData, setBorrowModalData] = useState({});
  const [borrowTableData, setBorrowTableData] = useState(null);
  const [collapseActiveKey, setCollapseActiveKey] = useState(["2"]);

  const approvedCanisterColumns = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <img
            className="border-radius-5"
            alt={`lend_image`}
            onError={(e) => (e.target.src = NO_IMG)}
            src={obj.thumbnailURI}
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
        </Flex>
      ),
    },
    {
      key: "Offer",
      title: "Offer",
      align: "center",
      dataIndex: "Offer",
      render: (_, obj) => {
        const collectionId = Number(obj.collectionID);
        const offer = maxOffers[collectionId];

        return (
          <Flex vertical align="center" gap={5}>
            <Flex align="center" gap={5}>
              <img
                className="round"
                src={ckBtc}
                alt="noimage"
                style={{ justifyContent: "center" }}
                width={20}
              />{" "}
              <Text
                className={`${
                  themes ? "text-color-one" : "light-color-primary"
                } font-size-16 letter-spacing-small`}
              >
                {offer?.loanAmount ? Number(offer.loanAmount) / BTC_ZERO : 0}
              </Text>
            </Flex>
            <Text
              className={`${
                themes ? "text-color-one " : "light-color-primary"
              } card-box box-padding-one pointer border-color-dark iconalignment shine font-size-16 letter-spacing-small`}
              onClick={() => {
                toggleOfferModal();
                fetchOffers(collectionId);
                setOfferModalData({
                  ...obj,
                  canisterId: obj.canister,
                  thumbnailURI: obj.thumbnailURI,
                  collectionName: obj.collectionName,
                });
              }}
            >
              <BiSolidOffer />
              Offers
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
        <Text
          className={`${
            themes ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          {obj.yield}%
        </Text>
      ),
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "term",
      render: (_, obj) => (
        <Text
          className={`${
            themes ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          {obj.term} Days
        </Text>
      ),
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "ltv",
      render: (_, obj) => {
        const collectionId = Number(obj.collectionID);
        const offer = maxOffers[collectionId];

        return (
          <Text
            className={`${
              themes ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {offer?.loanToValue ? offer.loanToValue : 0}%
          </Text>
        );
      },
    },
    {
      key: "Floor",
      title: "Floor",
      align: "center",
      dataIndex: "floor",
      render: (_, obj) => {
        const floorUSD = (obj.floorPrice * icpValue).toFixed(2);

        return (
          <Flex align="center" vertical gap={5}>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small`}
            >
              ∞ {obj.floorPrice}{" "}
            </Text>
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-primary"
              } font-size-16 letter-spacing-small `}
            >
              $ {floorUSD}{" "}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "action",
      title: " ",
      align: "center",
      dataIndex: "borrow",
      render: (_, obj) => {
        const collectionId = Number(obj.collectionID);
        const offer = maxOffers[collectionId];
        // const colOffer = allOffers[collectionId];
        const userOffer = userOffers?.find(
          (predict) => predict.ckTransactionID === offer?.ckTransactionID
        );
        const assetsInCol = userAssets?.find(
          (predict) => predict.collectionName === obj?.collectionName
        );

        return (
          <CustomButton
            className="button-css lend-button lend-button-shine"
            title={"Borrow"}
            onClick={async () => {
              const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
              const offers = await API.getOffer(collectionId);

              if (!offers?.length) {
                Notify("info", "No offers available!");
              } else if (userOffer) {
                Notify("info", "Can't borrow for your request!");
              } else if (!assetsInCol) {
                Notify("info", "No assets found!");
              } else if (offer?.length && assetsInCol) {
                let assets = [];
                if (userAssets) {
                  assets = userAssets.filter(
                    (asset) => asset.collectionName === obj.collectionName
                  );
                }
                toggleBorrowModal();
                setBorrowModalData({
                  ...offer,
                  assets,
                  collateral: "",
                  canisterId: obj.canister,
                  contentType: obj.contentType,
                  thumbnailURI: obj.thumbnailURI,
                  collectionName: obj.collectionName,
                });
              }
            }}
          />
        );
      },
    },
  ];

  const toggleBorrowModal = () => {
    if (isBorrowModal) {
      setCollapseActiveKey(["2"]);
      setBorrowModalData({});
    }
    setIsBorrowModal(!isBorrowModal);
  };

  const toggleOfferModal = () => {
    if (isOffersModal) {
      dispatch(setOffers(null));
    }
    setIsOffersModal(!isOffersModal);
  };

  const fetchBorrowData = async () => {
    const tokens = approvedCanisters.map(async (canister) => {
      const { canisterID: canisterId, yield: yields, terms } = canister;
      const canisterID = Principal.from(canisterId).toText();
      const API = agentCreator(nftCommonIdlFactory, canisterID);

      return new Promise(async (res) => {
        try {
          const floorArray = await API.stats();
          const floorPrice = Number(Number(floorArray[3]) / BTC_ZERO).toFixed(
            2
          );

          const term = Number(terms);
          const APY = calculateAPY(yields, term);
          const LTV = 0;

          res({
            ...canister,
            canister: canisterID,
            floorArray,
            floorPrice,
            term,
            LTV,
            APY,
          });
        } catch (error) {
          console.log(error);
        }
      });
    });

    const promise = await Promise.all(tokens);
    let fullData = [],
      offerData = [];
    promise.forEach((collection) => {
      const collectionId = Number(collection.collectionID);
      const offer = maxOffers[collectionId];
      if (offer) {
        offerData.push(collection);
      } else {
        fullData.push(collection);
      }
    });
    const allData = offerData.concat(...fullData);
    setBorrowTableData(allData);
  };

  useEffect(() => {
    (async () => {
      if (approvedCanisters[0]) {
        await fetchBorrowData();
        await fetchAllOffers();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedCanisters]);

  return (
    <>
      <Row>
        <Title
          level={2}
          className={themes ? "gradient-text-one" : "light-color-gradient"}
        >
          Borrow
        </Title>
      </Row>

      <Row>
        <Col xs={24}>
          <Flex
            align="center"
            gap={5}
            className={`${
              themes ? "" : "card-border-light"
            } border pointer border-radius-8`}
          >
            <TbInfoSquareRounded
              size={18}
              color={themes ? "#adadad" : "#333333"}
            />
            <Text
              className={`${
                themes ? "text-color-two" : "light-color-primary"
              } font-small letter-spacing-small`}
            >
              Borrow ckBTC with your NFT as collateral here. Failure to repay
              results in loan default and collateral transfer to the lender.{" "}
              <Link
                target="_blank"
                href="https://liquidify-us.gitbook.io/liquidify.us/details/portfolio/borrow-ckbtc"
                className="font-size-16 pointer"
              >
                Learn more.
              </Link>
            </Text>
          </Flex>
        </Col>
      </Row>

      <Row className="mt-60" justify={"center"}>
        <Col md={24}>
          <TableComponent
            rootClassName={themes && "table-theme"}
            loading={{
              spinning: borrowTableData === null,
              indicator: <Bars />,
            }}
            rowKey={(e) => `${e?.collectionName}-${e?.collectionID}`}
            tableColumns={approvedCanisterColumns}
            tableData={borrowTableData}
            pagination={false}
          />
        </Col>
      </Row>

      <BorrowModal
        theme={themes}
        active={active}
        ckBtcValue={ckBtcValue}
        walletState={walletState}
        modalState={isBorrowModal}
        ckBtcBalance={ckBtcBalance}
        fetchAllOffers={fetchAllOffers}
        fetchUserOffers={fetchUserOffers}
        borrowModalData={borrowModalData}
        isPlugConnected={isPlugConnected}
        collapseActiveKey={collapseActiveKey}
        toggleBorrowModal={toggleBorrowModal}
        setBorrowModalData={setBorrowModalData}
        setCollapseActiveKey={setCollapseActiveKey}
      />

      <OffersModal
        active={active}
        theme={themes}
        userAssets={userAssets}
        modalState={isOffersModal}
        ckBtcBalance={ckBtcBalance}
        offerModalData={offerModalData}
        borrowModalData={borrowModalData}
        isPlugConnected={isPlugConnected}
        toggleOfferModal={toggleOfferModal}
        toggleBorrowModal={toggleBorrowModal}
        setOfferModalData={setOfferModalData}
        setBorrowModalData={setBorrowModalData}
      />
    </>
  );
};

export default propsContainer(Borrow);
