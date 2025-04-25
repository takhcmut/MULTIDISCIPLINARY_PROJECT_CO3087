// src/pages/manageDevice/ManageDevice.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ManageDevice.scss";

import ACIcon from "../../assets/ac_icon.png";
import PlusIcon from "../../assets/plus_icon.png";
import MinusIcon from "../../assets/delete_icon.png";

const API_BASE_URL = "http://localhost:8080/dadn/";
const ADA_BASE_URL = "https://io.adafruit.com/api/v2/BaoLong2004/feeds";
const GATEWAY_URL = "http://localhost:5000";

const ManageDevice = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [formMode, setFormMode] = useState(null)
  const [formValue, setFormValue] = useState("");
  const [formUsername, setFormUsername] = useState(""); // 👈 thêm state mới


  // 1) Fetch + poll
  useEffect(() => {
    let mounted = true;
    const fetchDevices = async () => {
      const username = localStorage.getItem("username");
      if (!username) return;

      try {
        const res = await fetch(`${API_BASE_URL}${username}/getequip`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        const mapped = await Promise.all(
          data.map(async (d) => {
            let stateValue = 0;
            try {
              const sensorRes = await fetch(
                `${ADA_BASE_URL}/${d.equipName}/data?limit=1`
              );
              const sensorData = await sensorRes.json();
              stateValue = Number(sensorData[0]?.value) || 0;
            } catch {}
            return {
              equipKey: d.equipKey,
              equipName: d.equipName,
              equipment_type: d.equipment_type,
              equipment_state: stateValue,
              icon: ACIcon,
            };
          })
        );

        if (mounted) setDevices(mapped);
      } catch {
        toast.error("Không thể tải danh sách thiết bị");
      }
    };

    fetchDevices();
    const iv = setInterval(fetchDevices, 500);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  // 2) Toggle on/off
  const handleToggleDevice = async (equipId, currentState, feed) => {
    const newState = currentState === 1 ? "0" : "1";
    try {
      await fetch(`${GATEWAY_URL}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed, status: newState }),
      });
      await fetch(
        `${API_BASE_URL}${localStorage.getItem("username")}/changeState/${equipId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      await fetch(
        `${API_BASE_URL}save?feed=${feed}&username=${localStorage.getItem("username")}`,
        { method: "POST" }
      );

      setDevices((prev) =>
        prev.map((d) =>
          d.equipKey.equipId === equipId
            ? { ...d, equipment_state: currentState === 1 ? 0 : 1 }
            : d
        )
      );
      toast.success("Đã chuyển trạng thái thiết bị");
    } catch {
      toast.error("Chuyển trạng thái thất bại");
    }
  };

  // 3) Add / Delete form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (formMode === "add") {
        const res = await fetch(
          `${API_BASE_URL}${formUsername}/addDevice/${formValue}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error();
        toast.success("Đã thêm thiết bị");
      } else if (formMode === "delete") {
        const res = await fetch(
          `${API_BASE_URL}${formUsername}/deleteDevice/${formValue}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error();
        toast.success("Đã xóa thiết bị");
        setDevices((prev) =>
          prev.filter((d) => d.equipKey.equipId.toString() !== formValue)
        );
      }
    } catch {
      toast.error("Yêu cầu thất bại");
    } finally {
      setFormMode(null);
      setFormValue("");
      setFormUsername("");
    }
  };
  

  return (
    <div className="manageDevice">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="deviceListContainer">
        <div className="deviceListHeader">
          <span className="listTitle">Danh sách thiết bị</span>
          <div className="headerActions">
            <button
              className="addDeviceBtn"
              onClick={() => {
                setFormMode("add");
                setFormValue("");
              }}
            >
              <img src={PlusIcon} alt="add" /> Thêm
            </button>
            <button
              className="deleteDeviceBtn"
              onClick={() => {
                setFormMode("delete");
                setFormValue("");
              }}
            >
              <img src={MinusIcon} alt="delete" /> Xóa
            </button>
          </div>
        </div>

        {/* === POPUP MODAL FORM === */}
        {formMode && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h2>
                {formMode === "add" ? "Thêm Thiết bị" : "Xóa Thiết bị"}
              </h2>
              <form onSubmit={handleFormSubmit}>
                <div className="formGroup">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>
                    {formMode === "add" ? "ID thiết bị mới" : "ID thiết bị cần xóa"}
                  </label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    required
                  />
                </div>
                <div className="formButtons">
                  <button type="submit">
                    {formMode === "add" ? "Thêm" : "Xóa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode(null);
                      setFormValue("");
                      setFormUsername(""); // 👈 reset luôn
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        <div className="deviceList">
          {devices.map((device) => (
            <div className="deviceItem" key={device.equipKey.equipId}>
              <img
                src={device.icon}
                alt="device-icon"
                className="deviceIcon"
              />
              <span className="deviceName">{device.equipment_type}</span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={device.equipment_state === 1}
                  onChange={() =>
                    handleToggleDevice(
                      device.equipKey.equipId,
                      device.equipment_state,
                      device.equipName
                    )
                  }
                />
                <span className="slider" />
              </label>

              <div className="deviceStatus">
                <span
                  className={`statusDot ${
                    device.equipment_state === 1 ? "on" : "off"
                  }`}
                />
                <span>
                  {device.equipment_state === 1
                    ? "Đang Bật"
                    : "Đang Tắt"}
                </span>
              </div>

              <button
                className="infoButton"
                onClick={() =>
                  navigate(`/device-info/${device.equipKey.equipId}`)
                }
              >
                Xem thông tin
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageDevice;
