import { Spin } from "antd";
import { useSelector } from "react-redux";

const LoadingWrapper = ({ children }) => {
  const loading = useSelector((state) => state.constant.isLoading);
  return (
    <Spin
      style={{ zIndex: 2 }}
      className="loader"
      indicator={
        <div className="loader-container">
          <div className="loader-text">
            <span>L</span>
            <span>I</span>
            <span>Q</span>
            <span>U</span>
            <span>I</span>
            <span>D</span>
            <span>I</span>
            <span>F</span>
            <span>Y</span>
          </div>

          <div class="box-cointainer">
            <div class="box-load1"></div>
            <div class="box-load2"></div>
            <div class="box-load3"></div>
          </div>
        </div>
        // <img
        //   className="image"
        //   src={liquidify}
        //   alt="loader"
        //   width={150}
        //   height={150}
        // />
      }
      spinning={loading}
    >
      {children}
    </Spin>
  );
};

export default LoadingWrapper;
