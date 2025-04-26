import React from "react";
import "./Navbar.scss";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate, useLocation } from "react-router-dom";


const Navbar = ({ toggleLeftbar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  

  const pageTitles = {
    "/manage-device": "Quản lý thiết bị",
    "/history": "Lịch sử thiết bị",
    "/profile": "Trang cá nhân",
    "/device-info": "Thông tin thiết bị",
    "/dashborad": "Dashboard",
    "/": "BKSmart Home",
  };


  const currentPageTitle = pageTitles[location.pathname] || "BKSmart Home";

  return (
    <div className="navbar">
      <div className="leftNavbar">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/d/de/HCMUT_official_logo.png"
          alt="BK Logo"
          className="bkLogo"
        />
        <Link to="/" className="appName">
          BKSmart<br />Home
        </Link>
        <button className="menuButton" onClick={toggleLeftbar}>
          <MenuIcon />
        </button>
      </div>

      {/* Show the page title in the center or wherever you want */}
      <div className="currentPage">
        <span>{currentPageTitle}</span>
      </div>

      <div className="rightNavbar" 
      // onClick={() => navigate("/profile")}
      >
        <img
          src="https://www.w3schools.com/howto/img_avatar.png"
          alt="User"
          className="userAvatar"
        />
        <span className="userName">{username}</span>
      </div>
    </div>
  );
};

export default Navbar;
