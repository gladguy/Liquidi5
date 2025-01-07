import { Principal } from "@dfinity/principal";
import {
  Carousel,
  Col,
  Collapse,
  Flex,
  Grid,
  Rate,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { BsDiscord } from "react-icons/bs";
import { FaTelegram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import onchain_light from "../../assets/backed/100_onchain.png";
import onchain_dark from "../../assets/backed/100_onchain_dark.png";
import infinity from "../../assets/backed/Infinity.png";
import dfinity_grantee from "../../assets/backed/dfinity_grantee.png";
import motoko from "../../assets/backed/motoko_gif.gif";
import borrow_working from "../../assets/backgrounds/borrow_working.png";
import borrowing from "../../assets/backgrounds/borrowing.png";
import borrowing_light from "../../assets/backgrounds/borrowing_light.png";
import lend_working from "../../assets/backgrounds/lend_working.png";
import lending from "../../assets/backgrounds/lending.png";
import lending_light from "../../assets/backgrounds/lending_light.png";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import liquidify_light from "../../assets/liquidify_logo_light.png";
import CustomButton from "../../component/Button";
import { CardDisplay } from "../../component/card";
import TypingAnimation from "../../component/typing";
import { propsContainer } from "../../container/props-container";
import { nftCommonIdlFactory } from "../../nft_canister";
import {
  agentCreator,
  calculateAPY,
  DISCORD,
  getUniqueRandomNumbers,
  MAILTO,
  TELEGRAM,
  TWITTER,
} from "../../utils/common";

const Home = (props) => {
  const themes = props.theme;

  const { Text } = Typography;
  const { reduxState } = props.redux;
  const constantState = reduxState.constant;

  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const navigate = useNavigate();

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const collections = constantState.approvedCanisters;
  const icpValue = constantState.icpvalue;

  const [collectionList, setCollectionList] = useState(collections.slice(0, 9));
  const [transformCards, setTransformCards] = useState([
    {
      image: "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=615",
      rotateValue: "-15",
      collectionName: "BTC Flower",
    },
    {
      image: "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=513",
      rotateValue: "-5",
      collectionName: "Boxy Girl",
    },
    {
      image: "https://hdem4-ryaaa-aaaam-qa4xa-cai.raw.ic0.app/?index=724",
      rotateValue: "-25",
      collectionName: "Motoko Ghosts",
    },
  ]);

  // const statCards = [
  //   {
  //     title: "Total loan value",
  //     value: "$500K+",
  //   },
  //   {
  //     title: "Total active loans",
  //     value: "56K+",
  //   },
  //   {
  //     title: "Total offers",
  //     value: "1M+",
  //   },
  // ];

  // const jumbleCollectionCards = async () => {
  //   const array = getUniqueRandomNumbers(collections.length);
  //   const cards = array.map((num, index) => {
  //     const col = collections[num];
  //     return {
  //       image: col.thumbnailURI,
  //       rotateValue: index === 0 ? "-15" : index === 1 ? "-5" : "-25",
  //       collectionName: col.collectionName,
  //     };
  //   });
  //   setTransformCards(cards);
  // };

  // useEffect(() => {
  //   if (collectionList) {
  //     let scrollInterval;
  //     if (collections.length > 4) {
  //       scrollInterval = setInterval(async () => {
  //         jumbleCollectionCards();
  //       }, [10000]);
  //     }
  //     return () => clearInterval(scrollInterval);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const list = [
    {
      title: "Fund your ckBTC & start provide loan offers",
      value:
        "First, you need to fund your ckBTC and set the desired terms of the loan. After you funded your ckBTC, other users will accept your credit offers.",
    },
    {
      title: "Receive loan offers & accept the best one",
      value:
        "When you accept a loan offer, your NFT goes into a secure escrow smart contract, and you receive the ckBTC from the lender directly to your wallet!",
    },
    {
      title: "Repay the loan & get your NFT back",
      value:
        "If you repay your loan in time, you will automatically receive your NFT back in your wallet!",
    },
  ];

  const carousel = [
    {
      author: "Darrik Stone",
      value:
        "My experience with liquidify has been amazing. Once you realize that you can get money from your 'illiquid' NFT and still keep it, it's a no-brainer. Being able to fix the terms directly with the other party is the best part.",
      rating: 5,
    },
    {
      author: "Jenisha Hepzhibha",
      value:
        "I love the idea of being able to quickly access liquidity against assets in a permission-less peer-to-peer way. Got my biggest W in the space by utilizing liquidify, forever grateful!",
      rating: 4.5,
    },
    {
      author: "Pearl Rachel",
      value:
        "Earned some nice interest on lending. The most valuable aspect of liquidify is a really clean UI and trusted site with real individuals interacting to come to an agreement on lending conditions.",
      rating: 4,
    },
  ];

  const faqQuestions = [
    {
      key: "1",
      question: "Does Liquidify charge a fee?",
      answer:
        "There are no fees for borrowers on Liquidify. The Liquidify protocol fee for lenders is 5% of the interest earned by lenders on loans. In the case of a loan default, there is no protocol fee.",
    },
    {
      key: "2",
      question: "Is Liquidify safe to use?",
      answer:
        "Liquidify is a peer-to-peer platform connecting NFT holders andliquidity providers directly via permissionless smart contractinfrastructure. The Liquidify team at no point has access to any assetor is involved in any way in the negotiation of terms between Lendersand Borrowers. Since Liquidify's first loan in May 2020, we have doneover $400m in loan volume spread over more than 40,000 loans, and noborrower has ever had an asset stolen.",
    },
    {
      key: "3",
      question: "Why do collectors and artists love Liquidify?",
      answer:
        "The ability to access liquidity against their NFTs without selling the asset gives unprecedented financial flexibility to NFT holders, especially if they have a large percentage of their portfolio locked up in these illiquid assets.",
    },
  ];

  const collapseConstructor = () => {
    return faqQuestions.map((content) => {
      return {
        key: content.key,
        label: (
          <Text
            className={`${
              themes ? "gradient-text-one" : "light-color-primary"
            } font-size-20 letter-spacing-small`}
          >
            {content.question}
          </Text>
        ),
        children: (
          <p
            style={{
              paddingLeft: 24,
            }}
            className={`${
              themes ? "text-color-one" : "gradient-text-two"
            } font-size-18 letter-spacing-small`}
          >
            {content.answer}
          </p>
        ),
      };
    });
  };

  const fetchBorrowData = async () => {
    const tokens = collections.map(async (canister) => {
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
    setCollectionList(promise);
  };

  useEffect(() => {
    (async () => {
      if (collections[0]?.collectionID) {
        await fetchBorrowData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  return (
    <>
      <Row>
        <Title
          level={2}
          className={themes ? "gradient-text-one" : "light-color-gradient"}
        >
          Approved Collections
        </Title>
      </Row>

      <Row justify={"start"} gutter={[32, 32]} className="mt-15">
        {collectionList?.map((collection, index) => {
          const name = collection?.collectionName;
          const nameSplitted = collection?.collectionName?.split(" ");
          let modifiedName = "";
          nameSplitted?.forEach((word) => {
            if ((modifiedName + word).length < 25) {
              modifiedName = modifiedName + " " + word;
            }
          });
          const floor = collection?.floorPrice ? collection?.floorPrice : 0.5;

          return (
            <Col
              key={`${Number(collection?.collectionID)}-${index}`}
              lg={8}
              md={12}
              sm={12}
              xs={24}
            >
              <Skeleton
                loading={!collection.collectionName}
                className={themes ? "skeleton-themed" : ""}
                active
              >
                <CardDisplay
                  className={`${
                    themes
                      ? "border-light border-1 dark-bg-primary"
                      : "light-bg-primary border-none"
                  } border-radius-8 zoom`}
                >
                  <Row
                    justify={{ xs: "space-between", md: "center" }}
                    align={"middle"}
                    className={breakpoints.xs || breakpoints.md ? "mt-5" : ""}
                    gutter={breakpoints.xs || breakpoints.md ? [0, 12] : []}
                  >
                    <Col xs={24} md={24} lg={5} xl={5}>
                      <Row justify={"center"}>
                        <img
                          className="border-radius-5"
                          alt={`lend_image`}
                          src={collection.thumbnailURI}
                          height={120}
                          width={120}
                        />
                      </Row>
                    </Col>

                    <Col xs={24} sm={20} md={20} lg={18} xl={18}>
                      <Row justify={"center"}>
                        <Col>
                          <div
                            style={{ display: "grid", placeContent: "center" }}
                          >
                            {name?.length > 25 ? (
                              <Tooltip
                                arrow
                                title={
                                  <Text
                                    className={`${
                                      themes
                                        ? "text-color-one"
                                        : "light-color-primary"
                                    } letter-spacing-small`}
                                  >
                                    {`${name}`}
                                  </Text>
                                }
                                color={themes ? "#31AADE" : "#fff"}
                              >
                                <Text
                                  className={`${
                                    themes
                                      ? "text-color-two"
                                      : "light-color-secondary"
                                  } font-large letter-spacing-small`}
                                >
                                  {`${modifiedName}...`}
                                </Text>
                              </Tooltip>
                            ) : (
                              <Text
                                className={`${
                                  themes
                                    ? "text-color-two"
                                    : "light-color-secondary"
                                } font-large letter-spacing-small`}
                              >
                                {modifiedName}
                              </Text>
                            )}
                          </div>
                        </Col>
                      </Row>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto",
                          gridAutoFlow: "row",
                          gridColumnGap: "10px",
                          placeContent: "center",
                        }}
                      >
                        <div>
                          <Text
                            className={`${
                              themes
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-medium text-color-two`}
                          >
                            Floor
                          </Text>
                        </div>

                        <div>
                          <Text
                            gap={3}
                            align="center"
                            className={`${
                              themes
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-medium text-color-two`}
                          >
                            ∞ {floor}
                          </Text>
                        </div>

                        <div>
                          <Text
                            className={`${
                              themes
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-medium text-color-two`}
                          >
                            USD
                          </Text>
                        </div>

                        <div>
                          <Text
                            gap={3}
                            className={`${
                              themes
                                ? "gradient-text-one"
                                : "light-color-primary"
                            } font-medium text-color-two`}
                          >
                            $ {(floor * icpValue).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardDisplay>
              </Skeleton>
            </Col>
          );
        })}
      </Row>

      <Row
        className={`mt-90 padding-t-b border-radius-30 ${
          themes ? "bg-one" : ""
        }`}
        justify={"space-evenly"}
        align={"middle"}
      >
        <Col md={8}>
          <Flex vertical gap={5}>
            <h1
              className={`${
                themes ? "text-color-one" : "light-color-secondary"
              } font-xxlarge letter-spacing-small`}
            >
              Use your NFTs to get a loan
            </h1>
            <Text
              className={`${
                themes ? "text-color-two" : "light-color-primary"
              } font-medium letter-spacing-small`}
            >
              Use your NFT as collateral to borrow{" "}
              <img
                className="round"
                src={ckBtc}
                alt="noimage"
                style={{ justifyContent: "center", marginBottom: "-3px" }}
                width={20}
              />{" "}
              ckBTC from lenders. Repay your loan, and you get your NFT back.{" "}
            </Text>

            {/* Buttons */}
            <Row justify={"space-evenly"} className="mt-30">
              <Col>
                <CustomButton
                  block
                  onClick={() => navigate("/borrow")}
                  className="button-css lend-button lend-button-shine"
                  title={"Borrow a loan"}
                />
              </Col>
              <Col>
                <CustomButton
                  block
                  onClick={() => navigate("/lend")}
                  className="button-css lend-button lend-button-shine"
                  title={"Lend an offer"}
                />
              </Col>
            </Row>

            {/* Cards */}
            {/* <Flex className="mt-30" justify="space-between">
              {statCards.map((card) => {
                return (
                  <Flex
                    vertical
                    justify="center"
                    align="center"
                    className={`${
                      themes
                        ? "border-light border-1"
                        : "light-bg-primary border-none"
                    } border-radius-8 padding-15`}
                  >
                    <Text
                      className={`${
                        themes ? "gradient-text-one" : "light-color-primary"
                      } font-large letter-spacing-small`}
                    >
                      {card.value}
                    </Text>
                    <Text
                      className={`${
                        themes ? "text-color-two" : "light-color-primary"
                      } font-size-16 letter-spacing-small`}
                    >
                      {card.title}
                    </Text>
                  </Flex>
                );
              })}
            </Flex> */}
          </Flex>
        </Col>

        {/* Transform cards */}
        <Col>
          <div className="container">
            <Text
              className={`${
                themes ? "text-color-one" : "light-color-gradient"
              } float-top font-xlarge letter-spacing-medium font-weight-600`}
            >
              TOP COLLECTIONS
            </Text>
            {transformCards.map((card) => {
              return (
                <Flex
                  gap={10}
                  vertical
                  key={`${card.collectionName}-${card.image}`}
                  style={{ "--r": card.rotateValue, alignItems: "center" }}
                  className="glass"
                >
                  <img
                    width={278}
                    className="border-radius-8-8-0-0"
                    height={280}
                    src={card.image}
                    alt={`${card.collectionName}`}
                  />

                  <Text
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {card.collectionName}
                  </Text>
                </Flex>
              );
            })}
          </div>
        </Col>
      </Row>

      {/* Details */}
      <Row
        className={`mt-90 padding-t-b border-radius-30 m-bottom-4 ${
          themes ? "" : "bg-one-light"
        }`}
        justify={"space-around"}
      >
        <Col md={12}>
          <Flex vertical gap={40}>
            {list.map((details, index) => {
              return (
                <Flex
                  className={`list-hover`}
                  gap={index === 0 ? 47 : 35}
                  key={`${index}-${details.title}`}
                  justify="space-between"
                >
                  <Text
                    className={`${
                      themes
                        ? "gradient-text-one list-numbers-dark"
                        : "text-color-two list-numbers-light"
                    } font-xxlarge letter-spacing-small`}
                  >
                    {index + 1}
                  </Text>

                  <Flex vertical gap={15}>
                    <Text
                      className={`${
                        themes
                          ? "gradient-text-one list-numbers-dark"
                          : "light-color-secondary list-numbers-light"
                      } font-xlarge letter-spacing-small`}
                    >
                      {details.title}
                    </Text>

                    <Text
                      className={`${
                        themes ? "text-color-one" : "grey-color"
                      } font-large letter-spacing-small`}
                    >
                      {details.value}
                    </Text>
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </Col>

        <Col>
          <img
            width={550}
            className="mt-30"
            src={themes ? borrow_working : lend_working}
            alt="contents"
          />
        </Col>
      </Row>

      {/* Lend Display */}
      <Row
        className={`mt-90 padding-t-b border-radius-30 m-bottom-4 `}
        justify={"space-around"}
        align={"middle"}
      >
        <Col>
          <img
            width={600}
            src={themes ? lending : lending_light}
            alt="contents"
          />
        </Col>

        <Col md={10}>
          <Flex vertical gap={55}>
            <Text
              className={`heading-one font-xxxlarge ${
                themes ? "light-color-quaternary" : "light-color-primary"
              } `}
            >
              <TypingAnimation words={["Provide liquidity!"]} />
            </Text>
            <Text
              className={`${
                themes ? "card-box-dark text-color-two" : "card-box-light"
              } font-large line-height-35`}
            >
              By creating a lend request using ckBTC, you can secure the funds
              in our canister, and once a borrower accepts your request, the
              lent money will be credited directly to borrower's account for
              immediate use.
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Borrow Display */}
      <Row
        className={`mt-90 padding-t-b border-radius-30 m-bottom-4 `}
        justify={"space-around"}
        align={"middle"}
      >
        <Col md={10}>
          <Flex vertical gap={55}>
            <Text
              className={`heading-one font-xxxlarge ${
                themes ? "light-color-quaternary" : "light-color-primary"
              } `}
            >
              <TypingAnimation words={["Access funds!"]} />
            </Text>
            <Text
              className={`${
                themes ? "card-box-dark text-color-two" : "card-box-light"
              } font-large line-height-35`}
            >
              By backing a lender's loan request, you can empower to overcome
              financial obstacles and, in return, give lucrative interest.
              Select your collateral and it will be secured in our canister and
              once you repay the ckBTC it will be your's again.
            </Text>
          </Flex>
        </Col>
        <Col>
          <img
            width={600}
            src={themes ? borrowing : borrowing_light}
            alt="contents"
          />
        </Col>
      </Row>

      {/* Reviews */}
      {themes ? (
        ""
      ) : (
        <Row
          justify={"center"}
          className={`m-bottom-4 p-relative border-radius-30`}
        >
          <Col md={6}>
            <h1
              className={`${
                themes
                  ? "text-color-one dark-bg-tertiary"
                  : "light-color-quaternary light-bg-primary"
              } font-xxlarge letter-spacing-small text-bgs top-0`}
            >
              Latest Reviews
            </h1>
          </Col>
        </Row>
      )}
      <Row
        className={`${
          themes ? "gradient-bgs" : ""
        } background-css m-bottom-4 p-relative border-radius-30`}
        justify={"center"}
        align={"middle"}
      >
        {themes ? (
          <h1
            className={`${
              themes
                ? "text-color-one dark-bg-tertiary"
                : "light-color-quaternary light-bg-primary"
            } font-xxlarge letter-spacing-small text-bgs`}
          >
            Latest Reviews
          </h1>
        ) : (
          ""
        )}
        <Col md={16}>
          <Carousel autoplay>
            {carousel.map((slide, index) => {
              return (
                <div key={`${slide?.rating}${index}-${slide?.author}-`}>
                  <Flex vertical gap={15}>
                    <Text
                      className={`${
                        themes
                          ? "gradient-text-one list-numbers-dark"
                          : "light-color-secondary list-numbers-light"
                      } font-xlarge letter-spacing-small`}
                    >
                      {slide.value}
                    </Text>

                    <Text
                      className={`${
                        themes ? "text-color-one" : "grey-color"
                      } font-large letter-spacing-small`}
                    >
                      @{slide.author}
                    </Text>

                    <Rate disabled allowHalf defaultValue={slide.rating} />
                  </Flex>
                </div>
              );
            })}
          </Carousel>
        </Col>
      </Row>

      {/* Backed by */}
      <Row
        justify={"center"}
        className={`m-bottom-4 p-relative border-radius-30`}
      >
        <Col>
          <h1
            className={`${
              themes
                ? "text-color-one dark-bg-tertiary"
                : "light-color-quaternary light-bg-primary"
            } font-xxlarge letter-spacing-small bg-heading`}
          >
            Backed By
          </h1>
        </Col>
      </Row>
      <Row className={"m-bottom-4"} align={"middle"} justify={"space-around"}>
        <Col>
          <img
            src={themes ? onchain_dark : onchain_light}
            alt="logo"
            width={230}
          />
        </Col>
        <Col>
          <img src={ckBtc} alt="logo" width={150} />
        </Col>
        <Col>
          <img src={dfinity_grantee} alt="logo" width={270} />
        </Col>
        <Col>
          <img src={motoko} alt="logo" width={200} />
        </Col>
        <Col>
          <img src={infinity} alt="logo" width={230} />
        </Col>
      </Row>

      {/* FAQ */}
      <Row
        justify={"center"}
        className={`padding-t-b m-bottom border-radius-30 ${
          themes ? "" : "bg-one-light mt-150"
        }`}
        align={"middle"}
      >
        <Col md={24}>
          <Row
            justify={"center"}
            className={`${
              themes
                ? "text-color-one"
                : "light-color-quaternary light-bg-primary"
            }`}
          >
            <h1 className={`font-xxlarge letter-spacing-small`}>
              FAQ Questions
            </h1>
          </Row>
        </Col>
        <Col md={22} className={`${themes ? "" : "home-collapse"} mt-50`}>
          <Collapse items={[...collapseConstructor()]} size="large" />
        </Col>
      </Row>

      {/* Footer */}
      <Row className={`m-bottom-4 mt-150`} justify={"space-between"}>
        <Col md={12}>
          <Flex vertical gap={20}>
            <Flex vertical>
              <img
                src={liquidify_light}
                alt="logo"
                style={{ marginLeft: "-9px" }}
                width={150}
              />
            </Flex>
            <Text
              className={`${
                themes ? "text-color-one" : "grey-color"
              } font-medium letter-spacing-small`}
            >
              Liquidify is a peer-to-peer platform that lets NFT holders and
              liquidity providers connect via permissionless smart contract
              infrastructure.
            </Text>
            <Text
              className={`${
                themes ? "text-color-one" : "color-black"
              } font-medium letter-spacing-small`}
            >
              copyright © {new Date().getFullYear()}
            </Text>
          </Flex>
        </Col>

        <Col md={3}>
          <Flex vertical gap={30}>
            <Text
              className={`${
                themes ? "gradient-text-one" : "gradient-text-two"
              } font-large letter-spacing-small`}
            >
              Legal
            </Text>
            <Flex vertical gap={10}>
              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Terms & Service
              </Text>

              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Privacy Policy
              </Text>
            </Flex>
          </Flex>
        </Col>

        <Col md={3}>
          <Flex vertical gap={30}>
            <Text
              className={`${
                themes ? "gradient-text-one" : "gradient-text-two"
              } font-large letter-spacing-small`}
            >
              About
            </Text>
            <Flex vertical gap={10}>
              <Link target={"_blank"} to={"https://liquidify-us.gitbook.io/"}>
                <Text
                  className={`${
                    themes ? "text-color-two" : "light-color-primary"
                  } font-medium letter-spacing-small`}
                >
                  Docs
                </Text>
              </Link>

              <Text
                className={`${
                  themes ? "text-color-two" : "light-color-primary"
                } font-medium letter-spacing-small`}
              >
                Blogs
              </Text>
            </Flex>
          </Flex>
        </Col>

        <Col md={3}>
          <Flex vertical gap={30}>
            <Text
              className={`${
                themes ? "gradient-text-one" : "gradient-text-two"
              } font-large letter-spacing-small`}
            >
              Socials
            </Text>
            <Flex vertical gap={10}>
              <Link target={"_blank"} to={DISCORD}>
                <Flex align="center" justify="start" gap={10}>
                  <BsDiscord
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-large`}
                  />
                  <Text
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-medium letter-spacing-small`}
                  >
                    Discord
                  </Text>
                </Flex>
              </Link>

              <Link target={"_blank"} to={TWITTER}>
                <Flex align="center" justify="start" gap={10}>
                  <FaSquareXTwitter
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-large`}
                  />
                  <Text
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-medium letter-spacing-small`}
                  >
                    {"Twitter"}
                  </Text>
                </Flex>
              </Link>

              <Link target={"_blank"} to={TELEGRAM}>
                <Flex align="center" justify="start" gap={10}>
                  <FaTelegram
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-large`}
                  />
                  <Text
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-medium letter-spacing-small`}
                  >
                    {`Telegram`}
                  </Text>
                </Flex>
              </Link>

              <Link target={"_blank"} to={MAILTO}>
                <Flex align="center" justify="start" gap={10}>
                  <MdEmail
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-large`}
                  />
                  <Text
                    className={`${
                      themes ? "text-color-two" : "light-color-primary"
                    } font-medium letter-spacing-small`}
                  >
                    Email
                  </Text>
                </Flex>
              </Link>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(Home);
