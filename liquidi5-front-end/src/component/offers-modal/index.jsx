import { Col, Flex, Row, Typography } from "antd";
import Title from "antd/es/typography/Title";
import Bars from "react-loading-icons/dist/esm/components/bars";
import { useSelector } from "react-redux";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import { getTimeAgo } from "../../utils/common";
import CustomButton from "../Button";
import ModalDisplay from "../modal";
import TableComponent from "../table";

const OffersModal = ({
  theme,
  userAssets,
  modalState,
  offerModalData,
  toggleOfferModal,
  toggleBorrowModal,
  setOfferModalData,
  setBorrowModalData,
}) => {
  const { Text } = Typography;
  const state = useSelector((state) => state);
  const offers = state.constant.offers;
  const userOffers = state.constant.userOffers;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const activeOffersColumns = [
    {
      key: "Principal",
      title: "Principal",
      align: "left",
      dataIndex: "loanAmount",
      render: (_, obj) => (
        <Flex align="center" gap={3}>
          <img
            className="round"
            src={ckBtc}
            alt="noimage"
            style={{ justifyContent: "center" }}
            width={20}
          />{" "}
          <Text
            className={`${
              theme ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj?.loanAmount ? Number(obj.loanAmount) / BTC_ZERO : 0}
          </Text>
        </Flex>
      ),
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "loanToValue",
      render: (_, obj) => {
        return (
          <Text
            className={`${
              theme ? "text-color-one" : "light-color-primary"
            } font-size-16 letter-spacing-small`}
          >
            {obj.loanToValue}%
          </Text>
        );
      },
    },
    {
      key: "Date",
      title: "Date",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => (
        <Text
          className={`${
            theme ? "text-color-one" : "light-color-primary"
          } font-size-16 letter-spacing-small`}
        >
          {getTimeAgo(Number(obj.loanTime) / 1000000)}
        </Text>
      ),
    },
  ];

  return (
    <ModalDisplay
      footer={null}
      className={theme ? "" : "modal-themed"}
      open={modalState}
      onCancel={toggleOfferModal}
      width={"70%"}
    >
      <Row justify={"center"}>
        <Title
          level={2}
          className={theme ? "gradient-text-one" : "light-color-gradient"}
        >
          Offers on {offerModalData.collectionName}
        </Title>
      </Row>

      <Row justify={"space-between"}>
        {/* Active Offers */}
        <Col md={12}>
          <Row className="padding-5">
            <Col md={24} className="border border-radius-8">
              <Row justify={"center"}>
                <Text
                  className={`${
                    theme ? "text-color-two" : "light-color-primary"
                  } font-small letter-spacing-small`}
                >
                  Active Offers
                </Text>
              </Row>
            </Col>

            <Col
              className={`mt-5 ${theme ? "" : "scroll-themed"}`}
              md={24}
              style={{
                maxHeight: "600px",
                overflowY: offers?.length > 6 && "scroll",
                paddingRight: offers?.length > 6 && "5px",
              }}
            >
              <TableComponent
                rootClassName={theme && "offer-table-theme"}
                loading={{
                  spinning: offers === null,
                  indicator: <Bars />,
                }}
                tableData={offers}
                pagination={false}
                rowKey={(e) => `${e?.ckTransactionID}-${Number(e?.loanTime)}`}
                tableColumns={[
                  ...activeOffersColumns,
                  {
                    key: "action",
                    title: " ",
                    align: "center",
                    dataIndex: "borrow",
                    render: (_, obj) => {
                      const userOffer = userOffers?.find(
                        (predict) =>
                          predict.ckTransactionID === obj.ckTransactionID
                      );
                      return (
                        <CustomButton
                          className={`button-css ${
                            userOffer && "btn-disabled"
                          } ${theme ? "dashboardButtons-grey" : ""}`}
                          disabled={userOffer}
                          title={
                            <Flex align="center" justify="center" gap={10}>
                              <span
                                className={`${
                                  !theme && "light-color-primary"
                                } text-color-one font-weight-600 pointer iconalignment font-size-16`}
                              >
                                Borrow
                              </span>
                            </Flex>
                          }
                          onClick={() => {
                            let assets = [];
                            if (userAssets) {
                              assets = userAssets.filter(
                                (asset) =>
                                  asset.collectionName ===
                                  offerModalData.collectionName
                              );
                            }
                            toggleOfferModal();
                            toggleBorrowModal();
                            setBorrowModalData({
                              ...obj,
                              assets,
                              collateral: "",
                              canisterId: offerModalData.canisterId,
                              contentType: offerModalData.contentType,
                              thumbnailURI: offerModalData.thumbnailURI,
                              collectionName: offerModalData.collectionName,
                            });
                          }}
                        />
                      );
                    },
                  },
                ]}
              />
            </Col>
          </Row>
        </Col>

        {/* Active Loans */}
        <Col md={12}>
          <Row className="padding-5">
            <Col md={24} className="border border-radius-8">
              <Row justify={"center"} align={"middle"}>
                <Text
                  className={`${
                    theme ? "text-color-two" : "light-color-primary"
                  } font-small letter-spacing-small`}
                >
                  Active Loans
                </Text>
              </Row>
            </Col>

            <Col
              md={24}
              style={{
                maxHeight: "600px",
                // minHeight: "600px",
                // overflowY: offers?.length > 6 && "scroll",
                // paddingRight: offers?.length > 6 && "5px",
              }}
              className="mt-5"
            >
              <TableComponent
                rootClassName={theme && "offer-table-theme"}
                loading={{
                  spinning: false,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
                tableColumns={activeOffersColumns}
                tableData={[]}
                pagination={false}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </ModalDisplay>
  );
};

export default OffersModal;
