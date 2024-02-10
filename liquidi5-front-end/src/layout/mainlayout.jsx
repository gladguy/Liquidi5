import { Col, Flex, Row, Typography } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import React from "react";
import Mainheader from "../container/header";
import Dashboard from "../pages/dashboard";
import { FaRegCopyright } from "react-icons/fa";

const MainLayout = () => {
  const { Text } = Typography;
  return (
    <React.Fragment>
      <Header className="header-sticky">
        <Row justify={"center"}>
          <Col xs={23}>
            <Mainheader />
          </Col>
        </Row>
      </Header>
      <Content style={{ backgroundColor: "#463B56", minHeight: "91.45vh" }}>
        <Row justify={"center"}>
          <Col xs={23}>
            <Dashboard />
          </Col>
        </Row>
      </Content>
      <Footer className="black-bg ">
        <Flex gap={10} justify={"center"} align={"center"}>
          <FaRegCopyright color="grey" size={17} />
          <Text className="grey-color font-medium">Liquidify</Text>
        </Flex>
      </Footer>
    </React.Fragment>
  );
};

export default MainLayout;
