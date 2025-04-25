import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Leftbar from "../../components/leftbar/Leftbar";
import windTurbine from "../../assets/wind_power.png";
import leaves from "../../assets/leaves.png";
import "./MainLayout.scss";

const MainLayout = ({ children }) => {
  const [isLeftbarVisible, setIsLeftbarVisible] = useState(true);

  const toggleLeftbar = () => {
    setIsLeftbarVisible((prev) => !prev);
  };

  return (
    <div className="mainLayout">
      <img src={windTurbine} alt="Wind Turbine" className="bgWindTurbine" />
      <img src={leaves} alt="Leaves" className="bgLeaves" />

      <Navbar toggleLeftbar={toggleLeftbar} />
      <div className="layoutContent">
        <Leftbar isHidden={!isLeftbarVisible} />
        <div className="pageContent">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
