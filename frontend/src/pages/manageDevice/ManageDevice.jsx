// src/pages/manageDevice/ManageDevice.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadCache, saveCache } from "../../utils/cache";
import "./ManageDevice.scss";

import ACIcon from "../../assets/ac_icon.png";
import PlusIcon from "../../assets/plus_icon.png";

const API_BASE_URL = "http://localhost:8080/dadn/"; // backend
const ADA_BASE_URL = "https://io.adafruit.com/api/v2/BaoLong2004/feeds";  //ada
const GATEWAY_URL = "http://localhost:5000";  // python gateway

const ManageDevice = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);

  // Toggle handler now accepts equipId (not some other id field)
  const handleToggleDevice = async (equipId, currentState, feed) => {
    console.log("Toggling device", equipId, "currentState:", currentState);
    const newState = currentState === 1 ? "0" : "1";
    const username = localStorage.getItem("username");
    try {
      const res = await fetch(`${GATEWAY_URL}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed, status: newState }),
      });
      // const changeStateResponse = await fetch(
      //   `${API_BASE_URL}${username}/changeState/${equipId}`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //     body: JSON.stringify({ status: newState }),
      //   }
      // );
      // const saveResponse = await fetch(
      //   `${API_BASE_URL}save?feed=${feed}&username=${username}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   }
      // );
      if (!changeStateResponse.ok) {
        console.error("Failed to change state:", await changeStateResponse.text());
        return;
      }
      if (!saveResponse.ok) {
        console.error("Failed to save:", await saveResponse.text());
        return;
      }
      console.log("State changed and saved successfully.");
      if (res.ok) {
        setDevices(prev =>
          prev.map(d =>
            d.equipKey.equipId === equipId 
              ? { ...d, equipment_state: currentState === 1 ? 0 : 1 }
              : d
          )
        );
      } else {
        console.error("Failed to toggle device:", await res.text());
      }
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  useEffect(() => {
    // 1) Define the fetchDevices function exactly as before
    const fetchDevices = async () => {
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("Username not found in localStorage.");
        return;
      }
  
      try {
        // Fetch metadata
        const response = await fetch(`${API_BASE_URL}${username}/getequip`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch devices");
        const data = await response.json();
  
        // Override each device.state with the live gateway value
        const mapped = await Promise.all(
          data.map(async (d) => {
            const feedName = d.equipName;
            let stateValue = 0;
  
            try {
              const sensorRes = await fetch(
                `${ADA_BASE_URL}/${feedName}/data?limit=1`,
              );
              if (!sensorRes.ok) throw new Error("Gateway read failed");
              const sensorData = await sensorRes.json();
              // console.log("Sensor data:", sensorData);
              stateValue = Number(sensorData[0].value);
              // console.log("State value:", stateValue);
            } catch (err) {
              console.warn(`Failed to read sensor state for ${feedName}:`, err);
            }
  
            return {
              equipKey: d.equipKey,
              equipName: feedName,
              equipment_type: d.equipment_type,
              equipment_state: stateValue,
              icon: ACIcon,
            };
          })
        );
  
        setDevices(mapped);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
  
    // 2) Kick off an immediate fetch…
    fetchDevices();
  
    // …then poll every 500 ms
    const intervalId = setInterval(fetchDevices, 500);
  
    // 3) Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  
 

  return (
    <div className="manageDevice">
      <div className="deviceListContainer">
        <div className="deviceListHeader">
          <span className="listTitle">Danh sách thiết bị</span>
          <button
            className="addDeviceBtn"
            onClick={() => alert("Add device logic here!")}
          >
            <img src={PlusIcon} alt="plus-icon" className="plusIcon" />
          </button>
        </div>

        <div className="deviceList">
          {devices.map(device => (
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
                  id={`toggle-${device.equipKey.equipId}`}
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
                  {device.equipment_state === 1 ? "Đang Bật" : "Đang Tắt"}
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
