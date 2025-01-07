import { Principal } from "@dfinity/principal";
import { Col, Flex, Row, Typography } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import React, { Suspense, useEffect, useState } from "react";
import { BsDiscord } from "react-icons/bs";
import { FaRegCopyright, FaTelegram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { ThreeDots } from "react-loading-icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { ICP_IdlFactory } from "../ICP_canister";
import CursorFollower from "../component/cursor";
import LoadingWrapper from "../component/loading-wrapper";
import Mainheader from "../container/header";
import { nftCommonIdlFactory } from "../nft_canister";
import {
  setAllOffers,
  setDashboardData,
  setMaxOffers,
  setOffers,
  setUserAssets,
  setUserOffers,
} from "../redux/slice/constant";
import {
  DISCORD,
  MAILTO,
  Pages,
  TELEGRAM,
  TWITTER,
  agentCreator,
  principalToAccountIdentifier,
  tokenIdentifier,
} from "../utils/common";

const MainLayout = () => {
  const { Text } = Typography;
  const ICP_canisterId = process.env.REACT_APP_ICP_CANISTER_ID;
  const reduxState = useSelector((state) => state);
  const location = useLocation();
  const walletState = reduxState.wallet;
  const approvedCanisters = reduxState.constant.approvedCanisters || null;

  const plugAddress = walletState.plug.principalId;
  const stoicAddress = walletState.stoic.address;
  const active = walletState.active;
  const [isDark, setIsDark] = useState(
    JSON.parse(localStorage.getItem("theme"))
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", JSON.stringify(true));
      setIsDark(true);
    }
  }, []);

  const fetchAllOffers = async () => {
    const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
    const allOffers = await API.getOffers();
    let obj = {};
    allOffers.forEach((offers) => {
      obj = {
        ...obj,
        [Number(offers[0])]: offers[1],
      };
    });
    dispatch(setAllOffers(obj));

    const maxOffers = await API.getMaxLoanAmounts();
    let objConst = {};
    maxOffers.forEach((offers) => {
      objConst = {
        ...objConst,
        [Number(offers[0])]: offers[1],
      };
    });
    dispatch(setMaxOffers(objConst));
  };

  const fetchUserOffers = async () => {
    const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
    const resultOffers = await API.getUserOffers(
      Principal.fromText(plugAddress ? plugAddress : stoicAddress)
    );
    if (resultOffers.length) {
      const [, offers] = resultOffers[0];
      dispatch(setUserOffers(offers));
    } else {
      dispatch(setUserOffers([]));
    }
  };

  const fetchOffers = async (collectionId) => {
    const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
    const offers = await API.getOffer(collectionId);
    dispatch(setOffers(offers));
  };

  const fetchUserDashCards = async (collectionId) => {
    const API = agentCreator(ICP_IdlFactory, ICP_canisterId);
    const dashData = await API.getUserData(
      Principal.fromText(plugAddress ? plugAddress : stoicAddress)
    );
    dispatch(setDashboardData(dashData));
  };

  const fetchUserAssets = async () => {
    try {
      const accountId = principalToAccountIdentifier(plugAddress, 0);

      const tokens = approvedCanisters.map(async (canister) => {
        const { canisterID, collectionName, collectionURI, contentType } =
          canister;
        const canisterId = Principal.from(canisterID).toText();

        const API = agentCreator(nftCommonIdlFactory, canisterId);

        return new Promise(async (res, rej) => {
          try {
            const result = await API.tokens(accountId);
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
      dispatch(setUserAssets(flattenedArray));
    } catch (error) {
      console.log("error Fetch User Assets", error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAllOffers();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (active.length) {
        await fetchUserOffers();
        await fetchUserDashCards();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    (async () => {
      if (active.length && approvedCanisters[0]) await fetchUserAssets();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, approvedCanisters]);

  return (
    <React.Fragment>
      <LoadingWrapper>
        <Header className={`${!isDark && "header-light-theme"} header-sticky`}>
          <Row justify={"center"}>
            <Col xs={23}>
              <Mainheader theme={isDark} toggler={setIsDark} />
            </Col>
          </Row>
        </Header>

        <Content
          style={{
            backgroundColor: isDark ? "#0B1215" : "white",
            minHeight: "83vh",
            cursor: location.pathname === "/" ? "none" : "auto",
          }}
        >
          <Row justify={"center"}>
            <Col xs={23}>
              <Routes>
                {Pages.map((route, index) => {
                  let Component = route.component;
                  return (
                    <Route
                      key={`route-${index}`}
                      path={route.path}
                      element={
                        <Suspense
                          fallback={
                            <Row
                              justify={"center"}
                              align={"middle"}
                              className="mt-20rem"
                            >
                              <ThreeDots stroke="#000" />
                            </Row>
                          }
                        >
                          <Component
                            theme={isDark}
                            toggler={setIsDark}
                            fetchOffers={fetchOffers}
                            fetchAllOffers={fetchAllOffers}
                            fetchUserOffers={fetchUserOffers}
                            fetchUserAssets={fetchUserAssets}
                          />
                        </Suspense>
                      }
                    />
                  );
                })}
              </Routes>{" "}
            </Col>
          </Row>
          {location.pathname === "/" ? <CursorFollower /> : ""}
        </Content>

        {location.pathname === "/" ? (
          ""
        ) : (
          <Footer className={isDark ? "footer-bg" : "light-bg-primary"}>
            <Flex gap={5} justify={"space-evenly"} align={"center"}>
              <Link target={"_blank"} to={DISCORD}>
                <BsDiscord
                  className={`${
                    isDark ? "text-color-two" : "light-color-primary"
                  } pointer font-large`}
                />
              </Link>

              <Link target={"_blank"} to={TWITTER}>
                <FaSquareXTwitter
                  className={`${
                    isDark ? "text-color-two" : "light-color-primary"
                  } pointer font-large`}
                />
              </Link>
              <Flex gap={5} justify={"center"} align={"center"}>
                <Text
                  className={`${
                    isDark ? "grey-color" : "light-color-gradient"
                  } font-medium`}
                >
                  Liquidify
                </Text>
                <FaRegCopyright
                  className={isDark ? "grey-color" : "light-color-gradient"}
                  size={17}
                />
                <Text
                  className={`${
                    isDark ? "grey-color" : "light-color-gradient"
                  } font-medium`}
                >
                  {new Date().getFullYear()}
                </Text>
              </Flex>

              <Link target={"_blank"} to={TELEGRAM}>
                <FaTelegram
                  className={`${
                    isDark ? "text-color-two" : "light-color-primary"
                  } pointer font-large`}
                />
              </Link>

              <Link target={"_blank"} to={MAILTO}>
                <MdEmail
                  className={`${
                    isDark ? "text-color-two" : "light-color-primary"
                  } pointer font-large`}
                />
              </Link>
            </Flex>
          </Footer>
        )}
      </LoadingWrapper>
    </React.Fragment>
  );
};

export default MainLayout;
