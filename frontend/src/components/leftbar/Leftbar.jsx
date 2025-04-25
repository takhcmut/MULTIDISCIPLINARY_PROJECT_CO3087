import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Leftbar.scss";
import { useContext } from "react";
import { AuthContext } from "../../router/AuthContext";
import HomeIcon from "../../assets/home_icon.png";
import MonitorIcon from "../../assets/monitor_icon.png";
import HistoryIcon from "../../assets/file_icon.png";
import ProfileIcon from "../../assets/user_icon.png";
import LogoutIcon from "../../assets/exit_icon.png";

const Leftbar = ({ isHidden }) => {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  // Track which path is currently active
  const [activePath, setActivePath] = useState("/dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuth");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("cache");
    setToken(null);
    navigate("/");
  };

  // Helper function to navigate & set active
  const handleNavigate = (path) => {
    setActivePath(path);
    navigate(path);
  };

  return (
    <div className={`leftBar ${isHidden ? "hidden" : "visible"}`}>
      <div className="leftBarContainer">
        <div className="leftBarMenu">
          <button
            className={`leftBarItem ${activePath === "/dashboard" ? "active" : ""}`}
            onClick={() => handleNavigate("/dashboard")}
          >
            <img src={HomeIcon} alt="Home icon" />
            <span>Dashboard</span>
          </button>

          <button
            className={`leftBarItem ${
              activePath === "/manage-device" ? "active" : ""
            }`}
            onClick={() => handleNavigate("/manage-device")}
          >
            <img src={MonitorIcon} alt="Monitor icon" />
            <span>Quản lý thiết bị</span>
          </button>

          <button
            className={`leftBarItem ${activePath === "/history" ? "active" : ""}`}
            onClick={() => handleNavigate("/history")}
          >
            <img src={HistoryIcon} alt="History icon" />
            <span>Lịch sử thiết bị</span>
          </button>

          <button
            className={`leftBarItem ${activePath === "/profile" ? "active" : ""}`}
            onClick={() => handleNavigate("/profile")}
          >
            <img src={ProfileIcon} alt="Profile icon" />
            <span>Trang cá nhân</span>
          </button>

          <button className="leftBarItem logoutBtn" onClick={handleLogout}>
            <img src={LogoutIcon} alt="Logout icon" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leftbar;
