// src/pages/deviceInfo/DeviceInfo.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import RefreshIcon from "@mui/icons-material/Refresh";
import HistoryIcon from "@mui/icons-material/History";
import StatusIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import AccessAlarmsOutlinedIcon from "@mui/icons-material/AccessAlarmsOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadCache, saveCache } from "../../utils/cache";
import "./DeviceInfo.scss";

const API_BASE_URL = "http://localhost:8080/dadn";
const CONTROL_URL  = "http://localhost:5000/control";

export default function DeviceInfo() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const username   = localStorage.getItem("username");
  const token      = localStorage.getItem("token");

  // Device & limits
  const [feedName, setFeedName]       = useState(null);
  const [tempLimit, setTempLimit]     = useState(null);
  const [brightnessLimit, setBrightnessLimit] = useState(null);

  // Sensors + history raw
  const [historyList, setHistoryList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [temperature, setTemperature]   = useState(null);
  const [brightness, setBrightness]     = useState(null);
  const [sensorState, setSensorState]   = useState(null);

  // Config toggles
  const [isEditingConfig, setIsEditingConfig]     = useState(false);
  const [isAutoCheckEnabled, setIsAutoCheckEnabled] = useState(true);
  const [isTempOver, setIsTempOver]               = useState(false);
  const [isBrightnessOver, setIsBrightnessOver]   = useState(false);

  // Timer
  const [absoluteTime, setAbsoluteTime] = useState(dayjs());
  const [timerAction, setTimerAction]   = useState("on");

  // Sorting & pagination
  const [sortKey, setSortKey]       = useState("updateTime");
  const [sortOrder, setSortOrder]   = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.ceil(historyList.length / pageSize);

  // 1) Load feedName & limits
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      if (!username || !token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/${username}/getequip`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const list = await res.json();
        const me = list.find(d => d.equipKey.equipId === +id);
        if (me) {
          setFeedName(me.equipName);
          setTempLimit(me.tempLimit);
          setBrightnessLimit(me.lightLimit);
        }
      } catch (err) {
        console.error("Failed to fetch device info", err);
      }
    };
  
    fetchDeviceInfo();
  }, [id, username, token]);
  

  // 2) Fetch history
    const loadHistory = async () => {
        setIsRefreshing(true);
        try {
          const res  = await fetch(`${API_BASE_URL}/${username}/gethistory/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setHistoryList(data);
          setCurrentPage(1);
        } catch (e) {
          console.error(e);
        } finally {
          setIsRefreshing(false);
        }
      };
    
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
  

  // 8) Sort + paginate history
  const paginated = useMemo(() => {
    const sorted = [...historyList].sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "updateTime":
          av = new Date(a.updateTime);
          bv = new Date(b.updateTime);
          break;
        case "username":
          av = a.username.toLowerCase();
          bv = b.username.toLowerCase();
          break;
        case "equipment_state":
          av = a.equipment_state.toLowerCase();
          bv = b.equipment_state.toLowerCase();
          break;
        default:
          return 0;
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [historyList, sortKey, sortOrder, currentPage]);
  
  const toggleSort = key => {
    if (sortKey === key) {
      setSortOrder(o => o === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };
  const sortIcon = key => sortKey !== key ? "↕" : (sortOrder === "asc" ? "▲" : "▼");

  // Pagination window
  const pages = [];
  const startP = Math.max(1, currentPage-2);
  const endP   = Math.min(pageCount, currentPage+2);
  for(let p=startP;p<=endP;p++) pages.push(p);

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
            <HistoryIcon /><h1>Lịch sử Thiết Bị</h1>
          </div>
          <hr/>
          <div className="deviceInfoCardBody">
            {isRefreshing
              ? <div>Đang tải...</div>
              : paginated.length === 0
                ? <div>Không có bản ghi nào.</div>
                : <>
                    <table className="historyTable">
                      <thead>
                        <tr>
                          <th onClick={() => toggleSort("username")}>
                            Người Dùng {sortIcon("username")}
                          </th>
                          <th onClick={() => toggleSort("updateTime")}>
                            Thời Gian {sortIcon("updateTime")}
                          </th>
                          <th onClick={() => toggleSort("equipment_state")}>
                            Trạng Thái {sortIcon("equipment_state")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((h, i) => (
                          <tr key={i}>
                            <td>{h.username}</td>
                            <td>{new Date(h.updateTime).toLocaleString()}</td>
                            <td>{h.equipment_state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="pagination">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                        « Đầu
                      </button>
                      {pages.map(p => (
                        <button
                          key={p}
                          className={p === currentPage ? "active" : ""}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(pageCount)} disabled={currentPage === pageCount}>
                        Cuối »
                      </button>
                    </div>
                  </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
