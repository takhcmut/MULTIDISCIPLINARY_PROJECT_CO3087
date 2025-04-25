import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import "./Profile.scss";

const Profile = () => {
  return (
    <div className="profilePage">
      <div className="accountContainer">
        <h2 className="accountTitle">Tài khoản của tôi</h2>

        <div className="infoCard">
          <div className="infoCardHeader">
            <PersonIcon />
            <h3>Thông tin của tôi</h3>
          </div>
          <hr />
          <div className="infoCardBody">
            <p>
              <strong>Họ và tên:</strong> Nguyễn Văn A
            </p>
            <p>
              <strong>Số điện thoại:</strong> 098765432
            </p>
            <p>
              <strong>Địa chỉ:</strong> Tổ 1, Phường 2, Quận 3, Tp.HCM
            </p>
          </div>
        </div>

        <div className="infoCard">
          <div className="infoCardHeader">
            <SettingsIcon />
            <h3>Thông tin tài khoản</h3>
          </div>
          <hr />
          <div className="infoCardBody">
            <p>
              <strong>Email:</strong> dacnpm@hcmut.edu.vn
            </p>
            <p>
              <strong>Số thiết bị:</strong> 9
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
