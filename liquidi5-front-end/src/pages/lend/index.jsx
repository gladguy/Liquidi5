import { Principal } from "@dfinity/principal";
import { Col, Flex, Row, Typography } from "antd";
import Link from "antd/es/typography/Link";
import { useEffect, useRef, useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { TbInfoSquareRounded } from "react-icons/tb";
import Bars from "react-loading-icons/dist/esm/components/bars";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import BorrowModal from "../../component/borrow-modal";
import LendModal from "../../component/lend-modal";
import OffersModal from "../../component/offers-modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { nftCommonIdlFactory } from "../../nft_canister";
import { setOffers } from "../../redux/slice/constant";
import {
  agentCreator,
  calculateAPY,
  calculateDailyInterestRate,
} from "../../utils/common";

const Lend = (props) => {
  const { Text, Title } = Typography;
  const themes = props.theme;
  const { dispatch, reduxState } = props.redux;
  const { isPlugConnected, ckBtcAgent } = props.wallet;
  const fetchOffers = props.fetchOffers;
  const fetchAllOffers = props.fetchAllOffers;
  const fetchUserOffers = props.fetchUserOffers;

  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;
  const userAssets = reduxState.constant.userAssets;

  const icpValue = constantState.icpvalue;
  const ckBtcValue = constantState.ckBtcValue;
  const btcBalance = constantState.btcBalance;
  const maxOffers = constantState.maxOffers;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ckBtcBalance = btcBalance / BTC_ZERO;

  const approvedCanisters = constantState.approvedCanisters || null;
  const { active } = walletState;

  const [offerModalData, setOfferModalData] = useState({});
  const [borrowModalData, setBorrowModalData] = useState({});
  const [isLendModal, setIsLendModal] = useState(false);
  const [isBorrowModal, setIsBorrowModal] = useState(false);
  const [isOffersModal, setIsOffersModal] = useState(false);
  const [collapseActiveKey, setCollapseActiveKey] = useState(["2"]);
  const [lendTableData, setLendTableData] = useState(null);
  const [lendModalData, setLendModalData] = useState({});

  const amountRef = useRef(null);

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
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "APY",
      render: (_, obj) => (
        <Text
          className={`${
            themes ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          {Math.round(obj.APY)}%
        </Text>
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
              } font-size-16 letter-spacing-small`}
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
      render: (_, obj) => (
        <CustomButton
          className="button-css lend-button lend-button-shine"
          title={"Lend"}
          onClick={() => {
            // getting the value of 1 ckBTC
            const oneckBtc = 1 / ckBtcValue;
            // Converting nft asset price into dollar
            const nftUSD = obj.floorPrice * icpValue;
            // Max amount user can be avail for the nft
            const maxQuoted = Number((oneckBtc * nftUSD).toFixed(6));
            // Cutoff the amount by 2 for initial display
            const amount = maxQuoted / 2;
            // Calc 85% to display close to floor price message
            const exceedRange = ((maxQuoted * 85) / 100).toFixed(6);
            // Calc interest per day
            const interestPerDay = calculateDailyInterestRate(obj.yield);
            // Calc interest for given no of days
            const interestTerm = interestPerDay * obj.term;
            // Calc interest for n days
            const interest = (amount * interestTerm).toFixed(6);
            // Calc 15% of platformfee from interest
            const platformFee = ((interest * 15) / 100).toFixed(6);
            const sliderLTV = Math.round(
              ((amount * ckBtcValue) / nftUSD) * 100
            );

            toggleLendModal();
            setTimeout(() => {
              amountRef.current.focus();
            }, 300);
            setLendModalData({
              ...obj,
              amount,
              nftUSD,
              interest,
              maxQuoted,
              oneckBtc,
              platformFee,
              exceedRange,
              APY: obj.APY,
              interestTerm,
              interestPerDay,
              sliderLTV: obj.LTV ? obj.LTV : sliderLTV,
            });
          }}
        />
      ),
    },
  ];

  const toggleLendModal = () => {
    if (isLendModal) {
      setCollapseActiveKey(["2"]);
    }
    setIsLendModal(!isLendModal);
  };

  const toggleOfferModal = () => {
    if (isOffersModal) {
      dispatch(setOffers(null));
    }
    setIsOffersModal(!isOffersModal);
  };

  const toggleBorrowModal = () => {
    if (isBorrowModal) {
      setCollapseActiveKey(["2"]);
      setBorrowModalData({});
    }
    setIsBorrowModal(!isBorrowModal);
  };

  const fetchLendData = async () => {
    const tokens = approvedCanisters.map(async (canister) => {
      const { canisterID: canisterId, yield: yields, terms } = canister;
      const canisterID = Principal.from(canisterId).toText();
      const API = agentCreator(nftCommonIdlFactory, canisterID);

      return new Promise(async (res) => {
        try {
          const floorArray = await API.stats();
          const floorPrice = Number(Number(floorArray[3]) / BTC_ZERO);

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
    setLendTableData(promise);
  };

  const calcLendData = (amount) => {
    const interest = (amount * lendModalData.interestTerm).toFixed(6);
    // Calc 15% of platform fee.
    const platformFee = ((interest * 15) / 100).toFixed(6);
    return {
      interest,
      platformFee,
    };
  };

  useEffect(() => {
    (async () => {
      if (approvedCanisters[0]) {
        await fetchLendData();
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
          Lend
        </Title>
      </Row>

      <Row>
        <Col xs={24}>
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
              Earn interest on your ckBTC by lending it out. Borrowers provide
              NFTs as collateral. Upon repayment, you receive your ckBTC and
              interest. If the borrower fails to repay, you will receive the
              collateral instead..{" "}
              <Link
                href="https://liquidify-us.gitbook.io/liquidify.us/details/lend"
                target="_blank"
                rel="noreferrer"
                className="font-size-16 pointer"
              >
                Learn more.
              </Link>
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Lend Table */}
      <Row className="mt-30" justify={"center"}>
        <Col md={24}>
          <TableComponent
            rootClassName={themes && "table-theme"}
            loading={{
              spinning: lendTableData === null,
              indicator: <Bars />,
            }}
            rowKey={(e) => `${e?.collectionName}-${e?.collectionID}`}
            tableColumns={approvedCanisterColumns}
            tableData={lendTableData}
            pagination={false}
          />
        </Col>
      </Row>

      <LendModal
        theme={themes}
        active={active}
        amountRef={amountRef}
        ckBtcValue={ckBtcValue}
        ckBtcAgent={ckBtcAgent}
        modalState={isLendModal}
        calcLendData={calcLendData}
        ckBtcBalance={ckBtcBalance}
        lendModalData={lendModalData}
        fetchAllOffers={fetchAllOffers}
        fetchUserOffers={fetchUserOffers}
        toggleLendModal={toggleLendModal}
        isPlugConnected={isPlugConnected}
        setLendModalData={setLendModalData}
        collapseActiveKey={collapseActiveKey}
        setCollapseActiveKey={setCollapseActiveKey}
      />

      <BorrowModal
        theme={themes}
        active={active}
        ckBtcValue={ckBtcValue}
        walletState={walletState}
        modalState={isBorrowModal}
        fetchAllOffers={fetchAllOffers}
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

export default propsContainer(Lend);
