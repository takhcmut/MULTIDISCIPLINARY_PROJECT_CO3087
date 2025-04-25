// src/pages/deviceInfo/DeviceInfo.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import RefreshIcon from "@mui/icons-material/Refresh";
import HistoryIcon from "@mui/icons-material/History";
import StatusIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import AccessAlarmsOutlinedIcon from '@mui/icons-material/AccessAlarmsOutlined';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { TextField, Button } from "@mui/material";

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';





import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./DeviceInfo.scss";

const API_BASE_URL = "http://localhost:8080/dadn";
const CONTROL_URL  = "http://localhost:5000/control";

export default function DeviceInfo() {
  const { id }     = useParams();         // numeric equipId
  const navigate   = useNavigate();
  const username   = localStorage.getItem("username");
  const token      = localStorage.getItem("token");

  // human‑readable feed name, loaded from your /getequip endpoint
  const [feedName, setFeedName] = useState(null);
  const [tempLimit, setTempLimit]                 = useState(null);
  const [brightnessLimit, setBrightnessLimit]     = useState(null);

  // history & sensor state
  const [historyList, setHistoryList]       = useState([]);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [temperature, setTemperature]       = useState(null);
  const [brightness, setBrightness]         = useState(null);
  const [sensorState, setSensorState]       = useState(null);

  // config + alarms
  const [isEditingConfig, setIsEditingConfig]     = useState(false);
  const [isAutoCheckEnabled, setIsAutoCheckEnabled] = useState(true);
  const [isTempOver, setIsTempOver]               = useState(false);
  const [isBrightnessOver, setIsBrightnessOver]   = useState(false);

  const [hasSavedConfig, setHasSavedConfig] = useState(false);
  var warningCount = 0;
  // const [warningCount, setWarningCount] = useState(0);
  

const [timerAction, setTimerAction] = useState("on"); // "on" hoặc "off"



const [absoluteTime, setAbsoluteTime] = useState(dayjs());



  

  // 1) Load config from localStorage
  useEffect(() => {
    async function loadName() {
      if (!username || !token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/${username}/getequip`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const list = await res.json();
        const found = list.find(d => d.equipKey.equipId === Number(id));
        if (found) {
          setFeedName(found.equipName);
          setTempLimit(found.tempLimit);
          setBrightnessLimit(found.lightLimit);
        }
      } catch (e) {
        console.warn("Failed to load device name", e);
      }
    }
    loadName();
  }, [id, username, token]);
  
  const loadHistory = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/${username}/gethistory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistoryList(data.reverse());
    } catch (e) {
      console.error("History error", e);
    } finally {
      setIsRefreshing(false);
    }
  };
  // 2) Fetch history
  useEffect(() => {
    loadHistory();
  }, [id, username, token]);
  
  // 3) Poll temperature & brightness
  useEffect(() => {
    const iv = setInterval(() => {
      async function fetchSensor() {
        try {
          const [tRes,bRes] = await Promise.all([
            fetch("https://io.adafruit.com/api/v2/BaoLong2004/feeds/cambien1/data?limit=1"),
            fetch("https://io.adafruit.com/api/v2/BaoLong2004/feeds/cambien2/data?limit=1")
          ]);
          const tJ = await tRes.json(), bJ = await bRes.json();
          setTemperature(Number(tJ[0]?.value));
          setBrightness(Number(bJ[0]?.value));
        } catch (e) {
          console.error("Sensor fetch failed", e);
        }
      }
      fetchSensor();
    }, 10000);
    return () => clearInterval(iv);
  }, []);
  


    useEffect(() => {
      const iv = setInterval(() => {
        async function fetchState() {
          try {
            
            const res = await fetch(`https://io.adafruit.com/api/v2/BaoLong2004/feeds/${feedName}/data?limit=1`);
            const j = await res.json();
            setSensorState(Number(j[0]?.value));
          } catch (e) {
            console.error("State fetch failed", e);
          }
        }
        fetchState();
      }, 1000);
      return () => clearInterval(iv);
    }, [id, feedName]);
    
    

  // save config to backend + local
  const handleSaveLimits = async () => {
    localStorage.setItem(
      `config_${username}_${id}`,
      JSON.stringify({ temp: tempLimit, brightness: brightnessLimit })
    );
    setIsEditingConfig(false);
    try {
      await fetch(
        `${API_BASE_URL}/changeLimit/${id}?tempLimit=${tempLimit}&lightLimit=${brightnessLimit}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
      );
      toast.success("Cấu hình đã được lưu!");
      setHasSavedConfig(true); // 🟢 Cho phép bắt đầu check
    } catch {
      toast.error("Lỗi khi lưu cấu hình.");
    }
  };

  // helper: turn off device if currently on
  const turnOffDevice = async () => {
    if (sensorState !== 1 || !feedName) return;
    console.log("Auto‑shutdown triggered for", feedName);
    try {
      // 1) physical
      await fetch(CONTROL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed: feedName, status: "0" })
      });
     
      toast.info("Thiết bị đã tự tắt vì vượt giới hạn!");
    } catch (e) {
      console.error("Auto‑shutdown failed", e);
    }
  };
  // 6) auto‑check logic
  useEffect(() => {
    if (!isAutoCheckEnabled || isEditingConfig || sensorState === 0) return;
      function check() {
        let turnOff = false;
        
        if (temperature > tempLimit) {
          setIsTempOver(true);
          toast.warning("Nhiệt độ vượt giới hạn!");
          turnOff = true;
        } else {
          setIsTempOver(false);
        }
        
        if (brightness > brightnessLimit) {
          setIsBrightnessOver(true);
          toast.warning("Độ sáng vượt giới hạn!");
          turnOff = true;
        } else {
          setIsBrightnessOver(false);
        }
        
        if (turnOff) {
          turnOffDevice();
        }
      }
      check();
  }, [
    isAutoCheckEnabled,
    isEditingConfig,
    sensorState,
    temperature,
    brightness,
    tempLimit,
    brightnessLimit
  ]);
  
  // 7) Timer check
  useEffect(() => {
    const checkTimer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/getSche/${id}`);
        const data = await res.json();
        console.log("GET Response:", data);
    
        const timestampStr = data?.scheduleKey?.timestamp;
        const actionState = data?.state;
    
        if (!timestampStr || !actionState) {
          console.log("❌ Thiếu timestamp hoặc state");
          return;
        }
    
        const scheduledTime = dayjs(timestampStr);
        const now = dayjs();
    
        console.log("⏰ Now:", now.format());
        console.log("🗓️ Scheduled:", scheduledTime.format());
    
        if (now.isAfter(scheduledTime)) {
          const action = actionState === "On" ? "1" : "0";
          console.log("📤 Sending control:", action);
          await fetch(CONTROL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feed: feedName, status: action })
          });
          toast.success(`Thiết bị đã được ${action === "1" ? "bật" : "tắt"} theo lịch`);
        } else {
          console.log("⏳ Chưa tới giờ");
        }
    
      } catch (e) {
        console.error("❌ Timer check failed", e);
      }
    };
    
  
    const interval = setInterval(checkTimer, 10000); // mỗi 10 giây kiểm tra
    return () => clearInterval(interval);
  }, [id, feedName]);
  
  

  return (
    <div className="deviceInfo">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="deviceInfoHeader">
        <div className="headerLeft">
          <KeyboardReturnIcon
            className="returnIcon"
            onClick={() => navigate(-1)}
          />
          <h1>Quản lý thiết bị</h1>
        </div>
        <div className="headerRight">
          <button
            className="refreshBtn"
            onClick={() => loadHistory()}
            disabled={isRefreshing}
          >
            <RefreshIcon />{" "}
            {isRefreshing ? "Đang làm mới..." : "Làm mới"}
          </button>
          <button
            className="editBtn"
            onClick={() => {
              if (isEditingConfig) handleSaveLimits();
              else setIsEditingConfig(true);
            }}
          >
            {isEditingConfig ? "Lưu" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      <div className="deviceInfoBody">
        {/* STATUS */}
        <div className="statusBlock deviceInfoCard">
          <div className="deviceInfoCardHeader">
            <StatusIcon />
            <h1>Tình Trạng</h1>
          </div>
          <hr />
          <div className="deviceInfoCardBody">
          <div>
            <strong>Trạng thái Hoạt Động:</strong>{" "}
            <span
              style={{
                color: sensorState === 1 ? "green" : sensorState === 0 ? "red" : "black",
                fontWeight: "bold"
              }}
            >
              {sensorState === 1
                ? "Đang Bật"
                : sensorState === 0
                ? "Đang Tắt"
                : "N/A"}
            </span>
          </div>

            <div>
              <strong>Nhiệt độ hiện tại:</strong>{" "}
              {temperature != null ? `${temperature}°C` : "N/A"}
              {isTempOver && <ErrorOutlineIcon className="overLimitIcon" />}
            </div>
            <div>
              <strong>Độ sáng hiện tại:</strong>{" "}
              {brightness != null ? `${brightness}%` : "N/A"}
              {isBrightnessOver && <ErrorOutlineIcon className="overLimitIcon" />}
            </div>
          </div>
        </div>

        {/* CONFIG */}
        <div className="deviceInfoCard">
          <div className="deviceInfoCardHeader">
            <TuneIcon />
            <h1>Cấu hình</h1>
          </div>
          <hr />
          <div className="deviceInfoCardBody">
            <div className="configItem">
              <strong>Giới hạn Nhiệt độ:</strong>{" "}
              {isEditingConfig ? (
                <input
                  type="number"
                  value={tempLimit}
                  onChange={e => setTempLimit(Number(e.target.value))}
                />
              ) : (
                <span>{tempLimit}°C</span>
              )}
            </div>
            <div className="configItem">
              <strong>Giới hạn Độ sáng:</strong>{" "}
              {isEditingConfig ? (
                <input
                  type="number"
                  value={brightnessLimit}
                  onChange={e => setBrightnessLimit(Number(e.target.value))}
                />
              ) : (
                <span>{brightnessLimit}%</span>
              )}
            </div>
            <div className="configItem">
              <strong>Tự động kiểm tra:</strong>{" "}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isAutoCheckEnabled}
                  onChange={() => setIsAutoCheckEnabled(v => !v)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* TIMER */}
        <div className="deviceInfoCard">
          <div className="deviceInfoCardHeader">
            <AccessAlarmsOutlinedIcon />
            <h1>Hẹn Giờ</h1>
          </div>
          <hr />
          <div className="deviceInfoCardBody">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="timerItem">
                <DateTimePicker
                  label="Chọn ngày giờ"
                  value={absoluteTime}
                  onChange={(newVal) => setAbsoluteTime(newVal)}
                  sx={{ width: "100%" }}
                />
                
          <ToggleButtonGroup
            value={timerAction}
            exclusive
            onChange={(e, newAction) => {
              if (newAction !== null) setTimerAction(newAction);
            }}
            sx={{ mt: 2 }}
          >
            <ToggleButton value="on">Bật</ToggleButton>
            <ToggleButton value="off">Tắt</ToggleButton>
          </ToggleButtonGroup>

    
        <Button
          fullWidth
          variant="contained"
          onClick={async () => {
            const now = dayjs();
            if (absoluteTime.diff(now) <= 0) {
              toast.error("Giờ đã chọn đã qua rồi!");
              return;
            }
          
            const formattedTime = absoluteTime.format("YYYY-MM-DD HH:mm:ss");
            const action = timerAction === "on" ? "On" : "Off";
          
            try {
              await fetch(`${API_BASE_URL}/newsche?EquipId=${id}&state=${action}&time=${formattedTime}`, {
                method: "POST",
              });
              toast.success(`Đã đặt lịch ${action} vào ${absoluteTime.format("HH:mm DD/MM/YYYY")}`);
            } catch (e) {
              toast.error("Lỗi khi đặt lịch!");
              console.error(e);
            }
          }
          }
          sx={{ mt: 2 }}
        >
          Đặt hẹn giờ
              </Button>
            </div>
          </LocalizationProvider>
        </div>
      </div>

  


        {/* HISTORY */}
        <div className="deviceInfoCard">
          <div className="deviceInfoCardHeader">
            <HistoryIcon />
            <h1>Lịch sử Thiết Bị</h1>
          </div>
          <hr />
          <div className="deviceInfoCardBody">
            {historyList.length === 0 ? (
              <div>Không có bản ghi nào.</div>
            ) : (
              historyList.map((h, i) => (
                <div key={i} className="historyItem">
                  <div>
                    <strong>Thời gian:</strong>{" "}
                    {new Date(h.updateTime).toLocaleString()}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> {h.equipment_state}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
